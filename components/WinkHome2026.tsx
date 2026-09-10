"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef, useState } from "react";
import {
  FAMILY_NAMES,
  asset,
  budgetMatches,
  displayPrice,
  money,
  paletteIds,
  productHref,
  productImage,
  type Product,
} from "@/lib/wink-shop";
import { rankFinderCandidates } from "@/lib/wink-finder";
import { useWinkCatalog } from "@/lib/use-wink-catalog";
import { ShopIcon } from "./WinkShopUI";

const EASE = [0.22, 1, 0.36, 1] as const;

const questions = [
  {
    overline: "01 / КОМУ",
    title: "Кого поздравляем?",
    values: [
      ["her", "Её"],
      ["him", "Его"],
      ["kids", "Ребёнка"],
      ["mom", "Маму"],
      ["friend", "Подругу"],
    ],
  },
  {
    overline: "02 / ЗАЧЕМ",
    title: "Что за повод?",
    values: [
      ["birthday", "День рождения"],
      ["love", "Сказать «люблю»"],
      ["any", "Просто порадовать"],
      ["baby", "Baby reveal"],
    ],
  },
  {
    overline: "03 / КАК",
    title: "Какой нужен вайб?",
    values: [
      ["PINK_MILK", "Нежно"],
      ["PINK_CHROME", "Вау"],
      ["MILK", "Чисто"],
      ["BLACK_CHROME", "Графично"],
    ],
  },
  {
    overline: "04 / СКОЛЬКО",
    title: "Какой бюджет держим?",
    values: [
      ["5000", "До 5 000 ₽"],
      ["7500", "До 7 500 ₽"],
      ["any", "Можно гибко"],
    ],
  },
] as const;

const faq = [
  [
    "Нужно сегодня. Есть шанс?",
    "Да, иногда есть. Напишите WINK до оформления — быстро скажем, что реально собрать и привезти сегодня.",
  ],
  [
    "Получателю можно не звонить?",
    "Да. В оформлении включите режим сюрприза — все организационные вопросы решим с вами.",
  ],
  [
    "Цена потом внезапно изменится?",
    "Стоимость композиции и выбранной персонализации видна сразу. Отдельно согласуем только доставку.",
  ],
  [
    "А если я вообще не понимаю, что красиво?",
    "Именно поэтому есть WINK MATCH. Четыре ответа — и вместо каталога вы получаете максимум два варианта.",
  ],
] as const;

