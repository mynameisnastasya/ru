"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IMAGES, PALETTES } from "@/lib/wink-shop";
import { ShopIcon } from "./WinkShopUI";

const scenes = [
  {
    id: "PINK_CHROME",
    image: IMAGES.air,
    title: "Нежность\nс характером.",
    text: "Припылённый розовый, молочный и немного серебра. Для тёплого, очень личного поздравления.",
  },
  {
    id: "MILK",
    image: IMAGES.milk,
    title: "Тихое\nвосхищение.",
    text: "Молочные оттенки, мягкий свет и ничего лишнего. Когда хочется сказать многое — спокойно.",
  },
  {
    id: "BLACK_CHROME",
    image: IMAGES.blackChrome,
    title: "Красиво.\nИ смело.",
    text: "Глубокий чёрный, молочный и зеркальное серебро. Для человека, который любит выразительные детали.",
  },
];

export default function WinkPaletteScene() {
  const [active, setActive] = useState(0);
  const scene = scenes[active];
  return (
    <section className="wk-palette-scene" aria-labelledby="palette-title">
      <div className="wk-palette-photo">
        <Image
          key={scene.id}
          src={scene.image}
          alt={`Визуализация сочетания «${PALETTES[scene.id].name}»`}
          width={1000}
          height={1250}
          unoptimized
          sizes="(max-width: 700px) 100vw, 50vw"
        />
        <span className="wk-scene-caption">
          Палитра в пространстве · визуализация
        </span>
      </div>
      <div className="wk-palette-content">
        <p className="wk-eyebrow">Цвет меняет всё</p>
        <h2 id="palette-title">
          Один WINK.
          <br />
          <em>Ваше настроение.</em>
        </h2>
        <fieldset className="wk-palette-selector">
          <legend>Попробуйте сочетание</legend>
          {scenes.map((s, i) => (
            <label key={s.id} className={i === active ? "active" : ""}>
              <input
                type="radio"
                name="scene-palette"
                value={s.id}
                checked={active === i}
                onChange={() => setActive(i)}
              />
              <span className="wk-swatches" aria-hidden="true">
                {PALETTES[s.id].colors.map((c, j) => (
                  <i key={j} style={{ background: c }} />
                ))}
              </span>
              <span>{PALETTES[s.id].name}</span>
              <span aria-hidden="true">{active === i ? "↗" : "+"}</span>
            </label>
          ))}
        </fieldset>
        <div
          className="wk-palette-description"
          aria-live="polite"
          aria-atomic="true"
        >
          <h3>{scene.title}</h3>
          <p>{scene.text}</p>
        </div>
        <Link className="wk-text-link" href={`/shop/?palette=${scene.id}`}>
          Композиции в этих оттенках <ShopIcon name="arrow" />
        </Link>
        <p className="wk-image-note">
          Показываем характер цвета. Точный состав — в карточке набора.
        </p>
      </div>
    </section>
  );
}
