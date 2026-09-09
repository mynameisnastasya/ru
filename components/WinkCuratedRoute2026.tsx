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
    "Чтобы к утру всё уже было готово.",
    "Выберите масштаб и количество цифр. Палитру и возраст добавите в карточке — без сборки композиции по частям.",
  ],
  love: [
    "С любовью",
    "Красивый жест без перебора.",
    "Сердца, чистые палитры и личные слова — для годовщины, примирения или просто потому, что хочется напомнить о себе.",
  ],
  kids: [
    "Детям",
    "Праздник, который ребёнок увидит сразу.",
    "Цифра, воздушная база и понятный масштаб. Выберите основу — дальше добавим цвет и возраст.",
  ],
  wow: [
    "Большой жест",
    "Комната становится частью подарка.",
    "Крупные композиции для поздравления, которое меняет пространство. Масштаб, расстановку и доставку согласуем отдельно.",
  ],
  build: [
    "Собрать свой набор",
    "Соберите не всё. Только главное.",
    "Выберите формат и масштаб. Палитра, цифра или надпись — на следующем шаге. Никакой поштучной калькуляции.",
  ],
  "for-her": [
    "Для неё",
    "Чтобы выглядело так, будто вы долго выбирали.",
    "Без долгого выбора: аккуратные палитры, личные детали и готовые форматы для дня рождения, годовщины или просто так.",
  ],
  "for-him": [
    "Для него",
    "Без лишнего декора. С характером.",
    "Чистые палитры, цифры и личные слова. Выберите основу, а детали подстроим под повод и человека.",
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
                Подобрать 2 варианта
              </Link>
              <Link className="wk-text-link" href="/shop">
                Все композиции →
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
              Изображения показывают характер коллекции. Точный состав,
              количество и доступные цвета указаны в карточке. Доставка — отдельно.
            </p>
            {status === "reference" && (
              <p className="wk-status-note">
                Актуальность базовых цен подтвердим при оформлении.
              </p>
            )}
          </section>
        )}
        <section className="wk-section wk-collection-help">
          <div>
            <p className="wk-eyebrow">Не хотите сравнивать?</p>
            <h2>
              {mode === "wow"
                ? "Сначала посмотрим на пространство."
                : "Сузим выбор до двух."}
            </h2>
            <p>
              Напишите, кого поздравляем, дату и бюджет. Предложим два варианта
              и коротко объясним разницу.
            </p>
          </div>
          <a className="wk-button" href={CONTACT_URL}>
            Получить подбор
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
          <legend>01 · Формат</legend>
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
                    : "Сюрприз + 16 шаров"
                  : value + (family === "HEARTS" ? " сердец" : " шаров")}
              </button>
            ))}
          </div>
        </fieldset>
        {family === "BIRTHDAY" && (
          <fieldset className="wk-option">
            <legend>03 · Сколько цифр?</legend>
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
        <p className="wk-eyebrow">Основа выбрана</p>
        {selected ? (
          <>
            <h2>{selected.subtitle}</h2>
            <strong>{money(displayPrice(selected))}</strong>
            <p>
              Дальше — только то, что делает подарок вашим: палитра и доступная
              персонализация.
            </p>
            <Link className="wk-button" href={productHref(selected.slug)}>
              Перейти к деталям →
            </Link>
          </>
        ) : (
          <>
            <h2>Этот вариант сейчас недоступен.</h2>
            <p>Выберите другой масштаб или формат.</p>
          </>
        )}
      </div>
    </section>
  );
}
