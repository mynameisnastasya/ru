"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
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
    eyebrow: "01 · Человек",
    title: "Кого поздравляем?",
    values: [["her", "Её"], ["him", "Его"], ["kids", "Ребёнка"], ["mom", "Маму"], ["friend", "Подругу"]],
  },
  {
    eyebrow: "02 · Повод",
    title: "Что случилось?",
    values: [["birthday", "День рождения"], ["love", "Хочу сказать «люблю»"], ["any", "Просто порадовать"], ["baby", "Baby reveal"]],
  },
  {
    eyebrow: "03 · Настроение",
    title: "Какой нужен характер?",
    values: [["PINK_MILK", "Нежный"], ["PINK_CHROME", "С эффектом вау"], ["MILK", "Спокойный"], ["BLACK_CHROME", "Графичный"]],
  },
  {
    eyebrow: "04 · Бюджет",
    title: "Какую рамку держим?",
    values: [["5000", "До 5 000 ₽"], ["7500", "До 7 500 ₽"], ["any", "Можно гибко"]],
  },
] as const;

const storySteps = [
  ["01", "Контекст", "Кому, по какому поводу и что хочется сказать этим подарком."],
  ["02", "Редактура", "Убираем лишнее. Оставляем сочетания, которые уже работают визуально."],
  ["03", "Личная деталь", "Цифра, короткая надпись или палитра — ровно столько персонализации, сколько нужно."],
  ["04", "Момент", "До оплаты подтверждаем дату, адрес, доставку и итоговую сумму."],
] as const;

const certainty = [
  ["Состав", "Точная комплектация — в карточке выбранной композиции."],
  ["Цена", "Композиция и персонализация считаются до оформления."],
  ["Доставка", "Адрес, дата и стоимость доставки подтверждаются до оплаты."],
  ["Сюрприз", "Можно попросить не звонить получателю заранее."],
] as const;

const faq = [
  ["Мне нужно сегодня. Реально?", "Иногда да. Напишите WINK до оформления — быстро скажем, что можно собрать и доставить к нужному времени."],
  ["Я вообще не понимаю, что выбрать", "Это нормальный сценарий для WINK MATCH. Четыре ответа — и мы оставляем максимум два решения, с которых стоит начать."],
  ["Можно сохранить сюрприз?", "Да. В оформлении можно указать, что получателю не нужно звонить заранее. Организационные детали решим с вами."],
  ["Цена на сайте окончательная?", "Цена композиции и выбранной персонализации видна сразу. Доставка рассчитывается отдельно и подтверждается до оплаты."],
] as const;

