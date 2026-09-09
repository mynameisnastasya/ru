"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import WinkPageFrame2026 from "./WinkPageFrame2026";
import { FavoriteButton } from "./WinkShopUI";
import { useWinkCatalog } from "@/lib/use-wink-catalog";
import {
  createClientId,
  FAMILY_NAMES,
  FOIL_NAMES,
  PALETTES,
  LineConfig,
  bowModifier,
  displayPrice,
  kemerovoDate,
  money,
  paletteIds,
  personalizationErrors,
  priceFor,
  productImage,
  readCart,
  readDelivery,
  saveDelivery,
  validDeliveryDate,
  writeCart,
} from "@/lib/wink-shop";

import { useWinkAddons } from "@/lib/use-wink-addons";
import { AddonRecommendations } from "./WinkAddons";

const blank: LineConfig = { addons: [] };
export default function WinkProduct2026({ slug }: { slug: string }) {
  const { catalog, status } = useWinkCatalog();
  const { catalog: addonCatalog } = useWinkAddons();
  const query = useSearchParams();
  const editId = query.get("edit") || "";
  const paletteParam = query.get("palette") || "";
  const [choice, setChoice] = useState<LineConfig>(blank);
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  useEffect(() => {
    setAdded(false);
    setError("");
    let initial: LineConfig = {
      addons: [],
      palette: paletteParam || "PINK_MILK",
      foilColor: "S",
    };
    try {
      const line = editId
        ? readCart().find((l) => l.lineId === editId)
        : undefined;
      const raw = window.sessionStorage.getItem("wink-product-draft");
      const draft = raw ? JSON.parse(raw) : null;
      if (line) initial = { ...line.config };
      if (
        draft &&
        draft.targetSlug === slug &&
        draft.editId === editId &&
        draft.config &&
        Array.isArray(draft.config.addons)
      )
        initial = { ...initial, ...draft.config };
      if (paletteParam && PALETTES[paletteParam])
        initial.palette = paletteParam;
      const intent = readDelivery();
      const requestedDate =
        typeof draft?.date === "string" && draft.targetSlug === slug
          ? draft.date
          : intent.date;
      if (requestedDate && validDeliveryDate(requestedDate))
        setDate(requestedDate);
    } catch {}
    setChoice(initial);
  }, [slug, editId, paletteParam]);
  const product = catalog.products.find((p) => p.slug === slug);
  if (!product)
    return (
      <WinkPageFrame2026>
        <main className="wk-empty">
          <h1>Этого готового решения сейчас нет.</h1>
          <p>Покажем другие варианты, с которыми не придётся импровизировать.</p>
          <Link className="wk-button" href="/shop">
            Посмотреть решения
          </Link>
        </main>
      </WinkPageFrame2026>
    );
  const ids = paletteIds(product);
  const selectedPalette =
    product.name === "BABY REVEAL"
      ? "MILK"
      : ids.includes(choice.palette || "")
        ? choice.palette!
        : ids.includes("PINK_MILK")
          ? "PINK_MILK"
          : ids[0];
  const modifier = bowModifier(product, catalog);
  const config: LineConfig = {
    addons:
      modifier && choice.addons.includes(modifier.code) ? [modifier.code] : [],
  };
  if (product.name === "HEARTS")
    config.foilColor = FOIL_NAMES[choice.foilColor || ""]
      ? choice.foilColor
      : "S";
  else config.palette = selectedPalette;
  if (product.config.number_required) config.number = choice.number || "";
  if (product.config.message_required)
    config.inscription = choice.inscription || "";
  if (product.config.reveal_result_required)
    config.revealResult = choice.revealResult;
  const price = priceFor(product, config, catalog);
  const digits = Number(product.config.digit_count || 0);
  const siblings = catalog.products.filter((p) => p.name === product.name);
  const promise =
    product.name === "AIR"
      ? "Готовый визуальный жест без лишнего декора. Выберите масштаб и настроение — композиция уже собрана как цельный результат."
      : product.name === "BIRTHDAY"
        ? "Возраст становится частью поздравления, а не отдельной деталью. Выберите масштаб и нужную цифру — остальное уже сбалансировано."
        : product.name === "LOVE"
          ? "Сердца остаются акцентом, а не превращают подарок в визуальный шум. Для момента, когда хочется сказать главное красиво."
          : product.name === "HEARTS"
            ? "Один понятный жест без сложного выбора: одинаковые сердца, один цвет и чистая подача."
            : product.name === "MESSAGE"
              ? "Подарок, который говорит вашими словами. Личная надпись встроена в готовую композицию, а не добавлена поверх случайного набора."
              : "Сценарий сюрприза, в котором результат остаётся секретом до самого момента. Внешнюю часть держим нейтральной.";
  function change(value: Partial<LineConfig>) {
    setChoice((current) => ({ ...current, ...value }));
    setAdded(false);
    setError("");
  }
  function preserveDraft(targetSlug: string) {
    const target = catalog.products.find((p) => p.slug === targetSlug);
    const targetAddon = target && bowModifier(target, catalog);
    const draftConfig = {
      ...choice,
      addons: config.addons.length && targetAddon ? [targetAddon.code] : [],
    };
    try {
      window.sessionStorage.setItem(
        "wink-product-draft",
        JSON.stringify({ targetSlug, editId, config: draftConfig, date }),
      );
    } catch {}
  }
  function addToCart() {
    if (!product) return;
    setAdded(false);
    setError("");
    const errors = personalizationErrors(product, config);
    if (errors.length) {
      setError(errors[0]);
      return;
    }
    if (date && !validDeliveryDate(date)) {
      setError("Выберите сегодняшнюю или будущую дату доставки.");
      return;
    }
    try {
      const cart = readCart();
      const existing = editId
        ? cart.find((line) => line.lineId === editId)
        : cart.find(
            (line) =>
              line.productId === slug &&
              JSON.stringify(line.config) === JSON.stringify(config),
          );
      if (editId && !existing) {
        setError(
          "Этой позиции уже нет в корзине. Вернитесь в корзину и выберите набор заново.",
        );
        return;
      }
      if (!editId && existing && existing.qty >= 20) {
        setError(
          "В корзине уже 20 таких наборов. Для большого заказа напишите нам.",
        );
        return;
      }
      const line = {
        lineId: existing?.lineId || `${slug}-${createClientId()}`,
        productId: slug,
        name: product.name,
        subtitle: product.subtitle,
        qty: editId ? existing!.qty : (existing?.qty || 0) + 1,
        unitPriceMinor: price,
        config,
      };
      writeCart(
        existing
          ? cart.map((old) => (old.lineId === existing.lineId ? line : old))
          : [...cart, line],
      );
      if (date) {
        try {
          saveDelivery({ date });
        } catch {}
      }
      setAdded(true);
      try {
        window.sessionStorage.removeItem("wink-product-draft");
      } catch {}
      if (!editId)
        window.dispatchEvent(
          new CustomEvent("wink-add-to-cart", { detail: { slug, price } }),
        );
    } catch {
      setError(
        "Не удалось сохранить корзину в этом браузере. Разрешите хранение данных сайта и попробуйте ещё раз.",
      );
    }
  }
  const included = [
    product.config.latex_count
      ? `${product.config.latex_count} латексных шаров с гелием`
      : "",
    product.config.heart_count
      ? `${product.config.heart_count} фольгированных сердец`
      : "",
    digits
      ? `${digits === 1 ? "Одна фольгированная цифра" : "Две фольгированные цифры"} на ваш выбор`
      : "",
    product.config.message_required
      ? "Прозрачный Bubble 24″, 8 мини-шаров и ваша надпись"
      : "",
    product.config.reveal_result_required
      ? "Шар-сюрприз с выбранным цветом конфетти"
      : "",
    "Базовая карточка WINK без текста",
    "Ленты и грузики",
    "Транспортная упаковка",
  ].filter(Boolean);
  return (
    <WinkPageFrame2026>
      <main>
        <nav className="wk-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/shop">Готовые решения</Link>
          <span>/</span>
          <span>{FAMILY_NAMES[product.name]}</span>
        </nav>
        <section className="wk-product-layout">
          <div className="wk-product-gallery">
            <figure>
              <Image
                src={productImage(product)}
                alt={`Визуализация настроения коллекции «${FAMILY_NAMES[product.name]}»`}
                width={1024}
                height={1280}
                priority
                unoptimized
                sizes="(max-width: 700px) 100vw, 55vw"
              />
              <FavoriteButton slug={slug} />
            </figure>
            <p className="wk-image-note">
              Фото показывает характер коллекции, а не обещает пиксель-в-пиксель.
              Точный состав, количество и доступные оттенки зафиксированы ниже.
            </p>
          </div>
          <div className="wk-product-buy">
            <p className="wk-eyebrow">{product.name} · WINK</p>
            <h1>{FAMILY_NAMES[product.name]}</h1>
            <p>{promise}</p>
            <strong className="wk-product-price" aria-live="polite">
              {money(price)}
            </strong>
            <p className="wk-status-note">
              Цена выбранного решения. Доставку и доступное время подтвердим до оплаты.
            </p>
            {status === "reference" && (
              <p className="wk-status-note">
                Актуальность цены подтвердим перед оформлением.
              </p>
            )}
            {siblings.length > 1 && (
              <fieldset className="wk-option">
                <legend>Масштаб</legend>
                <div className="wk-sizes">
                  {siblings.map((p) => (
                    <Link
                      key={p.slug}
                      className={p.slug === slug ? "active" : ""}
                      aria-current={p.slug === slug ? "page" : undefined}
                      onClick={() => preserveDraft(p.slug)}
                      href={`/product/${p.slug}/?palette=${selectedPalette}${editId ? "&edit=" + encodeURIComponent(editId) : ""}`}
                    >
                      <span>{p.subtitle}</span>
                      <small>{money(displayPrice(p, selectedPalette))}</small>
                    </Link>
                  ))}
                </div>
              </fieldset>
            )}
            {product.name === "HEARTS" ? (
              <fieldset className="wk-option">
                <legend>Какой акцент?</legend>
                <div className="wk-palette-options">
                  {Object.entries(FOIL_NAMES).map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      aria-pressed={config.foilColor === value}
                      onClick={() => change({ foilColor: value })}
                    >
                      <span className="wk-swatches">
                        <i
                          style={{
                            background:
                              value === "S"
                                ? "#bfc4c9"
                                : value === "G"
                                  ? "#c8ad75"
                                  : "#963549",
                          }}
                        />
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : product.name !== "BABY REVEAL" ? (
              <fieldset className="wk-option">
                <legend>Настроение · {PALETTES[selectedPalette]?.name}</legend>
                <div className="wk-palette-options">
                  {ids.map((id) => (
                    <button
                      type="button"
                      key={id}
                      aria-pressed={selectedPalette === id}
                      onClick={() => change({ palette: id })}
                    >
                      <span className="wk-swatches">
                        {PALETTES[id].colors.map((color, i) => (
                          <i key={i} style={{ background: color }} />
                        ))}
                      </span>
                      {PALETTES[id].name}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : (
              <p className="wk-status-note">
                Снаружи — нейтрально. Внутри — розовое или голубое конфетти,
                чтобы результат не читался раньше времени.
              </p>
            )}
            <div className="wk-personalization">
              {digits > 0 && (
                <label className="wk-field">
                  {digits === 1
                    ? "Какая цифра нужна?"
                    : "Какие две цифры нужны?"}
                  <input
                    inputMode="numeric"
                    value={choice.number || ""}
                    onChange={(e) =>
                      change({
                        number: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, digits),
                      })
                    }
                    maxLength={digits}
                    placeholder={digits === 1 ? "Например, 7" : "Например, 25"}
                    aria-describedby="digit-help"
                  />
                  <span className="wk-status-note" id="digit-help">
                    Возраст или другая важная цифра.{" "}
                    {digits === 1
                      ? "Для двузначного возраста выберите вариант с двумя цифрами."
                      : "Нужно ровно две цифры."}
                  </span>
                </label>
              )}
              {product.config.message_required === true && (
                <label className="wk-field">
                  Что хотите сказать?
                  <textarea
                    value={choice.inscription || ""}
                    onChange={(e) => change({ inscription: e.target.value })}
                    maxLength={40}
                    placeholder="Маша, ты — космос!"
                    aria-describedby="inscription-help"
                  />
                  <span className="wk-status-note" id="inscription-help">
                    {(choice.inscription || "").length} из 40 символов · до трёх
                    строк
                  </span>
                </label>
              )}
              {product.config.reveal_result_required === true && (
                <fieldset className="wk-option">
                  <legend>Какой результат спрятать внутри?</legend>
                  <div className="wk-palette-options">
                    {[
                      ["girl", "Розовое конфетти"],
                      ["boy", "Голубое конфетти"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        aria-pressed={choice.revealResult === value}
                        onClick={() =>
                          change({ revealResult: value as "girl" | "boy" })
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p>
                    В корзине результат не показываем — сюрприз останется сюрпризом.
                  </p>
                </fieldset>
              )}
              {modifier && (
                <label className="wk-check">
                  <input
                    type="checkbox"
                    checked={config.addons.includes(modifier.code)}
                    onChange={(e) =>
                      change({
                        addons: e.target.checked ? [modifier.code] : [],
                      })
                    }
                  />
                  <span>
                    <b>
                      {modifier.name} · +{money(modifier.price_delta_minor)}
                    </b>
                    <small>Небольшой акцент на лентах — без перегруза</small>
                  </span>
                </label>
              )}
            </div>
            <details className="wk-option">
              <summary>Уже знаете нужную дату?</summary>
              <label className="wk-field">
                Когда должен случиться момент
                <input
                  type="date"
                  min={kemerovoDate()}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setAdded(false);
                  }}
                />
              </label>
              <p>
                Сохраним дату как пожелание. Реальную возможность доставки подтвердим до оплаты; адрес можно добавить при оформлении.
              </p>
            </details>
            {error && (
              <p className="wk-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              className="wk-button wk-product-add"
              onClick={addToCart}
            >
              <span>
                {editId ? "Сохранить выбор" : "Выбрать этот вариант"}
              </span>
              <strong>{money(price)}</strong>
            </button>
            {added && (
              <div className="wk-product-added" role="status">
                <span>
                  {editId ? "Выбор обновлён" : "Вариант добавлен"}
                </span>
                <Link href="/checkout">Перейти к оформлению →</Link>
              </div>
            )}
            <Link className="wk-text-link" href="/#finder">
              Сомневаетесь? Пройти WINK MATCH
            </Link>
          </div>
        </section>
        <section className="wk-product-included">
          <div>
            <p className="wk-eyebrow">Чтобы без догадок</p>
            <h2>Что именно приедет</h2>
          </div>
          <ul>
            {included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <AddonRecommendations
          catalog={addonCatalog}
          context={{
            product_id: slug,
            category: product.name,
            palette: config.palette,
            budget_minor: price,
          }}
        />
      </main>
    </WinkPageFrame2026>
  );
}