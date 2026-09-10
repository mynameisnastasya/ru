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
  { eyebrow: "01 · Человек", title: "Кого поздравляем?", values: [["her", "Её"], ["him", "Его"], ["kids", "Ребёнка"], ["mom", "Маму"], ["friend", "Подругу"]] },
  { eyebrow: "02 · Повод", title: "Что происходит?", values: [["birthday", "День рождения"], ["love", "Хочу сказать «люблю»"], ["any", "Просто порадовать"], ["baby", "Baby reveal"]] },
  { eyebrow: "03 · Настроение", title: "Как это должно ощущаться?", values: [["PINK_MILK", "Нежно"], ["PINK_CHROME", "С эффектом вау"], ["MILK", "Спокойно"], ["BLACK_CHROME", "Графично"]] },
  { eyebrow: "04 · Бюджет", title: "Какую рамку держим?", values: [["5000", "До 5 000 ₽"], ["7500", "До 7 500 ₽"], ["any", "Можно гибко"]] },
] as const;

const orderSteps = [
  ["01", "Запрос", "Вы отвечаете на четыре вопроса или выбираете готовую композицию."],
  ["02", "Решение", "WINK помогает сузить выбор и фиксирует персональные детали."],
  ["03", "Подтверждение", "До оплаты согласуем дату, адрес, доставку и итоговую сумму."],
  ["04", "Готово", "Привозим собранную композицию к нужному моменту."],
] as const;

const faq = [
  ["Мне нужно сегодня. Реально?", "Иногда да. Напишите WINK до оформления — быстро скажем, что можно собрать и доставить к нужному времени."],
  ["Можно сохранить сюрприз?", "Да. В оформлении можно указать, что получателю не нужно звонить заранее. Организационные детали решим с вами."],
  ["Цена на сайте финальная?", "Цена композиции и персонализации видна сразу. Доставка рассчитывается отдельно и подтверждается до оплаты."],
  ["Я не понимаю, что выбрать", "Для этого есть WINK MATCH. Четыре коротких ответа — и мы оставляем максимум два подходящих решения."],
] as const;

function V5Product({ product, index = 0, featured = false }: { product: Product; index?: number; featured?: boolean }) {
  return (
    <motion.article
      className={`wv5-product${featured ? " featured" : ""}`}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.75, delay: index * 0.06, ease: EASE }}
    >
      <Link className="wv5-product-media" href={productHref(product.slug)}>
        <Image src={productImage(product)} alt={`Композиция ${product.subtitle}`} fill unoptimized sizes={featured ? "(max-width: 760px) 88vw, 52vw" : "(max-width: 760px) 78vw, 30vw"} />
        <span>0{index + 1}</span>
      </Link>
      <div className="wv5-product-copy">
        <div><p>{FAMILY_NAMES[product.name] || product.name}</p><h3>{product.subtitle}</h3></div>
        <div className="wv5-product-action"><strong>{money(displayPrice(product))}</strong><Link href={productHref(product.slug)}>Подробнее <ShopIcon name="arrow" /></Link></div>
      </div>
    </motion.article>
  );
}