function V6Product({ product, index = 0, featured = false }: { product: Product; index?: number; featured?: boolean }) {
  return (
    <motion.article
      className={`wv6-product${featured ? " is-featured" : ""}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.8, delay: index * 0.07, ease: EASE }}
    >
      <Link className="wv6-product-media" href={productHref(product.slug)}>
        <Image
          src={productImage(product)}
          alt={`Композиция ${product.subtitle}`}
          fill
          unoptimized
          sizes={featured ? "(max-width: 760px) 88vw, 52vw" : "(max-width: 760px) 78vw, 31vw"}
        />
        <span className="wv6-product-index">0{index + 1}</span>
      </Link>
      <div className="wv6-product-meta">
        <div>
          <p>{FAMILY_NAMES[product.name] || product.name}</p>
          <h3>{product.subtitle}</h3>
        </div>
        <div className="wv6-product-buy">
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
  const storyRef = useRef<HTMLElement>(null);
  const finderRef = useRef<HTMLElement>(null);
  const personalRef = useRef<HTMLElement>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [matchKey, setMatchKey] = useState(0);

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useTransform(heroProgress, [0, 1], [0, 82]);
  const heroImageScale = useTransform(heroProgress, [0, 1], [1, 1.055]);
  const heroWordY = useTransform(heroProgress, [0, 1], [0, -42]);

  const { scrollYProgress: storyProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const storyOne = useTransform(storyProgress, [0, 0.2, 0.34], [1, 1, 0]);
  const storyTwo = useTransform(storyProgress, [0.2, 0.34, 0.55, 0.68], [0, 1, 1, 0]);
  const storyThree = useTransform(storyProgress, [0.55, 0.69, 1], [0, 1, 1]);
  const storyScale = useTransform(storyProgress, [0, 1], [1.06, 1]);

  const { scrollYProgress: personalProgress } = useScroll({ target: personalRef, offset: ["start end", "end start"] });
  const personalY = useTransform(personalProgress, [0, 1], [-28, 36]);

  const startPrice = catalog.products.length
    ? Math.min(...catalog.products.map((product) => displayPrice(product)))
    : 0;

  const edit = useMemo(
    () => ["air16", "birthday16-2", "hearts7"]
      .map((slug) => catalog.products.find((product) => product.slug === slug))
      .filter((product): product is Product => Boolean(product)),
    [catalog.products],
  );

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

  const completed = answers.length === questions.length;
  const step = Math.min(answers.length, questions.length - 1);

  function startMatch() {
    setAnswers([]);
    setMatchKey((value) => value + 1);
    finderRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <main className="wv6-home">
      <section className="wv6-hero" ref={heroRef} aria-labelledby="wv6-title">
        <motion.div className="wv6-hero-word" aria-hidden="true" style={reducedMotion ? undefined : { y: heroWordY }}>
          WINK
        </motion.div>
        <div className="wv6-hero-topline">
          <span>Gifting studio · Кемерово</span>
          <span>Curated gifts / delivery</span>
        </div>
        <motion.figure
          className="wv6-hero-media"
          style={reducedMotion ? undefined : { y: heroImageY, scale: heroImageScale }}
        >
          <Image
            src={IMAGES.air}
            alt="Воздушная композиция WINK"
            fill
            priority
            unoptimized
            sizes="(max-width: 760px) 100vw, 46vw"
          />
          <figcaption><span>AIR / WINK EDIT</span><span>01</span></figcaption>
        </motion.figure>
        <div className="wv6-hero-copy">
          <p className="wv6-kicker">Подарок без мучительного выбора</p>
          <h1 id="wv6-title">Подарок, который <em>попадает в человека.</em></h1>
          <div className="wv6-hero-offer">
            <p>Скажите, кого поздравляете, что случилось и сколько хотите потратить. WINK оставит максимум два точных варианта и доведёт подарок до двери.</p>
            <div className="wv6-actions">
              <button type="button" className="wv6-button is-primary" onClick={startMatch} data-wink-finder-open="true">
                Подобрать мне <ShopIcon name="arrow" />
              </button>
              <Link className="wv6-button" href="/shop">Смотреть готовые</Link>
            </div>
            {startPrice > 0 && <small>Композиции от {money(startPrice)} · доставка отдельно</small>}
          </div>
        </div>
      </section>

      <section className="wv6-promise" aria-label="Позиционирование WINK">
        <div><span>01</span><p>Не 200 вариантов.</p></div>
        <h2>Мы не продаём выбор. <em>Мы берём его на себя.</em></h2>
        <div className="wv6-promise-foot"><p>Контекст → редактура → личная деталь → момент вручения</p><Link href="#finder">Как это работает ↘</Link></div>
      </section>

      <section className="wv6-story" ref={storyRef} aria-labelledby="wv6-story-title">
        <div className="wv6-story-stage" aria-hidden="true">
          <motion.div className="wv6-story-visual" style={reducedMotion ? undefined : { scale: storyScale }}>
            <motion.figure style={reducedMotion ? { opacity: 1 } : { opacity: storyOne }}><Image src={IMAGES.air} alt="" fill unoptimized sizes="50vw" /></motion.figure>
            <motion.figure style={reducedMotion ? { opacity: 0 } : { opacity: storyTwo }}><Image src={IMAGES.birthday} alt="" fill unoptimized sizes="50vw" /></motion.figure>
            <motion.figure style={reducedMotion ? { opacity: 0 } : { opacity: storyThree }}><Image src={IMAGES.hearts} alt="" fill unoptimized sizes="50vw" /></motion.figure>
          </motion.div>
          <div className="wv6-story-stamp"><span>WINK / METHOD</span><span>04 STATES</span></div>
        </div>
        <div className="wv6-story-copy">
          <header>
            <p className="wv6-kicker">The choreography of a gift</p>
            <h2 id="wv6-story-title">Хороший подарок не должен начинаться с каталога.</h2>
          </header>
          <div className="wv6-story-steps">
            {storySteps.map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="wv6-match" id="finder" ref={finderRef} aria-labelledby="wv6-match-title">
        <header>
          <div><p className="wv6-kicker">WINK MATCH / 4 ответа</p><h2 id="wv6-match-title">Четыре ответа. <em>До двух вариантов.</em></h2></div>
          <p>Вместо бесконечной ленты — короткий разговор о человеке, поводе, характере и бюджете.</p>
        </header>
        <div className="wv6-match-shell" key={matchKey}>
          <div className="wv6-match-index">
            <span>WINK MATCH</span>
            <strong>0{Math.min(answers.length + 1, 4)}</strong>
            <span>/ 04</span>
          </div>
          <div className="wv6-match-body">
            <div
              className="wv6-progress"
              role="progressbar"
              aria-label="Прогресс подбора"
              aria-valuemin={1}
              aria-valuemax={4}
              aria-valuenow={Math.min(answers.length + 1, 4)}
            >
              {[0, 1, 2, 3].map((item) => <i key={item} className={item < answers.length ? "done" : item === answers.length ? "active" : ""} />)}
            </div>
            {!completed ? (
              <motion.div
                className="wv6-question"
                key={answers.length}
                initial={reducedMotion ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.62, ease: EASE }}
              >
                <p>{questions[step].eyebrow}</p>
                <h3>{questions[step].title}</h3>
                <div className="wv6-options">
                  {questions[step].values.map(([value, label]) => (
                    <button type="button" key={value} onClick={() => setAnswers((current) => [...current, value])}>
                      <span>{label}</span><ShopIcon name="arrow" />
                    </button>
                  ))}
                </div>
                {answers.length > 0 && <button type="button" className="wv6-back" onClick={() => setAnswers((current) => current.slice(0, -1))}>← Назад</button>}
              </motion.div>
            ) : (
              <motion.div
                className="wv6-results"
                initial={reducedMotion ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.68, ease: EASE }}
              >
                <div className="wv6-results-head"><div><p>WINK MATCH / результат</p><h3>С этих двух мы бы начали.</h3></div><button type="button" onClick={() => setAnswers([])}>Пройти заново</button></div>
                {recommendations.length ? (
                  <div className="wv6-result-grid">{recommendations.map((product, index) => <V6Product key={product.slug} product={product} index={index} />)}</div>
                ) : (
                  <div className="wv6-empty"><p>В этой рамке сейчас нет решения, которое мы готовы рекомендовать.</p><Link href="/shop">Посмотреть всю коллекцию →</Link></div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="wv6-edit" aria-labelledby="wv6-edit-title">
        <header>
          <div><p className="wv6-kicker">The WINK edit / 03</p><h2 id="wv6-edit-title">Три способа сказать: <em>«я о тебе подумал».</em></h2></div>
          <Link href="/shop">Вся коллекция <ShopIcon name="arrow" /></Link>
        </header>
        <div className="wv6-edit-grid">{edit.map((product, index) => <V6Product key={product.slug} product={product} index={index} featured={index === 0} />)}</div>
        <p className="wv6-caption">Фото показывают настроение коллекций. Точный состав и количество шаров указаны в карточке каждой композиции.</p>
      </section>

      <section className="wv6-personal" ref={personalRef} aria-labelledby="wv6-personal-title">
        <motion.figure className="wv6-personal-media" style={reducedMotion ? undefined : { y: personalY }}>
          <Image src={IMAGES.birthday} alt="Композиция WINK с цифрами ко дню рождения" fill unoptimized sizes="(max-width: 760px) 100vw, 55vw" />
        </motion.figure>
        <div className="wv6-personal-panel">
          <p className="wv6-kicker">Personal / one exact detail</p>
          <h2 id="wv6-personal-title">Один штрих — и готовое решение <em>становится личным.</em></h2>
          <p>Не собирайте дизайн с нуля. Выберите основу, а затем добавьте то, что действительно связано с человеком.</p>
          <div className="wv6-personal-options">
            <div><span>01</span><strong>Цифра</strong><p>Возраст или важная дата.</p></div>
            <div><span>02</span><strong>Надпись</strong><p>Короткая фраза на Bubble.</p></div>
            <div><span>03</span><strong>Палитра</strong><p>Готовое сочетание оттенков.</p></div>
          </div>
          <Link href="/build" className="wv6-text-link">Персонализировать <ShopIcon name="arrow" /></Link>
        </div>
      </section>

      <section className="wv6-certainty" aria-labelledby="wv6-certainty-title">
        <header><p className="wv6-kicker">Confidence before checkout</p><h2 id="wv6-certainty-title">До оплаты вы знаете <em>всё важное.</em></h2></header>
        <div className="wv6-certainty-grid">
          {certainty.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p><i>↘</i></article>)}
        </div>
      </section>

      <section className="wv6-faq" aria-labelledby="wv6-faq-title">
        <div><p className="wv6-kicker">Questions / before order</p><h2 id="wv6-faq-title">Без мелкого шрифта <em>в конце.</em></h2></div>
        <div className="wv6-faq-list">{faq.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="wv6-close" aria-labelledby="wv6-close-title">
        <figure><Image src={IMAGES.hearts} alt="Композиция WINK с фольгированными сердцами" fill unoptimized sizes="100vw" /></figure>
        <div className="wv6-close-copy">
          <p className="wv6-kicker">WINK / Кемерово</p>
          <h2 id="wv6-close-title">Есть человек. Есть повод. <em>Остальное — WINK.</em></h2>
          <div className="wv6-actions">
            <button type="button" className="wv6-button is-light" onClick={startMatch} data-wink-finder-open="true">Подобрать подарок <ShopIcon name="arrow" /></button>
            <Link className="wv6-button is-ghost-light" href="/shop">Смотреть коллекцию</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
