"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WinkPageFrame2026 from "./WinkPageFrame2026";
import WinkProductGallery from "./WinkProductGallery";
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
  const [invalidField, setInvalidField] = useState<
    "number" | "inscription" | "reveal" | "date" | null
  >(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const inscriptionRef = useRef<HTMLTextAreaElement>(null);
  const revealRef = useRef<HTMLButtonElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const dateDetailsRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    setAdded(false);
    setError("");
    setInvalidField(null);
    let initial: LineConfig = {
      addons: [],
      palette: paletteParam || "PINK_MILK",
      foilColor: "S",
    };
    try {
      const line = editId
        ? readCart().find((l) => l.lineId === editId)
        : undefined;
      if (line) initial = { ...line.config };
    } catch {}
    // An optional session draft must never prevent restoring a saved cart line.
    let requestedDate = readDelivery().date;
    try {
      const raw = window.sessionStorage.getItem("wink-product-draft");
      const draft = raw ? JSON.parse(raw) : null;
      if (
        draft &&
        draft.targetSlug === slug &&
        draft.editId === editId &&
        draft.config &&
        Array.isArray(draft.config.addons)
      ) {
        initial = { ...initial, ...draft.config };
        if (typeof draft.date === "string") requestedDate = draft.date;
      }
    } catch {}
    if (paletteParam && PALETTES[paletteParam]) initial.palette = paletteParam;
    setDate(
      requestedDate && validDeliveryDate(requestedDate) ? requestedDate : "",
    );
    setChoice(initial);
  }, [slug, editId, paletteParam]);
  const product = catalog.products.find((p) => p.slug === slug);
  if (!product)
    return (
      <WinkPageFrame2026>
        <main className="wk-empty">
          <h1>Этот набор сейчас недоступен.</h1>
          <p>Посмотрите другие готовые композиции.</p>
          <Link className="wk-button" href="/shop">
            В каталог
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
  function change(value: Partial<LineConfig>) {
    setChoice((current) => ({ ...current, ...value }));
    setAdded(false);
    setError("");
    setInvalidField(null);
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
    setInvalidField(null);
    const errors = personalizationErrors(product, config);
    if (errors.length) {
      setError(errors[0]);
      const field = product.config.number_required
        ? "number"
        : product.config.message_required
          ? "inscription"
          : product.config.reveal_result_required
            ? "reveal"
            : null;
      setInvalidField(field);
      const input =
        field === "number"
          ? numberRef.current
          : field === "inscription"
            ? inscriptionRef.current
            : field === "reveal"
              ? revealRef.current
              : null;
      input?.focus();
      input?.scrollIntoView({ block: "center" });
      return;
    }
    if (date && !validDeliveryDate(date)) {
      setError("Выберите сегодняшнюю или будущую дату доставки.");
      setInvalidField("date");
      if (dateDetailsRef.current) dateDetailsRef.current.open = true;
      dateRef.current?.focus();
      dateRef.current?.scrollIntoView({ block: "center" });
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
      try {
        saveDelivery({ date });
      } catch {}
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
          <Link href="/shop">Композиции</Link>
          <span>/</span>
          <span>{FAMILY_NAMES[product.name]}</span>
        </nav>
        <section className="wk-product-layout">
          <WinkProductGallery key={slug} product={product} />
          <div className="wk-product-buy">
            <p className="wk-eyebrow">{product.name} · WINK</p>
            <h1>{FAMILY_NAMES[product.name]}</h1>
            <p>{product.subtitle}</p>
            <strong className="wk-product-price" aria-live="polite">
              {money(price)}
            </strong>
            <p className="wk-status-note">
              За композицию. Стоимость и время доставки согласуем до оплаты.
            </p>
            {status === "reference" && (
              <p className="wk-status-note">
                Актуальность цены подтвердим перед оформлением.
              </p>
            )}
            {siblings.length > 1 && (
              <fieldset className="wk-option">
                <legend>Размер композиции</legend>
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
                <legend>Цвет сердец</legend>
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
                <legend>Палитра · {PALETTES[selectedPalette]?.name}</legend>
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
                Чёрный шар-сюрприз 36″ с розовым или голубым конфетти.
                Дополнительные шары — в нейтральной палитре.
              </p>
            )}
            <div className="wk-personalization">
              {digits > 0 && (
                <label className="wk-field">
                  {digits === 1
                    ? "Какая цифра нужна?"
                    : "Какие две цифры нужны?"}
                  <input
                    ref={numberRef}
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
                    aria-invalid={invalidField === "number"}
                    aria-describedby={`digit-help${invalidField === "number" ? " product-error" : ""}`}
                  />
                  <span className="wk-status-note" id="digit-help">
                    Возраст или другая важная цифра.{" "}
                    {digits === 1
                      ? "Для двузначного возраста выберите набор с двумя цифрами."
                      : "Нужно ровно две цифры."}
                  </span>
                </label>
              )}
              {product.config.message_required === true && (
                <label className="wk-field">
                  Ваша надпись
                  <textarea
                    ref={inscriptionRef}
                    value={choice.inscription || ""}
                    onChange={(e) => change({ inscription: e.target.value })}
                    maxLength={40}
                    placeholder="Маша, ты — космос!"
                    aria-invalid={invalidField === "inscription"}
                    aria-describedby={`inscription-help${invalidField === "inscription" ? " product-error" : ""}`}
                  />
                  <span className="wk-status-note" id="inscription-help">
                    {(choice.inscription || "").length} из 40 символов · до трёх
                    строк
                  </span>
                </label>
              )}
              {product.config.reveal_result_required === true && (
                <fieldset className="wk-option">
                  <legend>Цвет конфетти внутри</legend>
                  <div className="wk-palette-options">
                    {[
                      ["girl", "Розовое"],
                      ["boy", "Голубое"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        ref={value === "girl" ? revealRef : undefined}
                        type="button"
                        aria-describedby={
                          invalidField === "reveal"
                            ? "product-error"
                            : undefined
                        }
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
                    В сводке корзины цвет не показываем, чтобы сохранить
                    сюрприз.
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
                    <small>Нежный акцент на лентах</small>
                  </span>
                </label>
              )}
            </div>
            <details className="wk-option" ref={dateDetailsRef}>
              <summary>Уже знаете дату доставки?</summary>
              <label className="wk-field">
                Желаемая дата
                <input
                  ref={dateRef}
                  type="date"
                  aria-invalid={invalidField === "date"}
                  aria-describedby={
                    invalidField === "date" ? "product-error" : undefined
                  }
                  min={kemerovoDate()}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setAdded(false);
                    setError("");
                    setInvalidField(null);
                  }}
                />
              </label>
              <p>
                Сохраним пожелание в заказе. Адрес можно указать при оформлении.
              </p>
            </details>
            {error && (
              <p className="wk-error" id="product-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              className="wk-button wk-product-add"
              onClick={addToCart}
            >
              <span>
                {editId ? "Сохранить изменения" : "Добавить в корзину"}
              </span>
              <strong>{money(price)}</strong>
            </button>
            {added && (
              <div className="wk-product-added" role="status">
                <span>
                  {editId ? "Изменения сохранены" : "Композиция в корзине"}
                </span>
                <Link href="/checkout">Оформить заказ →</Link>
              </div>
            )}
            <Link className="wk-text-link" href="/#finder">
              Нужна помощь с выбором?
            </Link>
          </div>
        </section>
        <section className="wk-product-included">
          <div>
            <p className="wk-eyebrow">Без догадок</p>
            <h2>Что приедет к вам</h2>
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
