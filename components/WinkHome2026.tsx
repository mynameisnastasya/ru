"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef, useState } from "react";
import {
  CONTACT_URL,
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
    label: "01 · Человек",
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
    label: "02 · Повод",
    title: "Что за момент?",
    values: [
      ["birthday", "День рождения"],
      ["love", "Хочу сказать «люблю»"],
      ["any", "Просто порадовать"],
      ["baby", "Baby reveal"],
    ],
  },
  {
    label: "03 · Настроение",
    title: "Как должно ощущаться?",
    values: [
      ["PINK_MILK", "Нежно"],
      ["PINK_CHROME", "С блеском"],
      ["MILK", "Спокойно"],
      ["BLACK_CHROME", "Графично"],
    ],
  },
  {
    label: "04 · Бюджет",
    title: "Какую рамку держим?",
    values: [
      ["5000", "До 5 000 ₽"],
      ["7500", "До 7 500 ₽"],
      ["any", "Можно гибко"],
    ],
  },
] as const;

const trustRows = [
  ["01", "Цена понятна до оформления", "Стоимость композиции и персонализации видна сразу. Доставку подтверждаем отдельно до оплаты."],
  ["02", "Сюрприз можно сохранить", "Если получателю не нужно звонить заранее, отметьте это при оформлении — организационные вопросы решим с вами."],
  ["03", "Детали подтверждаем до оплаты", "Дата, адрес, состав и итоговая сумма сначала согласуются. Только после этого заказ считается подтверждённым."],
] as const;

const faq = [
  ["Мне нужно сегодня. Есть шанс?", "Иногда да. Напишите WINK до оформления — быстро проверим, что можно собрать и доставить к нужному времени."],
  ["Можно поменять цвета?", "Да, если выбранная композиция поддерживает нужную палитру. Доступные сочетания показываем в карточке товара."],
  ["Можно добавить цифру или надпись?", "Да. Для подходящих композиций персонализация добавляется после выбора основы — без необходимости собирать набор с нуля."],
  ["Я вообще не понимаю, что выбрать", "Это нормальный сценарий. WINK MATCH задаст четыре вопроса и оставит максимум два подходящих варианта."],
] as const;

