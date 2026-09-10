"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef, useState } from "react";
import {
  FAMILY_NAMES,
  IMAGES,
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
    eyebrow: "01 / Человек",
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
    eyebrow: "02 / Повод",
    title: "Что происходит?",
    values: [
      ["birthday", "День рождения"],
      ["love", "Хочу сказать «люблю»"],
      ["any", "Просто порадовать"],
      ["baby", "Baby reveal"],
    ],
  },
  {
    eyebrow: "03 / Настроение",
    title: "Как это должно ощущаться?",
    values: [
      ["PINK_MILK", "Нежно"],
      ["PINK_CHROME", "Вау"],
      ["MILK", "Спокойно"],
      ["BLACK_CHROME", "Графично"],
    ],
  },
  {
    eyebrow: "04 / Бюджет",
    title: "Какую рамку держим?",
    values: [
      ["5000", "До 5 000 ₽"],
      ["7500", "До 7 500 ₽"],
      ["any", "Можно гибко"],
    ],
  },
] as const;

const proof = [
  ["01", "Вы присылаете контекст", "Кого поздравляем, повод, настроение и бюджет."],
  ["02", "WINK собирает решение", "Не сотню позиций — максимум два варианта, которые подходят под задачу."],
  ["03", "Вы делаете подарок личным", "Цвет, цифра, надпись и нужные дополнения — только после выбора основы."],
  ["04", "Мы подтверждаем доставку", "Дата, адрес и полная сумма согласуются до оплаты."],
] as const;

const faq = [
  ["Мне нужно сегодня. Это реально?", "Иногда да. Напишите WINK до оформления — быстро скажем, что можно собрать и доставить к нужному времени."],
  ["Можно не звонить получателю?", "Да. В оформлении есть режим сюрприза: организационные вопросы решаем с вами."],
  ["Цена на сайте финальная?", "Цена выбранной композиции и персонализации видна сразу. Доставка считается отдельно и подтверждается до оплаты."],
  ["Если я вообще не понимаю, что красиво?", "Для этого и существует WINK MATCH. Четыре ответа — и мы сужаем выбор до двух решений."],
] as const;

