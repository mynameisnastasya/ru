"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import WinkPageFrame2026 from "./WinkPageFrame2026";
import { ProductCard } from "./WinkShopUI";
import { useWinkCatalog } from "@/lib/use-wink-catalog";
import {
  CONTACT_URL,
  FAMILY_NAMES,
  IMAGES,
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
    "Этот день — весь про него.",
    "Цифры, любимые оттенки и несколько слов, которые хочется запомнить.",
  ],
  love: [
    "С любовью",
    "Для того самого «это всё мне?»",
    "Сердца, нежные сочетания и личные слова. Найдите свой способ сказать главное.",
  ],
  kids: [
    "Детям",
    "Ещё на один год счастливее.",
    "Любимая цифра, мягкие оттенки и шары, которые хочется рассматривать.",
  ],
  wow: [
    "Большой жест",
    "Пусть запомнится вся комната.",
    "Крупные композиции для особенного поздравления. Для оформления пространства обсудим расстановку и детали отдельно.",
  ],
  build: [
    "Собрать свой набор",
    "Сначала — основа. Потом — ваше.",
    "Выберите формат и размер. Палитру, цифры и надпись добавим на следующем шаге.",
  ],
  "for-her": [
    "Для неё",
    "Когда хочется увидеть её улыбку.",
    "Для дня рождения, годовщины или вашего собственного повода. Цвета и личные детали выбираются в карточке.",
  ],
  "for-him": [
    "Для него",
    "В его характере.",
    "Цифры, чистые формы и личные слова. В карточке можно выбрать молочный, чёрный, серебряный и другие оттенки.",
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
        <section
          className={`wk-catalog-head ${mode !== "build" ? "wk-collection-hero" : ""}`}
        >
          <div>
            <p className="wk-eyebrow">{eyebrow} · WINK</p>
            <h1>{title}</h1>
            <p>{intro}</p>
            {mode !== "build" && (
              <div className="wk-actions">
                <Link className="wk-button" href="/#finder">
                  Помочь с выбором
                </Link>
                <Link className="wk-text-link" href="/shop">
                  Все композиции →
                </Link>
              </div>
            )}
          </div>
          {mode !== "build" && (
            <figure>
              <Image
                src={
                  mode === "kids"
                    ? IMAGES.kids
                    : mode === "for-him"
                      ? IMAGES.forHim
                      : mode === "for-her"
                        ? IMAGES.arrival
                        : mode === "love"
                          ? IMAGES.love
                          : IMAGES.birthday
                }
                alt={`Вдохновение WINK: ${eyebrow}`}
                width={1000}
                height={1250}
                priority
                unoptimized
                sizes="(max-width: 700px) 100vw, 45vw"
              />
              <figcaption>Идея оформления · визуализация</figcaption>
            </figure>
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
              Визуализации передают настроение. Количество шаров и цвета указаны
              в карточке каждого набора. Доставка — отдельно.
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
            <p className="wk-eyebrow">Есть идея?</p>
            <h2>
              {mode === "wow"
                ? "Обсудим ваше пространство."
                : "Подберём под ваш момент."}
            </h2>
            <p>
              Напишите, кого поздравляем, когда и какой бюджет вам подходит.
            </p>
          </div>
          <a className="wk-button" href={CONTACT_URL}>
            Написать WINK
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
          <legend>02 · Размер</legend>
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
        <p className="wk-eyebrow">Ваша основа</p>
        {selected ? (
          <>
            <h2>{selected.subtitle}</h2>
            <strong>{money(displayPrice(selected))}</strong>
            <p>Дальше выберем палитру и добавим личные детали.</p>
            <Link className="wk-button" href={productHref(selected.slug)}>
              Перейти к деталям →
            </Link>
          </>
        ) : (
          <>
            <h2>Этот вариант сейчас недоступен.</h2>
            <p>Выберите другой размер или формат.</p>
          </>
        )}
      </div>
    </section>
  );
}