function EditCard({ product, index, large = false }: { product: Product; index: number; large?: boolean }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.article
      className={`wb5-edit-card${large ? " is-large" : ""}`}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: EASE }}
    >
      <Link className="wb5-edit-media" href={productHref(product.slug)}>
        <Image
          src={productImage(product)}
          alt={`Композиция ${product.subtitle}`}
          fill
          unoptimized
          sizes={large ? "(max-width: 760px) 88vw, 58vw" : "(max-width: 760px) 88vw, 36vw"}
        />
      </Link>
      <div className="wb5-edit-meta">
        <div>
          <span>0{index + 1}</span>
          <h3>{product.subtitle}</h3>
        </div>
        <div>
          <strong>{money(displayPrice(product))}</strong>
          <Link href={productHref(product.slug)} aria-label={`Открыть ${product.subtitle}`}>
            Подробнее <ShopIcon name="arrow" />
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
  const finderRef = useRef<HTMLElement>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [finderKey, setFinderKey] = useState(0);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.045]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 26]);

  const startPrice = catalog.products.length
    ? Math.min(...catalog.products.map((product) => displayPrice(product)))
    : 0;

  const edit = useMemo(() => {
    const slugs = ["birthday16-2", "hearts7", "air16"];
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
            (product.name === "HEARTS" || product.name === "BABY REVEAL" || paletteIds(product).includes(palette)) &&
            (occasion === "baby" ? product.name === "BABY REVEAL" : product.name !== "BABY REVEAL"),
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

  const completed = answers.length === 4;
  const step = Math.min(answers.length, 3);
  const previewImage =
    answers[1] === "birthday" || answers[0] === "kids"
      ? IMAGES.birthday
      : answers[1] === "love" || answers[0] === "her"
        ? IMAGES.hearts
        : IMAGES.air;

  function startFinder() {
    setAnswers([]);
    setFinderKey((value) => value + 1);
    window.requestAnimationFrame(() => {
      finderRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  }

  return (
    <main className="wb5-home">
      <section className="wb5-hero" ref={heroRef} aria-labelledby="wb5-title">
        <div className="wb5-hero-copy">
          <p className="wb5-kicker">WINK · gifting studio · Кемерово</p>
          <h1 id="wb5-title">Подарок, который не надо придумывать.</h1>
          <div className="wb5-hero-bottom">
            <p>
              Ответьте на четыре вопроса. Мы сократим выбор до двух готовых решений,
              поможем сделать подарок личным и согласуем доставку.
            </p>
            <div className="wb5-actions">
              <button type="button" className="wb5-button" onClick={startFinder} data-wink-finder-open>
                Подобрать подарок <ShopIcon name="arrow" />
              </button>
              <Link className="wb5-text-link" href="/shop">Смотреть коллекцию</Link>
            </div>
            {startPrice > 0 && <small>Композиции от {money(startPrice)} · доставка отдельно</small>}
          </div>
        </div>
        <motion.figure
          className="wb5-hero-media"
          style={reducedMotion ? undefined : { scale: heroScale, y: heroY }}
        >
          <Image
            src={IMAGES.air}
            alt="Воздушная композиция WINK в светлом интерьере"
            fill
            priority
            unoptimized
            sizes="(max-width: 820px) 100vw, 55vw"
          />
          <figcaption>WINK AIR · готовое решение</figcaption>
        </motion.figure>
      </section>

      <section className="wb5-facts" aria-label="Как работает WINK">
        <div><strong>4</strong><span>коротких ответа</span></div>
        <div><strong>2</strong><span>варианта максимум</span></div>
        <div><strong>1</strong><span>готовое поздравление</span></div>
      </section>

      <section className="wb5-intro" aria-labelledby="wb5-intro-title">
        <p className="wb5-kicker">Не каталог ради каталога</p>
        <h2 id="wb5-intro-title">Хороший сервис не даёт больше выбора. Он оставляет правильный.</h2>
        <p>
          Вам не нужно сравнивать десятки почти одинаковых наборов. WINK сначала понимает
          человека и повод, потом показывает то, что действительно подходит.
        </p>
      </section>

      <section className="wb5-finder" id="finder" ref={finderRef} aria-labelledby="wb5-finder-title">
        <div className="wb5-finder-intro">
          <div>
            <p className="wb5-kicker">WINK MATCH</p>
            <h2 id="wb5-finder-title">Дайте контекст. Мы сделаем выбор короче.</h2>
          </div>
          <p>Четыре ответа занимают меньше минуты. В результате — максимум два решения.</p>
        </div>

        <div className="wb5-finder-stage" key={finderKey}>
          <div className="wb5-finder-visual" aria-hidden="true">
            <AnimatePresence mode="wait">
              <motion.div
                key={previewImage}
                initial={reducedMotion ? false : { opacity: 0, scale: 1.025 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <Image src={previewImage} alt="" fill unoptimized sizes="(max-width: 760px) 100vw, 44vw" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="wb5-finder-panel">
            <div className="wb5-progress" aria-label={`Шаг ${Math.min(answers.length + 1, 4)} из 4`}>
              {[0, 1, 2, 3].map((index) => (
                <span key={index} className={index < answers.length ? "done" : index === answers.length ? "active" : ""} />
              ))}
            </div>

            {!completed ? (
              <AnimatePresence mode="wait">
                <motion.div
                  className="wb5-question"
                  key={answers.length}
                  initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <p>{questions[step].label}</p>
                  <h3>{questions[step].title}</h3>
                  <div className="wb5-options">
                    {questions[step].values.map(([value, label]) => (
                      <button type="button" key={value} onClick={() => setAnswers((current) => [...current, value])}>
                        <span>{label}</span><ShopIcon name="arrow" />
                      </button>
                    ))}
                  </div>
                  {answers.length > 0 && (
                    <button type="button" className="wb5-back" onClick={() => setAnswers((current) => current.slice(0, -1))}>
                      ← Назад
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div
                className="wb5-results"
                initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <div className="wb5-results-head">
                  <div><p>Результат WINK MATCH</p><h3>Вот с чего мы бы начали.</h3></div>
                  <button type="button" onClick={() => setAnswers([])}>Пройти заново</button>
                </div>
                {recommendations.length ? (
                  <div className="wb5-result-grid">
                    {recommendations.map((product, index) => <EditCard key={product.slug} product={product} index={index} />)}
                  </div>
                ) : (
                  <div className="wb5-empty-result">
                    <p>В этой рамке сейчас нет решения, которым мы довольны.</p>
                    <Link href="/shop">Посмотреть всю коллекцию</Link>
                    <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">Написать WINK</a>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="wb5-edit" aria-labelledby="wb5-edit-title">
        <header>
          <div>
            <p className="wb5-kicker">The WINK edit</p>
            <h2 id="wb5-edit-title">Готовые сценарии вместо бесконечной ленты.</h2>
          </div>
          <Link href="/shop" className="wb5-text-link">Вся коллекция <ShopIcon name="arrow" /></Link>
        </header>
        <div className="wb5-edit-layout">
          {edit.map((product, index) => <EditCard key={product.slug} product={product} index={index} large={index === 0} />)}
        </div>
      </section>

      <section className="wb5-personal" aria-labelledby="wb5-personal-title">
        <div className="wb5-personal-copy">
          <p className="wb5-kicker">После выбора основы</p>
          <h2 id="wb5-personal-title">Сделайте подарок именно про вашего человека.</h2>
          <p>
            Важная цифра, короткая надпись, нужная палитра. Сначала выбираем сильную основу,
            потом добавляем личные детали — поэтому результат остаётся цельным.
          </p>
          <Link className="wb5-button secondary" href="/build">Персонализировать <ShopIcon name="arrow" /></Link>
        </div>
        <figure className="wb5-personal-media">
          <Image src={IMAGES.birthday} alt="Композиция WINK с серебряными цифрами" fill unoptimized sizes="(max-width: 760px) 100vw, 55vw" />
          <div className="wb5-personal-tags" aria-hidden="true">
            <span>цифра</span><span>надпись</span><span>палитра</span>
          </div>
        </figure>
      </section>

      <section className="wb5-trust" aria-labelledby="wb5-trust-title">
        <header>
          <p className="wb5-kicker">До того, как вы платите</p>
          <h2 id="wb5-trust-title">Никакой магии в важных деталях.</h2>
        </header>
        <div className="wb5-trust-rows">
          {trustRows.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wb5-faq" aria-labelledby="wb5-faq-title">
        <div>
          <p className="wb5-kicker">Перед первым WINK</p>
          <h2 id="wb5-faq-title">То, что обычно спрашивают.</h2>
        </div>
        <div className="wb5-faq-list">
          {faq.map(([question, answer]) => (
            <details key={question}>
              <summary><span>{question}</span><i>+</i></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="wb5-close" aria-labelledby="wb5-close-title">
        <figure>
          <Image src={IMAGES.hearts} alt="Композиция WINK из фольгированных сердец" fill unoptimized sizes="100vw" />
        </figure>
        <div>
          <p className="wb5-kicker">Если повод уже близко</p>
          <h2 id="wb5-close-title">Не ищите идеальный набор. Дайте нам контекст.</h2>
          <button type="button" className="wb5-button light" onClick={startFinder} data-wink-finder-open>
            Получить 2 варианта <ShopIcon name="arrow" />
          </button>
        </div>
      </section>
    </main>
  );
}