export default function WinkHome2026() {
  const { catalog } = useWinkCatalog();
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const finderRef = useRef<HTMLElement>(null);
  const personalRef = useRef<HTMLElement>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroMediaY = useTransform(heroProgress, [0, 1], [0, 68]);
  const heroMediaScale = useTransform(heroProgress, [0, 1], [1, 1.045]);
  const heroCopyY = useTransform(heroProgress, [0, 1], [0, -28]);
  const { scrollYProgress: personalProgress } = useScroll({ target: personalRef, offset: ["start end", "end start"] });
  const personalY = useTransform(personalProgress, [0, 1], [-24, 34]);

  const edit = useMemo(() => ["air16", "birthday16-2", "hearts7"].map((slug) => catalog.products.find((product) => product.slug === slug)).filter((product): product is Product => Boolean(product)), [catalog.products]);

  const recommendations = useMemo(() => {
    if (answers.length !== 4) return [];
    const [recipient, occasion, palette, budget] = answers;
    return rankFinderCandidates(
      catalog.products
        .filter((product) => budgetMatches(displayPrice(product, palette), budget) && (product.name === "HEARTS" || product.name === "BABY REVEAL" || paletteIds(product).includes(palette)) && (occasion === "baby" ? product.name === "BABY REVEAL" : product.name !== "BABY REVEAL"))
        .map((product) => ({
          item: product,
          signals: {
            recipientMatch: recipient === "kids" ? Number(product.name === "BIRTHDAY") : recipient === "him" ? Number(["AIR", "BIRTHDAY", "MESSAGE"].includes(product.name)) : 1,
            occasionMatch: occasion === "birthday" ? Number(product.name === "BIRTHDAY") : occasion === "love" ? Number(["LOVE", "HEARTS", "MESSAGE"].includes(product.name)) : 1,
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
  const startPrice = catalog.products.length ? Math.min(...catalog.products.map((product) => displayPrice(product))) : 0;

  function startMatch() {
    setAnswers([]);
    finderRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <main className="wv5-home">
      <section className="wv5-hero" ref={heroRef} aria-labelledby="wv5-title">
        <motion.div className="wv5-hero-copy" style={reducedMotion ? undefined : { y: heroCopyY }}>
          <p className="wv5-kicker">WINK / gifting studio / Кемерово</p>
          <h1 id="wv5-title">Красиво поздравить — <span>без долгого выбора.</span></h1>
          <div className="wv5-hero-bottom">
            <p>Четыре ответа — и WINK покажет максимум два решения, которые подходят человеку, поводу и бюджету.</p>
            <div className="wv5-hero-actions">
              <button type="button" className="wv5-button primary" onClick={startMatch}>Подобрать за 4 ответа <ShopIcon name="arrow" /></button>
              <Link className="wv5-button ghost" href="/shop">Смотреть коллекцию</Link>
            </div>
            {startPrice > 0 && <small>Композиции от {money(startPrice)} · доставка отдельно</small>}
          </div>
        </motion.div>
        <motion.figure className="wv5-hero-media" style={reducedMotion ? undefined : { y: heroMediaY, scale: heroMediaScale }}>
          <Image src={IMAGES.air} alt="Воздушная композиция WINK" fill priority unoptimized sizes="(max-width: 820px) 100vw, 58vw" />
          <figcaption><span>AIR / готовое поздравление</span><span>01 / WINK EDIT</span></figcaption>
        </motion.figure>
      </section>

      <section className="wv5-position" aria-label="Что такое WINK">
        <div><p className="wv5-kicker">Не каталог ради каталога</p><h2>Не нужно становиться экспертом по шарам, чтобы <span>сделать красивый подарок.</span></h2></div>
        <div className="wv5-position-notes"><p>Мы уже собрали сочетания, которые работают.</p><p>Вы добавляете человека, повод и личную деталь.</p><p>Доставка и итоговая сумма подтверждаются до оплаты.</p></div>
      </section>

      <section className="wv5-match" id="finder" ref={finderRef} aria-labelledby="wv5-match-title">
        <div className="wv5-match-intro">
          <p className="wv5-kicker">WINK MATCH / главный сценарий</p>
          <h2 id="wv5-match-title">Дайте нам контекст. <span>Мы сократим выбор.</span></h2>
          <p>Не бесконечная лента товаров, а четыре коротких решения. В финале — максимум два варианта.</p>
          <div className="wv5-match-counter" aria-hidden="true">0{Math.min(answers.length + 1, 4)} / 04</div>
        </div>
        <div className="wv5-match-panel">
          <div className="wv5-progress" aria-label={`Шаг ${Math.min(answers.length + 1, 4)} из 4`}>{[0, 1, 2, 3].map((item) => <i key={item} className={item < answers.length ? "done" : item === answers.length ? "active" : ""} />)}</div>
          {!completed ? (
            <motion.div className="wv5-question" key={answers.length} initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
              <p>{questions[step].eyebrow}</p><h3>{questions[step].title}</h3>
              <div className="wv5-options">{questions[step].values.map(([value, label]) => <button type="button" key={value} onClick={() => setAnswers((current) => [...current, value])}><span>{label}</span><ShopIcon name="arrow" /></button>)}</div>
              {answers.length > 0 && <button type="button" className="wv5-back" onClick={() => setAnswers((current) => current.slice(0, -1))}>← Назад</button>}
            </motion.div>
          ) : (
            <motion.div className="wv5-results" initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: EASE }}>
              <div className="wv5-results-head"><div><p>WINK MATCH / результат</p><h3>Начните с этих вариантов.</h3></div><button type="button" onClick={() => setAnswers([])}>Пройти заново</button></div>
              {recommendations.length ? <div className="wv5-result-grid">{recommendations.map((product, index) => <V5Product key={product.slug} product={product} index={index} />)}</div> : <div className="wv5-empty"><p>В этой рамке сейчас нет решения, которое мы готовы рекомендовать.</p><Link href="/shop">Посмотреть всю коллекцию →</Link></div>}
            </motion.div>
          )}
        </div>
      </section>

      <section className="wv5-edit" aria-labelledby="wv5-edit-title">
        <header><div><p className="wv5-kicker">The WINK edit / 03 решения</p><h2 id="wv5-edit-title">Готовые сценарии, <span>не товарная стена.</span></h2></div><Link href="/shop">Вся коллекция <ShopIcon name="arrow" /></Link></header>
        <div className="wv5-edit-grid">{edit.map((product, index) => <V5Product key={product.slug} product={product} index={index} featured={index === 0} />)}</div>
        <p className="wv5-visual-note">Фото показывают настроение коллекций. Точный состав и количество шаров указаны в карточке каждой композиции.</p>
      </section>

      <section className="wv5-personal" ref={personalRef} aria-labelledby="wv5-personal-title">
        <motion.figure className="wv5-personal-media" style={reducedMotion ? undefined : { y: personalY }}><Image src={IMAGES.birthday} alt="Композиция WINK с цифрами ко дню рождения" fill unoptimized sizes="(max-width: 760px) 100vw, 52vw" /></motion.figure>
        <div className="wv5-personal-copy">
          <p className="wv5-kicker">Личная деталь / не конструктор ради конструктора</p><h2 id="wv5-personal-title">Подарок становится вашим <span>после одной точной детали.</span></h2>
          <p>Основа уже собрана дизайнером. После выбора добавьте только то, что делает её про вашего человека.</p>
          <div className="wv5-personal-list"><div><span>01</span><strong>Цифра</strong><p>Возраст или дата, которая значит больше, чем просто число.</p></div><div><span>02</span><strong>Надпись</strong><p>Короткая фраза — без необходимости придумывать весь дизайн.</p></div><div><span>03</span><strong>Палитра</strong><p>Готовые сочетания вместо десятков случайных оттенков.</p></div></div>
          <Link className="wv5-inline-link" href="/build">Посмотреть персонализацию <ShopIcon name="arrow" /></Link>
        </div>
      </section>

      <section className="wv5-proof" aria-labelledby="wv5-proof-title">
        <header><p className="wv5-kicker">Что будет после кнопки «Оформить»</p><h2 id="wv5-proof-title">Понятный процесс <span>до оплаты.</span></h2></header>
        <div className="wv5-proof-table">{orderSteps.map(([n, title, text]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p><i>↘</i></article>)}</div>
      </section>

      <section className="wv5-faq" aria-labelledby="wv5-faq-title">
        <div><p className="wv5-kicker">Без мелкого шрифта</p><h2 id="wv5-faq-title">Перед первым WINK.</h2></div>
        <div className="wv5-faq-list">{faq.map(([q, a], index) => <details key={q} open={index === 0}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div>
      </section>

      <section className="wv5-close" aria-labelledby="wv5-close-title">
        <figure><Image src={IMAGES.hearts} alt="Композиция WINK с сердцами" fill unoptimized sizes="100vw" /></figure>
        <div className="wv5-close-copy"><p className="wv5-kicker">Есть человек. Есть повод.</p><h2 id="wv5-close-title">Остальное <span>соберём.</span></h2><div><button type="button" className="wv5-button primary" onClick={startMatch}>Подобрать подарок <ShopIcon name="arrow" /></button><Link className="wv5-button light" href="/shop">Смотреть готовые решения</Link></div></div>
      </section>
    </main>
  );
}
