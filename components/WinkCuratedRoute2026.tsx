"use client";
import Link from "next/link";
import { useState } from "react";
import WinkPageFrame2026 from "./WinkPageFrame2026";
import { ProductCard } from "./WinkShopUI";
import { useWinkCatalog } from "@/lib/use-wink-catalog";
import {
  CONTACT_URL,
  FAMILY_NAMES,
  Product,
  displayPrice,
  money,
  productHref,
} from "@/lib/wink-shop";

type Mode =
  | "birthday"
  | "love"
  | "kids"
  | "wow"
  | "build"
  | "for-her"
  | "for-him";
const COPY: Record<Mode, [string, string, string]> = {
  birthday: [
    "День рождения",
    "Пусть возраст будет частью момента, а не просто цифрой.",
    "Готовые решения с одной или двумя цифрами, воздушной базой и отобранными палитрами. Выберите масштаб — остальное не придётся собирать по частям.",
  ],
  love: [
    "С любовью",
    "Сказать главное без визуального шума.",
    "Сердца, чистые сочетания и личные слова. Для годовщины, примирения или обычного дня, который хочется сделать важнее.",
  ],
  kids: [
    "Детям",
    "Пока ребёнок спит, комната становится праздником.",
    "Цифры, понятный состав и композиции, которые хорошо считываются утром и на фото. Детали проверяем до вашего момента.",
  ],
  wow: [
    "Большой жест",
    "Не подарок в комнате. Комната становится подарком.",
    "Крупные решения для дня рождения, предложения и значимой даты. Подбираем масштаб под пространство, а не просто добавляем больше шаров.",
  ],
  build: [
    "Свой вариант",
    "Личное — да. Бесконечный конструктор — нет.",
    "Сначала выберите проверенную основу и масштаб. Затем добавьте только то, что действительно делает подарок вашим: палитру, цифру или слова.",
  ],
  "for-her": [
    "Для неё",
    "Хочу красиво. Но не хочу собирать всё сама.",
    "Для девушки, мамы, подруги или сестры. Готовые сочетания, понятная цена и личная деталь там, где она действительно усиливает подарок.",
  ],
  "for-him": [
    "Для него",
    "Скажите бюджет. Мы покажем, что заказать.",
    "Чистые формы, спокойные и контрастные палитры, цифры и личные слова. Минимум выбора — чтобы быстро принять нормальное решение и не ошибиться.",
  ],
};
export default function WinkCuratedRoute2026({ mode }: { mode: Mode }) {
  const { catalog, status } = useWinkCatalog();
  const [eyebrow, title, intro] = COPY[mode];
  const products = catalog.products.filter((p) => {
    if (["birthday", "kids", "for-him"].includes(mode))
      return ["BIRTHDAY", "AIR", "MESSAGE"].includes(p.name);
    if (mode === "love" || mode === "for-her")
      return ["LOVE", "HEARTS", "MESSAGE", "BIRTHDAY"].includes(p.name);
    return Number(p.config.latex_count) >= 30 || p.slug === "hearts14";
  });
  return (
    <WinkPageFrame2026>
      <main>
        <section className="wk-catalog-head">
          <p className="wk-eyebrow">{eyebrow} · WINK</p>
          <h1>{title}</h1>
          <p>{intro}</p>
          {mode !== "build" && (
            <div className="wk-actions">
              <Link className="wk-button" href="/#finder">
                Подобрать за 4 ответа
              </Link>
              <Link className="wk-text-link" href="/shop">
                Все готовые решения →
              </Link>
            </div>
          )}
        </section>
        {mode === "build" ? (
          <Builder products={catalog.products} />
        ) : (
          <section className="wk-section wk-catalog-grid">
            <div className="wk-grid">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
            <p className="wk-image-note">
              Фото передают характер коллекции. Точный состав, количество и доступные
              оттенки указаны в карточке каждого решения. Доставка рассчитывается отдельно.
            </p>
            {status === "reference" && (
              <p className="wk-status-note">
                Актуальность базовых цен подтвердим перед оформлением.
              </p>
            )}
          </section>
        )}
        <section className="wk-section wk-collection-help">
          <div>
            <p className="wk-eyebrow">Не хотите разбираться?</p>
            <h2>
              {mode === "wow"
                ? "Сначала посмотрим на пространство."
                : "Сузим выбор до нескольких сильных вариантов."}
            </h2>
            <p>
              Напишите, кого поздравляем, по какому поводу и какой бюджет комфортен.
            </p>
          </div>
          <a className="wk-button" href={CONTACT_URL}>
            Написать «ПОДБОР»
          </a>
        </section>
      </main>
    </WinkPageFrame2026>
  );
}
function Builder({ products }: { products: Product[] }) {
  const [family, setFamily] = useState("AIR");
  const [size, setSize] = useState(16);
  const [digits, setDigits] = useState(1);
  const selected = products.find(
    (p) =>
      p.name === family &&
      (family === "HEARTS"
        ? Number(p.config.heart_count) === size
        : family === "BABY REVEAL"
          ? size === 16
            ? p.slug === "baby-reveal16"
            : p.slug === "baby-reveal-solo"
          : Number(p.config.latex_count) === size &&
            (family !== "BIRTHDAY" || Number(p.config.digit_count) === digits)),
  );
  const sizes =
    family === "HEARTS"
      ? [7, 14]
      : family === "BABY REVEAL"
        ? [0, 16]
        : [16, 30];
  return (
    <section className="wk-builder wk-section">
      <div className="wk-builder-options">
        <fieldset className="wk-option">
          <legend>01 · Сценарий</legend>
          <div className="wk-chips">
            {Object.entries(FAMILY_NAMES).map(([value, label]) => (
              <button
                key={value}
                aria-pressed={family === value}
                onClick={() => {
                  setFamily(value);
                  setSize(
                    value === "HEARTS" ? 7 : value === "BABY REVEAL" ? 0 : 16,
                  );
                  setDigits(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="wk-option">
          <legend>02 · Масштаб</legend>
          <div className="wk-chips">
            {sizes.map((value) => (
              <button
                key={value}
                aria-pressed={size === value}
                onClick={() => setSize(value)}
              >
                {family === "BABY REVEAL"
                  ? value === 0
                    ? "Только шар-сюрприз"
                    : "Сюрприз + воздушная база"
                  : value + (family === "HEARTS" ? " сердец" : " шаров")}
              </button>
            ))}
          </div>
        </fieldset>
        {family === "BIRTHDAY" && (
          <fieldset className="wk-option">
            <legend>03 · Возраст</legend>
            <div className="wk-chips">
              {[1, 2].map((value) => (
                <button
                  key={value}
                  aria-pressed={digits === value}
                  onClick={() => setDigits(value)}
                >
                  {value === 1 ? "Одна цифра" : "Две цифры"}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </div>
      <div className="wk-builder-result" aria-live="polite">
        <p className="wk-eyebrow">Основа готова</p>
        {selected ? (
          <>
            <h2>{selected.subtitle}</h2>
            <strong>{money(displayPrice(selected))}</strong>
            <p>На следующем шаге останутся палитра и личные детали — без пересборки всего подарка с нуля.</p>
            <Link className="wk-button" href={productHref(selected.slug)}>
              Добавить детали →
            </Link>
          </>
        ) : (
          <>
            <h2>Такого готового формата сейчас нет.</h2>
            <p>Выберите другой масштаб или сценарий — случайную замену предлагать не будем.</p>
          </>
        )}
      </div>
    </section>
  );
}