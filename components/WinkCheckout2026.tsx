"use client";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import WinkPageFrame2026 from "./WinkPageFrame2026";
import {
  createClientId,
  API_URL,
  CONTACT_URL,
  CartLine,
  configText,
  isConfirmedOrder,
  kemerovoDate,
  money,
  normalizePhone,
  parseCatalog,
  personalizationErrors,
  priceFor,
  readCart,
  readDelivery,
  validDeliveryDate,
  writeCart,
} from "@/lib/wink-shop";
import { useWinkCatalog } from "@/lib/use-wink-catalog";
import { useWinkAddons } from "@/lib/use-wink-addons";
import {
  AddonCatalog,
  addonPrice,
  deliveryRequirements,
} from "@/lib/wink-addons";
import { validateAddonCart } from "@/lib/wink-addon-cart";
import { SHOP_EVENT } from "@/lib/wink-shop";
import { AddonRecommendations, addonEvent } from "./WinkAddons";
import { WINK_DEMO } from "@/lib/wink-mode";
const IDEM_KEY = "wink-v4-idempotency";
type Order = { number: string; public_token: string; status?: string };
const initial = {
  gift: true,
  surprise: true,
  anonymous: false,
  recipientName: "",
  recipientPhone: "",
  senderName: "",
  message: "",
  address: "",
  date: "",
  slot: "Удобное время согласуем",
  exactTime: "",
  leaveAtDoor: false,
  customerName: "",
  customerPhone: "",
};

