"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IMAGES } from "@/lib/wink-shop";
import { ShopIcon } from "./WinkShopUI";

const chapters = [
  {
    label: "Ваше настроение",
    title: "Любимый цвет.",
    emphasis: "Нужный масштаб.",
    text: "Небольшая спальня или просторная гостиная? Подберём объём и сочетание оттенков, чтобы поздравление было к месту.",
    image: IMAGES.momentReaction,
    alt: "Визуализация: два молочных фонтана рядом с девушкой в небольшой спальне",
  },
  {
    label: "Личные детали",
    title: "Всё начинается",
    emphasis: "с внимания.",
    text: "Аккуратные ленты, спокойные оттенки, собранная композиция. А для важных слов есть отдельная коллекция с надписью — MESSAGE.",
    image: IMAGES.momentDetail,
    alt: "Визуализация той же сцены: рука, ленты и молочные латексные шары крупным планом",
  },
  {
    label: "Тот самый момент",
    title: "О вас",
    emphasis: "подумали.",
    text: "Всё уже собрано. Не нужно надувать шары, искать ленты или придумывать сочетание. Остаётся открыть дверь — и порадовать своего человека.",
    image: IMAGES.momentMaster,
    alt: "Визуализация той же спальни: девушка улыбается рядом с готовой молочной композицией",
  },
];

export default function WinkMomentStory({ onFind }: { onFind: () => void }) {
  const [active, setActive] = useState(0);
  const steps = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
    );
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    const update = () => {
      if (!media.matches) return;
      const middle = window.innerHeight * 0.5;
      const positions = steps.current.flatMap((step, index) => {
        if (!step) return [];
        const rect = step.getBoundingClientRect();
        return [
          {
            index,
            distance: Math.max(rect.top - middle, middle - rect.bottom, 0),
          },
        ];
      });
      positions.sort((a, b) => a.distance - b.distance);
      if (positions[0]) setActive(positions[0].index);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observe = () => {
      observer?.disconnect();
      if (!media.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(schedule, {
        rootMargin: "-49% 0px -50% 0px",
        threshold: 0,
      });
      steps.current.forEach((step) => step && observer?.observe(step));
      schedule();
    };
    observe();
    media.addEventListener("change", observe);
    window.addEventListener("resize", schedule);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      media.removeEventListener("change", observe);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section
      className="wk-moment"
      aria-labelledby="moment-heading"
      data-active={active}
    >
      <header className="wk-moment-heading">
        <p className="wk-eyebrow">Не просто шары. Забота, которую видно.</p>
        <h2 id="moment-heading">
          У каждого поздравления <em>своя история.</em>
        </h2>
      </header>
      <div className="wk-moment-layout">
        <div className="wk-moment-stage" aria-hidden="true">
          <div className="wk-moment-main">
            {[
              IMAGES.momentReaction,
              IMAGES.momentDetail,
              IMAGES.momentMaster,
            ].map((src, i) => (
              <Image
                key={src}
                className={active === i ? "is-active" : ""}
                src={src}
                alt=""
                width={1200}
                height={1600}
                unoptimized
                sizes="55vw"
              />
            ))}
          </div>
          <figure className="wk-moment-inset">
            <Image
              src={active === 1 ? IMAGES.momentMaster : IMAGES.momentDetail}
              alt=""
              width={720}
              height={900}
              unoptimized
              sizes="18vw"
            />
            <figcaption>
              {active === 1 ? "Всё складывается в одно" : "Внимание к деталям"}
            </figcaption>
          </figure>
          <p className="wk-moment-credit">
            Одна сцена, три ракурса · создано с ИИ
          </p>
          <div className="wk-moment-track">
            {chapters.map((chapter, i) => (
              <span
                key={chapter.label}
                className={active === i ? "is-active" : ""}
              >
                0{i + 1} {chapter.label}
              </span>
            ))}
          </div>
        </div>
        <div className="wk-moment-chapters">
          {chapters.map((chapter, i) => (
            <article
              key={chapter.label}
              data-chapter={i}
              ref={(node) => {
                steps.current[i] = node;
              }}
              className="wk-moment-chapter"
            >
              <figure className="wk-moment-mobile-photo">
                <Image
                  src={chapter.image}
                  alt={chapter.alt}
                  width={1000}
                  height={1250}
                  unoptimized
                  sizes="(max-width: 600px) 100vw, 50vw"
                />
                <figcaption>Визуальная история WINK · создано с ИИ</figcaption>
              </figure>
              <div>
                <p className="wk-eyebrow">
                  0{i + 1} / {chapter.label}
                </p>
                <h3>
                  {chapter.title}
                  <br />
                  <em>{chapter.emphasis}</em>
                </h3>
                <p>{chapter.text}</p>
                {i === 0 && (
                  <Link className="wk-text-link" href="/shop/?format=AIR">
                    Выбрать воздушный сет <ShopIcon name="arrow" />
                  </Link>
                )}
                {i === 1 && (
                  <Link className="wk-text-link" href="/shop/?format=MESSAGE">
                    Добавить свои слова <ShopIcon name="arrow" />
                  </Link>
                )}
                {i === 2 && (
                  <button className="wk-button" onClick={onFind}>
                    Подобрать мой WINK <ShopIcon name="arrow" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