function CampaignProduct({ product, index }: { product: Product; index: number }) {
  return (
    <motion.article
      className="wv4-product"
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.85, delay: index * 0.07, ease: EASE }}
    >
      <Link className="wv4-product-media" href={productHref(product.slug)}>
        <Image
          src={productImage(product)}
          alt={`Композиция ${product.subtitle}`}
          fill
          unoptimized
          sizes="(max-width: 760px) 82vw, 31vw"
        />
        <span>0{index + 1}</span>
      </Link>
      <div className="wv4-product-copy">
        <p>{FAMILY_NAMES[product.name] || product.name}</p>
        <h3>{product.subtitle}</h3>
        <div>
          <strong>{money(displayPrice(product))}</strong>
          <Link href={productHref(product.slug)} aria-label={`Открыть ${product.subtitle}`}>
            ВЫБРАТЬ <ShopIcon name="arrow" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function WinkHome2026() {
  const { catalog } = useWinkCatalog();
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const matchRef = useRef<HTMLElement>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [matchKey, setMatchKey] = useState(0);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroArtY = useTransform(heroProgress, [0, 1], [0, 80]);
  const heroArtScale = useTransform(heroProgress, [0, 1], [1, 1.08]);
  const heroTypeY = useTransform(heroProgress, [0, 1], [0, -58]);

  const startPrice = catalog.products.length
    ? Math.min(...catalog.products.map((product) => displayPrice(product)))
    : 0;

  const drop = useMemo(() => {
    const slugs = ["air16", "birthday16-2", "hearts7"];
    return slugs
      .map((slug) => catalog.products.find((product) => product.slug === slug))
      .filter((product): product is Product => Boolean(product));
  }, [catalog.products]);

  const recommendations = useMemo(() => {
    if (answers.length !== 4) return [];
    const [recipient, occasion, palette, budget] = answers;
    return rankFinderCandidates(
      catalog.products
        .filter(
          (product) =>
            budgetMatches(displayPrice(product, palette), budget) &&
            (product.name === "HEARTS" ||
              product.name === "BABY REVEAL" ||
              paletteIds(product).includes(palette)) &&
            (occasion === "baby"
              ? product.name === "BABY REVEAL"
              : product.name !== "BABY REVEAL"),
        )
        .map((product) => ({
          item: product,
          signals: {
            recipientMatch:
              recipient === "kids"
                ? Number(product.name === "BIRTHDAY")
                : recipient === "him"
                  ? Number(["AIR", "BIRTHDAY", "MESSAGE"].includes(product.name))
                  : 1,
            occasionMatch:
              occasion === "birthday"
                ? Number(product.name === "BIRTHDAY")
                : occasion === "love"
                  ? Number(["LOVE", "HEARTS", "MESSAGE"].includes(product.name))
                  : 1,
            vibeMatch: 0,
            budgetFit: 1,
            bestseller: Boolean(product.bestseller),
            inStock: false,
            slotRisk: 0,
          },
        })),
      2,
    ).map((result) => result.item);
  }, [answers, catalog.products]);

  const step = Math.min(answers.length, questions.length - 1);
  const completed = answers.length === questions.length;

  function startMatch() {
    setAnswers([]);
    setMatchKey((value) => value + 1);
    window.requestAnimationFrame(() =>
      matchRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      }),
    );
  }

  return (
    <main className="wv4-home">
      <section className="wv4-hero" ref={heroRef} aria-labelledby="wv4-title">
        <motion.div
          className="wv4-hero-art"
          style={reducedMotion ? undefined : { y: heroArtY, scale: heroArtScale }}
          aria-hidden="true"
        >
          <Image
            src={asset("/images/wink-v4-hero.svg")}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
          />
        </motion.div>
        <div className="wv4-hero-grid" />
        <motion.div
          className="wv4-hero-copy"
          style={reducedMotion ? undefined : { y: heroTypeY }}
        >
          <p className="wv4-code">WINK / KEMEROVO / GIFT CONCIERGE</p>
          <h1 id="wv4-title">
            ПОДАРОК.
            <br />
            <span>БЕЗ МУК</span>
            <br />
            ВЫБОРА.
          </h1>
          <div className="wv4-hero-bottom">
            <p>
              4 ответа → 2 готовых варианта.
              <br />
              Персонализируем и доставим по Кемерову.
            </p>
            <button type="button" className="wv4-cta" onClick={startMatch}>
              ПОДОБРАТЬ ПОДАРОК <ShopIcon name="arrow" />
            </button>
            {startPrice > 0 && (
              <small>ОТ {money(startPrice)} / ДОСТАВКА ОТДЕЛЬНО</small>
            )}
          </div>
        </motion.div>
        <Link href="/shop" className="wv4-shop-jump">
          КОЛЛЕКЦИЯ ↗
        </Link>
      </section>

      <div className="wv4-marquee" aria-hidden="true">
        <div>
          ДЕНЬ РОЖДЕНИЯ · LOVE · БЕЗ ПОВОДА · BABY REVEAL · ДЕНЬ РОЖДЕНИЯ · LOVE · БЕЗ ПОВОДА · BABY REVEAL ·
        </div>
      </div>

      <section className="wv4-manifesto" aria-label="Что делает WINK">
        <p>НЕ НАДО ЗНАТЬ, СКОЛЬКО ШАРОВ НУЖНО.</p>
        <h2>
          ТЫ ЗНАЕШЬ ЧЕЛОВЕКА.
          <br />
          <span>МЫ ЗНАЕМ, КАК СДЕЛАТЬ ВАУ.</span>
        </h2>
        <div className="wv4-manifesto-foot">
          <p>
            Магазин даёт сотню позиций. WINK сначала понимает задачу — и только
            потом показывает решение.
          </p>
          <button type="button" onClick={startMatch}>
            НАЧАТЬ С 4 ВОПРОСОВ <ShopIcon name="arrow" />
          </button>
        </div>
      </section>

      <section
        className="wv4-match"
        id="finder"
        ref={matchRef}
        aria-labelledby="wv4-match-title"
      >
        <header className="wv4-match-head">
          <div>
            <p className="wv4-code">WINK MATCH / 60 SEC</p>
            <h2 id="wv4-match-title">НЕ ЛИСТАЙ.<br />ОТВЕТЬ.</h2>
          </div>
          <p>
            Хороший сервис уменьшает выбор. В конце покажем максимум два
            варианта — не двадцать два.
          </p>
        </header>

        <div className="wv4-console" key={matchKey}>
          <div className="wv4-progress" aria-label={`Шаг ${Math.min(answers.length + 1, 4)} из 4`}>
            {[0, 1, 2, 3].map((item) => (
              <i
                key={item}
                className={
                  item < answers.length
                    ? "done"
                    : item === answers.length
                      ? "active"
                      : ""
                }
              />
            ))}
          </div>

          {!completed ? (
            <motion.div
              className="wv4-question"
              key={answers.length}
              initial={reducedMotion ? false : { opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.62, ease: EASE }}
            >
              <p>{questions[step].overline}</p>
              <h3>{questions[step].title}</h3>
              <div className="wv4-options">
                {questions[step].values.map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setAnswers((current) => [...current, value])}
                  >
                    {label} <ShopIcon name="arrow" />
                  </button>
                ))}
              </div>
              {answers.length > 0 && (
                <button
                  type="button"
                  className="wv4-back"
                  onClick={() => setAnswers((current) => current.slice(0, -1))}
                >
                  ← НАЗАД
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="wv4-results"
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: EASE }}
            >
              <div className="wv4-results-head">
                <div>
                  <p>WINK MATCH / ГОТОВО</p>
                  <h3>ВОТ С ЧЕГО<br />МЫ БЫ НАЧАЛИ.</h3>
                </div>
                <button type="button" onClick={() => setAnswers([])}>
                  ЕЩЁ РАЗ
                </button>
              </div>
              {recommendations.length ? (
                <div className="wv4-results-grid">
                  {recommendations.map((product, index) => (
                    <CampaignProduct key={product.slug} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className="wv4-no-result">
                  <p>В этой рамке сейчас нет варианта, который мы хотим советовать.</p>
                  <Link href="/shop">СМОТРЕТЬ ВСЮ КОЛЛЕКЦИЮ ↗</Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <section className="wv4-drop" aria-labelledby="wv4-drop-title">
        <header>
          <p className="wv4-code">DROP 01 / READY TO GIFT</p>
          <h2 id="wv4-drop-title">УЖЕ СОБРАНО.<br />УЖЕ КРАСИВО.</h2>
          <Link href="/shop">ВСЯ КОЛЛЕКЦИЯ ↗</Link>
        </header>
        <div className="wv4-drop-rail">
          {drop.map((product, index) => (
            <CampaignProduct key={product.slug} product={product} index={index} />
          ))}
        </div>
      </section>

      <section className="wv4-personal" aria-labelledby="wv4-personal-title">
        <motion.div
          className="wv4-personal-art"
          initial={reducedMotion ? false : { clipPath: "inset(12% 12% 12% 12%)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.05, ease: EASE }}
        >
          <Image
            src={asset("/images/wink-v4-detail.svg")}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 760px) 100vw, 48vw"
          />
        </motion.div>
        <div className="wv4-personal-copy">
          <p className="wv4-code">MAKE IT YOURS</p>
          <h2 id="wv4-personal-title">
            НЕ БОЛЬШЕ ДЕКОРА.
            <br />
            <span>БОЛЬШЕ ТЕБЯ.</span>
          </h2>
          <p>
            Цвет. Цифра. Короткая надпись. Одна личная деталь работает сильнее,
            чем ещё пять случайных украшений.
          </p>
          <div className="wv4-personal-list">
            <div><b>01</b><span>ПАЛИТРА</span></div>
            <div><b>02</b><span>ЦИФРА / ВОЗРАСТ</span></div>
            <div><b>03</b><span>КОРОТКАЯ НАДПИСЬ</span></div>
          </div>
          <Link className="wv4-outline-link" href="/build">
            ПЕРСОНАЛИЗИРОВАТЬ <ShopIcon name="arrow" />
          </Link>
        </div>
      </section>

      <section className="wv4-proof" aria-labelledby="wv4-proof-title">
        <header>
          <p className="wv4-code">NO SURPRISES / EXCEPT THE GOOD ONE</p>
          <h2 id="wv4-proof-title">КРАСИВО —<br />И ПО-ВЗРОСЛОМУ.</h2>
        </header>
        <div className="wv4-proof-grid">
          {[
            ["01", "ВЫБОР", "До двух решений вместо бесконечного каталога."],
            ["02", "ЦЕНА", "Состав и персонализация видны до оформления."],
            ["03", "ДАТА", "Подтверждаем возможность до оплаты."],
            ["04", "СЮРПРИЗ", "Не звоним получателю, если вы так попросили."],
          ].map(([num, title, text]) => (
            <article key={num}>
              <b>{num}</b>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wv4-faq" aria-labelledby="wv4-faq-title">
        <h2 id="wv4-faq-title">КОРОЧЕ,<br />ВОТ ЧТО ВАЖНО.</h2>
        <div>
          {faq.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}<span>+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="wv4-close">
        <p className="wv4-code">WINK / KEMEROVO</p>
        <h2>ПОГНАЛИ?</h2>
        <p>Четыре ответа. Два варианта. Один хороший подарок.</p>
        <button type="button" className="wv4-close-button" onClick={startMatch}>
          ПОДОБРАТЬ <ShopIcon name="arrow" />
        </button>
        <Link href="/shop">ИЛИ СМОТРЕТЬ КОЛЛЕКЦИЮ ↗</Link>
      </section>
    </main>
  );
}