export default function WinkCheckout2026() {
  const { catalog: addonCatalog } = useWinkAddons();
  const { catalog: mainCatalog } = useWinkCatalog();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [fields, setFields] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [demoReceipt, setDemoReceipt] = useState<CartLine[] | null>(null);
  const pending = useRef(false);
  const retry = useRef<{ fingerprint: string; key: string } | null>(null);
  useEffect(() => {
    try {
      setCart(readCart());
      const intent = readDelivery();
      setFields((current) => ({
        ...current,
        date: intent.date && validDeliveryDate(intent.date) ? intent.date : "",
        address: intent.address || "",
      }));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Не удалось прочитать корзину.",
      );
    }
    setReady(true);
    function sync() {
      try {
        setCart(readCart());
      } catch {
        setError("Не удалось прочитать обновлённую корзину.");
      }
    }
    window.addEventListener(SHOP_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHOP_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.unitPriceMinor * line.qty, 0),
    [cart],
  );
  const requirements = deliveryRequirements(
    cart.filter((l) => l.addon).map((l) => ({ product_id: l.addon!.id })),
    addonCatalog.items,
  );
  const mainLine = cart.find((l) => !l.addon);
  const mainProduct = mainCatalog.products.find(
    (p) => p.slug === mainLine?.productId,
  );
  function field<K extends keyof typeof initial>(
    key: K,
    value: (typeof initial)[K],
  ) {
    setFields((current) => ({ ...current, [key]: value }));
  }
  function updateCart(next: CartLine[]) {
    try {
      writeCart(next);
      setCart(next);
      setError("");
    } catch {
      setError("Не удалось сохранить изменения корзины. Попробуйте ещё раз.");
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setError("");
    const customerPhone = normalizePhone(fields.customerPhone);
    const recipientPhone = normalizePhone(fields.recipientPhone);
    if (!cart.length) {
      setError("В корзине пока нет композиций.");
      return;
    }
    if (fields.customerName.trim().length < 2 || !customerPhone) {
      setError("Укажите ваше имя и российский телефон: +7 и 10 цифр.");
      return;
    }
    if (
      fields.gift &&
      (fields.recipientName.trim().length < 2 || !recipientPhone)
    ) {
      setError("Укажите имя и телефон получателя: +7 и 10 цифр.");
      return;
    }
    if (fields.address.trim().length < 5) {
      setError("Укажите улицу, дом и квартиру или название отеля.");
      return;
    }
    if (!validDeliveryDate(fields.date)) {
      setError("Выберите сегодняшнюю или будущую дату доставки.");
      return;
    }
    if (fields.slot === "Точное время" && !fields.exactTime) {
      setError("Укажите желаемое время доставки.");
      return;
    }
    pending.current = true;
    setSubmitting(true);
    try {
      let catalog = mainCatalog;
      if (!WINK_DEMO) {
        const catalogResponse = await fetch(`${API_URL}/api/catalog`, {
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });
        if (!catalogResponse.ok)
          throw new Error(
            "Не удалось проверить стоимость заказа. Попробуйте ещё раз или напишите нам.",
          );
        catalog = parseCatalog(await catalogResponse.json());
      }
      const latest = readCart();
      if (JSON.stringify(latest) !== JSON.stringify(cart)) {
        setCart(latest);
        throw new Error(
          "Корзина изменилась в другой вкладке. Проверьте состав перед отправкой.",
        );
      }
      let freshAddons = addonCatalog;
      if (cart.some((l) => l.addon)) {
        if (!WINK_DEMO) {
          const response = await fetch(`${API_URL}/api/addons`, {
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
          });
          if (!response.ok)
            throw new Error(
              "Не удалось проверить дополнения. Корзина сохранена. Попробуйте ещё раз.",
            );
          freshAddons = (await response.json()) as AddonCatalog;
        }
        if (
          freshAddons.version !== 1 ||
          !freshAddons.checkout_enabled ||
          !Array.isArray(freshAddons.items)
        )
          throw new Error("Заказ дополнений пока недоступен.");
        validateAddonCart(cart, freshAddons);
        const needs = deliveryRequirements(
          cart.filter((l) => l.addon).map((l) => ({ product_id: l.addon!.id })),
          freshAddons.items,
        );
        if (fields.date < kemerovoDate(new Date(), needs.days))
          throw new Error(
            `Для этого заказа выберите дату не раньше ${kemerovoDate(new Date(), needs.days)}.`,
          );
      }
      const priced = cart.map((line) => {
        if (line.addon) {
          const a = freshAddons.items.find((a) => a.id === line.addon!.id)!;
          return {
            ...line,
            unitPriceMinor: addonPrice(a, line.addon.personalization),
          };
        }
        const product = catalog.products.find((p) => p.slug === line.productId);
        if (!product)
          throw new Error(
            `«${line.subtitle}» сейчас недоступен. Уберите его из корзины или выберите другой набор.`,
          );
        const problems = personalizationErrors(product, line.config);
        if (problems.length)
          throw new Error(
            `${line.subtitle}: ${problems[0]} Откройте «Изменить» у этой позиции.`,
          );
        if (
          line.config.addons.some(
            (code) => !catalog.modifiers.some((m) => m.code === code),
          )
        )
          throw new Error(
            "Дополнение больше недоступно. Измените композицию перед оформлением.",
          );
        return {
          ...line,
          unitPriceMinor: priceFor(product, line.config, catalog),
        };
      });
      if (
        priced.some(
          (line, index) => line.unitPriceMinor !== cart[index].unitPriceMinor,
        )
      ) {
        writeCart(priced);
        setCart(priced);
        throw new Error(
          "Стоимость композиции обновилась. Проверьте новую сумму и отправьте заявку ещё раз.",
        );
      }
      if (WINK_DEMO) {
        // Keep the preview entirely local; no order ID, token, payment,
        // customer-data persistence, inventory mutation or purchase event.
        setDemoReceipt(structuredClone(priced));
        return;
      }
      let utm: Record<string, string | null> = {};
      try {
        utm = JSON.parse(
          window.sessionStorage.getItem("wink-attribution") || "{}",
        );
      } catch {}
      const payload = {
        customer: { name: fields.customerName.trim(), phone: customerPhone },
        gift: {
          forSomeone: fields.gift,
          recipientName: fields.gift ? fields.recipientName.trim() : "",
          recipientPhone: fields.gift ? recipientPhone : "",
          anonymous: fields.gift && fields.anonymous,
          senderName:
            fields.gift && !fields.anonymous ? fields.senderName.trim() : "",
          dontCall: fields.gift && fields.surprise,
          message: "",
        },
        delivery: {
          date: fields.date,
          slot:
            fields.slot === "Точное время"
              ? `Желаемое время ${fields.exactTime}`
              : fields.slot,
          address: fields.address.trim(),
          courierComment: [
            fields.leaveAtDoor
              ? "Оставить у двери только после согласования с покупателем."
              : "",
            fields.message.trim(),
          ]
            .filter(Boolean)
            .join(" "),
        },
        items: cart.map((line) =>
          line.addon
            ? {
                addon_id: line.addon.id,
                quantity: line.qty,
                purchase_context: line.addon.purchase_context,
                main_slug: line.addon.parent_product_id || mainLine?.productId,
                personalization: line.addon.personalization,
              }
            : { productId: line.productId, qty: line.qty, config: line.config },
        ),
        source: "wink-site-2026",
        utm,
      };
      const fingerprint = JSON.stringify(payload);
      let key =
        retry.current?.fingerprint === fingerprint ? retry.current.key : "";
      if (!key) {
        try {
          const stored = JSON.parse(
            window.localStorage.getItem(IDEM_KEY) || "null",
          );
          if (
            stored?.fingerprint === fingerprint &&
            typeof stored.key === "string"
          )
            key = stored.key;
        } catch {}
      }
      if (!key) key = createClientId();
      retry.current = { fingerprint, key };
      try {
        window.localStorage.setItem(IDEM_KEY, JSON.stringify(retry.current));
      } catch {}
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, idempotency_key: key }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !isConfirmedOrder(data?.order))
        throw new Error(
          "Не получили подтверждение заказа. Корзина сохранена. Повторите отправку или уточните статус у нас.",
        );
      setOrder(data.order);
      setCart([]);
      try {
        writeCart([]);
      } catch {}
      try {
        window.localStorage.setItem(
          "wink-last-order",
          JSON.stringify(data.order),
        );
        window.localStorage.removeItem(IDEM_KEY);
      } catch {}
      window.dispatchEvent(
        new CustomEvent("wink-order-created", { detail: { value: total } }),
      );
    } catch (reason) {
      const message =
        reason instanceof Error &&
        !["TimeoutError", "AbortError", "TypeError"].includes(reason.name)
          ? reason.message
          : "Не удалось связаться с WINK. Корзина сохранена — попробуйте ещё раз или напишите нам.";
      setError(message);
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }
  if (!ready)
    return (
      <WinkPageFrame2026>
        <main className="wk-empty" aria-busy="true">
          <p>Открываем вашу корзину…</p>
        </main>
      </WinkPageFrame2026>
    );
  if (demoReceipt)
    return (
      <WinkPageFrame2026>
        <main className="wk-success">
          <p className="wk-eyebrow">Демонстрация оформления</p>
          <h1>
            Тест пройден.
            <br />
            Заказ не отправлен.
          </h1>
          <p>
            Состав и персонализация проверены. Деньги не списывались, товары не
            резервировались, WINK не получил заявку. Ваши контактные данные
            никуда не отправлены.
          </p>
          {demoReceipt.map((line) => (
            <article className="wk-cart-line" key={line.lineId}>
              <div>
                <h3>
                  {line.subtitle} × {line.qty}
                </h3>
                <p>{configText(line.config)}</p>
                {line.addon && (
                  <>
                    <p>{line.addon.sku}</p>
                    <p>
                      {Object.values(line.addon.personalization).join(" · ")}
                    </p>
                    <p>
                      {line.addon.components
                        .map((c) => `${c.name} × ${c.quantity}`)
                        .join(" · ")}
                    </p>
                  </>
                )}
              </div>
              <strong>{money(line.unitPriceMinor * line.qty)}</strong>
            </article>
          ))}
          <p>
            Тестовая сумма товаров:{" "}
            <strong>
              {money(
                demoReceipt.reduce(
                  (sum, line) => sum + line.unitPriceMinor * line.qty,
                  0,
                ),
              )}
            </strong>
            . Доставка не рассчитана.
          </p>
          <button className="wk-button" onClick={() => setDemoReceipt(null)}>
            Вернуться к тестовой корзине
          </button>
        </main>
      </WinkPageFrame2026>
    );
  if (order)
    return (
      <WinkPageFrame2026>
        <main className="wk-success">
          <p className="wk-eyebrow">Заявка № {order.number}</p>
          <h1>
            Ваш красивый момент
            <br />
            стал на шаг ближе.
          </h1>
          <p>
            Заявка сохранена. Согласуем состав, доступную дату, стоимость
            доставки и способ оплаты. Пока дата не подтверждена, она остаётся
            пожеланием.
          </p>
          <p>
            Статус можно проверить по ссылке. Если нужно обсудить детали сейчас,
            напишите нам номер заявки.
          </p>
          <div className="wk-actions">
            <Link
              className="wk-button"
              href={`/order/?token=${encodeURIComponent(order.public_token)}`}
            >
              Следить за заказом
            </Link>
            <a
              className="wk-button secondary"
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Написать WINK
            </a>
          </div>
        </main>
      </WinkPageFrame2026>
    );
  if (!cart.length)
    return (
      <WinkPageFrame2026>
        <main className="wk-empty">
          <p className="wk-eyebrow">Ваш WINK</p>
          <h1>
            Здесь будет
            <br />
            чей-то хороший день.
          </h1>
          <p>Выберите композицию и добавьте то, что делает её личной.</p>
          {error && (
            <p className="wk-error" role="alert">
              {error}
            </p>
          )}
          <Link className="wk-button" href="/shop">
            Выбрать композицию
          </Link>
          <Link className="wk-button secondary" href="/#finder">
            Помочь с выбором
          </Link>
          {error && (
            <button className="wk-text-button" onClick={() => updateCart([])}>
              Начать новую корзину
            </button>
          )}
        </main>
      </WinkPageFrame2026>
    );
  return (
    <WinkPageFrame2026>
      <main className="wk-checkout">
        <div className="wk-checkout-head">
          {WINK_DEMO && (
            <p className="wk-status-note">
              Это проверка оформления, не покупка. Не вводите настоящие
              контакты.{" "}
              <button
                type="button"
                className="wk-text-button"
                onClick={() =>
                  setFields({
                    ...initial,
                    gift: false,
                    customerName: "Тестовый покупатель",
                    customerPhone: "+7 000 000-00-00",
                    address: "Тестовая улица, дом 1",
                    date: kemerovoDate(
                      new Date(),
                      Math.max(1, requirements.days),
                    ),
                  })
                }
              >
                Заполнить тестовыми данными
              </button>
            </p>
          )}
          <p className="wk-eyebrow">Корзина / Оформление</p>
          <h1>Осталось самое личное.</h1>
          <p>
            Кому, куда и когда. Состав и стоимость доставки согласуем с вами
            перед оплатой.
          </p>
        </div>
        <form onSubmit={submit} className="wk-checkout-layout">
          <div className="wk-checkout-form">
            <fieldset
              disabled={submitting}
              style={{
                border: 0,
                padding: 0,
                margin: 0,
                minWidth: 0,
                display: "grid",
                gap: 18,
              }}
            >
              <section className="wk-form-section">
                <h2>
                  <span>01</span>Как с вами связаться?
                </h2>
                <div className="wk-form-fields">
                  <label className="wk-field">
                    Ваше имя
                    <input
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={80}
                      value={fields.customerName}
                      onChange={(e) => field("customerName", e.target.value)}
                    />
                  </label>
                  <label className="wk-field">
                    Ваш телефон
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={fields.customerPhone}
                      onChange={(e) => field("customerPhone", e.target.value)}
                      placeholder="+7 900 000-00-00"
                      maxLength={22}
                    />
                  </label>
                </div>
              </section>
              <section className="wk-form-section">
                <h2>
                  <span>02</span>Кто получает?
                </h2>
                <div className="wk-chips">
                  <button
                    type="button"
                    aria-pressed={fields.gift}
                    className={fields.gift ? "active" : ""}
                    onClick={() => field("gift", true)}
                  >
                    Это подарок
                  </button>
                  <button
                    type="button"
                    aria-pressed={!fields.gift}
                    className={!fields.gift ? "active" : ""}
                    onClick={() => field("gift", false)}
                  >
                    Для меня
                  </button>
                </div>
                {fields.gift && (
                  <>
                    <div className="wk-form-fields">
                      <label className="wk-field">
                        Имя получателя
                        <input
                          required
                          minLength={2}
                          maxLength={80}
                          autoComplete="off"
                          value={fields.recipientName}
                          onChange={(e) =>
                            field("recipientName", e.target.value)
                          }
                        />
                      </label>
                      <label className="wk-field">
                        Телефон получателя
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="off"
                          required
                          value={fields.recipientPhone}
                          onChange={(e) =>
                            field("recipientPhone", e.target.value)
                          }
                          maxLength={22}
                          placeholder="+7 900 000-00-00"
                        />
                      </label>
                    </div>
                    <label className="wk-check">
                      <input
                        type="checkbox"
                        checked={fields.surprise}
                        onChange={(e) => field("surprise", e.target.checked)}
                      />
                      <span>
                        <b>Это сюрприз — не звонить получателю</b>
                        <small>Вопросы по заказу решаем с вами.</small>
                      </span>
                    </label>
                    <label className="wk-check">
                      <input
                        type="checkbox"
                        checked={fields.anonymous}
                        onChange={(e) => field("anonymous", e.target.checked)}
                      />
                      <span>
                        <b>Не называть отправителя</b>
                        <small>
                          Если хотите остаться инкогнито, не добавляйте своё имя
                          и в открытку.
                        </small>
                      </span>
                    </label>
                    {!fields.anonymous && (
                      <label className="wk-field" style={{ marginTop: 20 }}>
                        От кого · необязательно
                        <input
                          maxLength={80}
                          value={fields.senderName}
                          onChange={(e) => field("senderName", e.target.value)}
                          placeholder="Как подписать подарок"
                        />
                      </label>
                    )}
                  </>
                )}
              </section>
              <section className="wk-form-section">
                <h2>
                  <span>03</span>Куда и когда?
                </h2>
                <div className="wk-form-fields">
                  <label className="wk-field wide">
                    Адрес в Кемерово
                    <input
                      required
                      minLength={5}
                      maxLength={300}
                      autoComplete="street-address"
                      value={fields.address}
                      onChange={(e) => field("address", e.target.value)}
                      placeholder="Улица, дом, квартира или отель"
                    />
                  </label>
                  <label className="wk-field">
                    Желаемая дата
                    <input
                      required
                      type="date"
                      min={kemerovoDate(new Date(), requirements.days)}
                      value={fields.date}
                      onChange={(e) => field("date", e.target.value)}
                    />
                  </label>
                  <label className="wk-field">
                    Предпочтительное время
                    <select
                      value={fields.slot}
                      onChange={(e) => field("slot", e.target.value)}
                    >
                      <option>Удобное время согласуем</option>
                      <option>Утро</option>
                      <option>День</option>
                      <option>Вечер</option>
                      <option>Точное время</option>
                    </select>
                  </label>
                  {fields.slot === "Точное время" && (
                    <label className="wk-field">
                      Во сколько?
                      <input
                        type="time"
                        required
                        value={fields.exactTime}
                        onChange={(e) => field("exactTime", e.target.value)}
                      />
                    </label>
                  )}
                </div>
                <p className="wk-status-note">
                  Указанная дата и время — пожелание. Подтвердим возможность
                  доставки и её стоимость до оплаты.
                </p>
                <label className="wk-check">
                  <input
                    type="checkbox"
                    checked={fields.leaveAtDoor}
                    onChange={(e) => field("leaveAtDoor", e.target.checked)}
                  />
                  <span>
                    Можно обсудить доставку до двери без личной встречи
                  </span>
                </label>
              </section>
              <section className="wk-form-section">
                <h2>
                  <span>04</span>Что ещё учесть?
                </h2>
                <label className="wk-field">
                  Пожелания к заказу · необязательно
                  <textarea
                    maxLength={300}
                    value={fields.message}
                    onChange={(e) => field("message", e.target.value)}
                    placeholder="Например, подарок нужно передать на ресепшене."
                  />
                </label>
                <p className="wk-status-note">
                  {fields.message.length} из 300 символов
                </p>
              </section>
            </fieldset>
            <p className="wk-status-note">
              {WINK_DEMO
                ? "Проверка проходит только в браузере. Тестовая корзина сохранится; реальная заявка не будет создана."
                : "Сейчас отправляем заявку. Детали доставки и способ оплаты согласуем после подтверждения заказа."}
            </p>
            {error && (
              <div className="wk-error" role="alert">
                {error}{" "}
                <a
                  href={CONTACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  Написать WINK
                </a>
              </div>
            )}
            <button
              className="wk-button wk-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? WINK_DEMO
                  ? "Проверяем…"
                  : "Проверяем и отправляем…"
                : `${WINK_DEMO ? "Проверить оформление" : "Отправить заявку"} · ${money(total)}`}
            </button>
          </div>
          <aside className="wk-order-summary">
            <h2>Ваше поздравление</h2>
            {cart.map((line) => (
              <article key={line.lineId} className="wk-cart-line">
                <div>
                  <h3>{line.subtitle}</h3>
                  <strong>{money(line.unitPriceMinor * line.qty)}</strong>
                </div>
                <p>{line.addon ? line.addon.sku : configText(line.config)}</p>
                {line.addon ? (
                  <>
                    <p className="wk-addon-personalization">
                      {Object.values(line.addon.personalization).join(" · ")}
                    </p>
                    {line.addon.components.length > 0 && (
                      <ul className="wk-bundle-parts">
                        {line.addon.components.map((c) => (
                          <li key={c.product_id}>
                            {c.name} × {c.quantity * line.qty}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    className="wk-edit-link"
                    href={`/product/${line.productId}/?edit=${encodeURIComponent(line.lineId)}`}
                  >
                    Изменить палитру и детали
                  </Link>
                )}
                <div className="wk-cart-actions">
                  <div className="wk-quantity">
                    <button
                      type="button"
                      disabled={submitting || line.qty <= 1}
                      aria-label={`Уменьшить количество: ${line.subtitle}`}
                      onClick={() =>
                        updateCart(
                          cart.map((l) =>
                            l.lineId === line.lineId
                              ? { ...l, qty: l.qty - 1 }
                              : l,
                          ),
                        )
                      }
                    >
                      −
                    </button>
                    <span aria-label="Количество">{line.qty}</span>
                    <button
                      type="button"
                      disabled={submitting || line.qty >= 20}
                      aria-label={`Увеличить количество: ${line.subtitle}`}
                      onClick={() =>
                        updateCart(
                          cart.map((l) =>
                            l.lineId === line.lineId
                              ? { ...l, qty: l.qty + 1 }
                              : l,
                          ),
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="wk-remove"
                    disabled={submitting}
                    type="button"
                    aria-label={`Убрать из корзины: ${line.subtitle}`}
                    onClick={() => {
                      try {
                        writeCart(cart.filter((l) => l.lineId !== line.lineId));
                        if (line.addon) {
                          const a = addonCatalog.items.find(
                            (a) => a.id === line.addon!.id,
                          );
                          if (a)
                            addonEvent(
                              "addon_remove",
                              a,
                              line.addon.parent_product_id,
                            );
                        }
                      } catch {
                        setError("Не удалось обновить корзину.");
                      }
                    }}
                  >
                    Убрать
                  </button>
                </div>
              </article>
            ))}
            <div className="wk-cart-total">
              <span>Товары</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="wk-status-note">
              Доставка — отдельно, по согласованию. Дополнения уже включены в
              сумму товаров.
            </p>
            {requirements.days > 0 && (
              <p className="wk-status-note">
                Изготовление дополнений · {requirements.days} дн. Самая ранняя
                дата: {kemerovoDate(new Date(), requirements.days)}.
              </p>
            )}
            {requirements.delivery_class !== "STANDARD" && (
              <p className="wk-status-note">
                В заказе крупный подарок. Подберём подходящий автомобиль и
                согласуем отдельный тариф доставки.
              </p>
            )}
            <Link className="wk-text-link" href="/shop">
              Добавить ещё композицию
            </Link>
            {mainLine && mainProduct && (
              <AddonRecommendations
                catalog={addonCatalog}
                cartMode
                context={{
                  product_id: mainLine.productId,
                  category: mainProduct.name,
                  palette: mainLine.config.palette,
                  budget_minor: mainLine.unitPriceMinor,
                }}
              />
            )}
          </aside>
        </form>
      </main>
    </WinkPageFrame2026>
  );
}