function V3Product({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <motion.article
      className="wv3-product"
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: EASE }}
    >
      <Link className="wv3-product-image" href={productHref(product.slug)}>
        <Image
          src={productImage(product)}
          alt={`Композиция ${product.subtitle}`}
          fill
          unoptimized
          sizes="(max-width: 760px) 86vw, 31vw"
        />
        <span className="wv3-product-index">0{index + 1}</span>
      </Link>
      <div className="wv3-product-meta">
        <div>
          <p>{FAMILY_NAMES[product.name] || product.name}</p>
          <h3>{product.subtitle}</h3>
        </div>
        <div>
          <strong>{money(displayPrice(product))}</strong>
          <Link href={productHref(product.slug)} aria-label={`Открыть ${product.subtitle}`}>
            <ShopIcon name="arrow" />
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
  const heroImageY = useTransform(heroProgress, [0, 1], [0, 70]);
  const heroImageScale = useTransform(heroProgress, [0, 1], [1, 1.06]);
  const heroWordY = useTransform(heroProgress, [0, 1], [0, -60]);

  const startPrice = catalog.products.length
    ? Math.min(...catalog.products.map((product) => displayPrice(product)))
    : 0;

  const edit = useMemo(() => {
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
    matchRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <main className="wv3-home">
      <section className="wv3-hero" ref={heroRef} aria-labelledby="wv3-title">
        <div className="wv3-hero-copy">
          <p className="wv3-label">WINK / Кемерово / gifting studio</p>
          <motion.h1 id="wv3-title" style={reducedMotion ? undefined : { y: heroWordY }}>
            Важный повод.
            <br />
            <em>Красивый жест.</em>
            <br />
            Без мучительного выбора.
          </motion.h1>
          <div className="wv3-hero-cta">
            <p>
              Скажите, кого поздравляем, повод и бюджет. WINK предложит два точных решения,
              персонализирует и согласует доставку.
            </p>
            <button type="button" className="wv3-button dark" onClick={startMatch}>
              Подобрать подарок <ShopIcon name="arrow" />
            </button>
            {startPrice > 0 && <small>Композиции от {money(startPrice)} · доставка отдельно</small>}
          </div>
        </div>

        <motion.div
          className="wv3-hero-stage"
          style={reducedMotion ? undefined : { y: heroImageY, scale: heroImageScale }}
        >
          <Image
            src={IMAGES.air}
            alt="Воздушная композиция WINK в светлом интерьере"
            fill
            priority
            unoptimized
            sizes="(max-width: 820px) 100vw, 56vw"
          />
          <span className="wv3-stage-caption">AIR / готовое поздравление</span>
        </motion.div>
        <Link href="/shop" className="wv3-hero-shop">Все решения ↗</Link>
      </section>

      <section className="wv3-statement" aria-label="Позиционирование WINK">
        <p>Не магазин, где надо стать экспертом по шарам.</p>
        <h2>WINK — это человек с хорошим вкусом, который <em>уже сократил выбор за вас.</em></h2>
        <span>Контекст → 2 решения → личная деталь → доставка</span>
      </section>

      <section className="wv3-match" id="finder" ref={matchRef} aria-labelledby="wv3-match-title">
        <div className="wv3-match-intro">
          <p className="wv3-label">WINK MATCH / 4 ответа</p>
          <h2 id="wv3-match-title">Не листайте каталог. Дайте нам контекст.</h2>
          <p>В конце — не больше двух вариантов. Потому что хороший сервис уменьшает неопределённость, а не добавляет её.</p>
        </div>

        <div className="wv3-match-console" key={matchKey}>
          <div className="wv3-match-progress" aria-label={`Шаг ${Math.min(answers.length + 1, 4)} из 4`}>
            {[0, 1, 2, 3].map((item) => (
              <i key={item} className={item < answers.length ? "done" : item === answers.length ? "active" : ""} />
            ))}
          </div>

          {!completed ? (
            <motion.div
              className="wv3-question"
              key={answers.length}
              initial={reducedMotion ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE }}
            >
              <p>{questions[step].eyebrow}</p>
              <h3>{questions[step].title}</h3>
              <div className="wv3-options">
                {questions[step].values.map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setAnswers((current) => [...current, value])}
                  >
                    <span>{label}</span><ShopIcon name="arrow" />
                  </button>
                ))}
              </div>
              {answers.length > 0 && (
                <button type="button" className="wv3-back" onClick={() => setAnswers((current) => current.slice(0, -1))}>
                  ← Назад
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="wv3-results"
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <div className="wv3-results-head">
                <div><p>WINK MATCH / результат</p><h3>Вот с чего мы бы начали.</h3></div>
                <button type="button" onClick={() => setAnswers([])}>Пройти заново</button>
              </div>
              {recommendations.length ? (
                <div className="wv3-result-grid">
                  {recommendations.map((product, index) => <V3Product key={product.slug} product={product} index={index} />)}
                </div>
              ) : (
                <div className="wv3-no-result">
                  <h3>В эту рамку сейчас не помещается решение, которым мы довольны.</h3>
                  <Link href="/shop">Посмотреть все готовые решения →</Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <section className="wv3-edit" aria-labelledby="wv3-edit-title">
        <header>
          <p className="wv3-label">THE WINK EDIT / готовые решения</p>
          <h2 id="wv3-edit-title">Три сценария, которые уже собраны правильно.</h2>
          <Link href="/shop">Смотреть весь каталог ↗</Link>
        </header>
        <div className="wv3-edit-grid">
          {edit.map((product, index) => <V3Product key={product.slug} product={product} index={index} />)}
        </div>
      </section>

      <section className="wv3-personal" aria-labelledby="wv3-personal-title">
        <div className="wv3-personal-image main">
          <Image src={IMAGES.birthday} alt="Композиция WINK с цифрами ко дню рождения" fill unoptimized sizes="(max-width: 820px) 100vw, 58vw" />
        </div>
        <div className="wv3-personal-copy">
          <p className="wv3-label">Сделать личным</p>
          <h2 id="wv3-personal-title">Основа уже красивая. Теперь добавьте <em>вашего человека.</em></h2>
          <p>Возраст, короткая надпись, спокойная или контрастная палитра. Персонализация не должна превращать подарок в конструктор из двадцати решений.</p>
          <Link className="wv3-button light" href="/build">Персонализировать <ShopIcon name="arrow" /></Link>
        </div>
        <div className="wv3-personal-image detail" aria-hidden="true">
          <Image src={IMAGES.hearts} alt="" fill unoptimized sizes="26vw" />
        </div>
      </section>

      <section className="wv3-proof" aria-labelledby="wv3-proof-title">
        <div className="wv3-proof-head">
          <p className="wv3-label">Как это работает</p>
          <h2 id="wv3-proof-title">Красивый результат — это не магия. Это четыре понятных шага.</h2>
        </div>
        <div className="wv3-proof-list">
          {proof.map(([number, title, text], index) => (
            <motion.article
              key={number}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.65, delay: index * 0.05, ease: EASE }}
            >
              <span>{number}</span><h3>{title}</h3><p>{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="wv3-faq" aria-labelledby="wv3-faq-title">
        <div>
          <p className="wv3-label">Перед заказом</p>
          <h2 id="wv3-faq-title">То, что обычно хочется спросить до оплаты.</h2>
        </div>
        <div className="wv3-faq-list">
          {faq.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}<span>+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="wv3-close" aria-labelledby="wv3-close-title">
        <div className="wv3-close-image" aria-hidden="true">
          <Image src={IMAGES.hearts} alt="" fill unoptimized sizes="100vw" />
        </div>
        <div className="wv3-close-copy">
          <p className="wv3-label">WINK / Кемерово</p>
          <h2 id="wv3-close-title">Скажите, кого хочется порадовать. <em>Остальное соберём.</em></h2>
          <button className="wv3-button light" type="button" onClick={startMatch}>Начать подбор <ShopIcon name="arrow" /></button>
        </div>
      </section>
    </main>
  );
}
