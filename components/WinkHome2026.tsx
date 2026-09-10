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
  CONTACT_URL,
  IMAGES,
  PALETTES,
  budgetMatches,
  displayPrice,
  money,
  paletteIds,
  type Product,
} from "@/lib/wink-shop";
import { rankFinderCandidates } from "@/lib/wink-finder";
import { useWinkCatalog } from "@/lib/use-wink-catalog";
import { ProductCard, ShopIcon } from "./WinkShopUI";

const EASE = [0.19, 1, 0.22, 1] as const;

const finderQuestions = [
  {
    title: "Кого поздравляем?",
    hint: "Человек важнее состава.",
    values: [
      ["her", "Девушку"],
      ["him", "Мужчину"],
      ["kids", "Ребёнка"],
      ["mom", "Маму"],
      ["friend", "Подругу"],
    ],
  },
  {
    title: "Что за повод?",
    hint: "Повод задаёт эмоциональный сценарий.",
    values: [
      ["birthday", "День рождения"],
      ["love", "Сказать «люблю»"],
      ["any", "Просто порадовать"],
      ["baby", "Узнать пол малыша"],
    ],
  },
  {
    title: "Как должен ощущаться момент?",
    hint: "Не выбирайте оттенки — выберите впечатление.",
    values: [
      ["PINK_MILK", "Нежно"],
      ["PINK_CHROME", "Эффектно"],
      ["MILK", "Спокойно"],
      ["BLACK_CHROME", "Контрастно"],
    ],
  },
  {
    title: "В какой бюджет укладываемся?",
    hint: "Внутри рамки мы ищем лучший визуальный эффект.",
    values: [
      ["5000", "До 5 000 ₽"],
      ["7500", "До 7 500 ₽"],
      ["any", "Бюджет гибкий"],
    ],
  },
] as const;

const faq = [
  [
    "А если я вообще не понимаю, что выбрать?",
    "Это нормальная точка входа. Ответьте на четыре вопроса в WINK MATCH — покажем до двух подходящих решений вместо длинного каталога.",
  ],
  [
    "Цена может измениться после выбора цвета?",
    "Для стандартных палитр цена композиции фиксирована. Если вы добавляете доступную персонализацию или дополнение, изменение суммы видно сразу. Доставка считается отдельно.",
  ],
  [
    "Можно сделать сюрприз и не звонить получателю?",
    "Да. При оформлении отметьте «Это сюрприз — не звонить получателю». Организационные вопросы решаем с вами.",
  ],
  [
    "Когда дата считается подтверждённой?",
    "После того как мы проверили состав заказа и возможность доставки. До этого дата и время в форме — пожелание, а не обещание наугад.",
  ],
] as const;

const tastePrinciples = [
  [
    "01",
    "Масштаб под пространство",
    "Большая комната не становится эффектной просто от большего количества элементов. Сначала нужен правильный визуальный масштаб.",
  ],
  [
    "02",
    "Палитра без случайностей",
    "Несколько согласованных оттенков почти всегда выглядят собраннее, чем попытка добавить всё красивое сразу.",
  ],
  [
    "03",
    "Личная деталь вместо перегруза",
    "Цифра, короткая надпись или точный цвет делают подарок личным сильнее, чем ещё пять декоративных элементов.",
  ],
] as const;

export default function WinkHome2026() {
  const { catalog } = useWinkCatalog();
  const [occasion, setOccasion] = useState("Все");
  const [answers, setAnswers] = useState<string[]>([]);
  const finderHeading = useRef<HTMLHeadingElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const contextRef = useRef<HTMLElement>(null);
  const personalRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.075]);
  const heroMediaY = useTransform(heroProgress, [0, 1], [0, 70]);
  const heroCopyY = useTransform(heroProgress, [0, 1], [0, -68]);
  const heroCopyOpacity = useTransform(
    heroProgress,
    [0, 0.78, 1],
    [1, 0.78, 0.18],
  );

  const { scrollYProgress: contextProgress } = useScroll({
    target: contextRef,
    offset: ["start end", "end start"],
  });
  const contextImageY = useTransform(contextProgress, [0, 1], [56, -54]);
  const contextImageScale = useTransform(contextProgress, [0, 1], [0.94, 1.04]);

  const { scrollYProgress: personalProgress } = useScroll({
    target: personalRef,
    offset: ["start end", "end start"],
  });
  const personalImageY = useTransform(personalProgress, [0, 1], [48, -42]);
  const personalImageScale = useTransform(personalProgress, [0, 1], [0.96, 1.045]);

  const { scrollYProgress: closeProgress } = useScroll({
    target: closeRef,
    offset: ["start end", "end end"],
  });
  const closeScale = useTransform(closeProgress, [0, 1], [0.97, 1.02]);
  const closeY = useTransform(closeProgress, [0, 1], [52, 0]);

  const startPrice = catalog.products.length
    ? Math.min(...catalog.products.map((product) => displayPrice(product)))
    : 0;

  const recommendations = useMemo(() => {
    if (answers.length !== 4) return [];
    const [recipient, event, palette, budget] = answers;
    return rankFinderCandidates(
      catalog.products
        .filter(
          (product) =>
            budgetMatches(displayPrice(product, palette), budget) &&
            (product.name === "HEARTS" ||
              product.name === "BABY REVEAL" ||
              paletteIds(product).includes(palette)) &&
            (event === "baby"
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
                  ? Number(
                      ["AIR", "BIRTHDAY", "MESSAGE"].includes(product.name),
                    )
                  : 1,
            occasionMatch:
              event === "birthday"
                ? Number(product.name === "BIRTHDAY")
                : event === "love"
                  ? Number(
                      ["LOVE", "HEARTS", "MESSAGE"].includes(product.name),
                    )
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

  const selection = useMemo(() => {
    const preferred = ["air16", "birthday16-2", "hearts7", "message16"];
    if (occasion === "Все") {
      return preferred
        .map((slug) => catalog.products.find((product) => product.slug === slug))
        .filter((product): product is Product => Boolean(product));
    }
    return catalog.products
      .filter((product) =>
        occasion === "День рождения"
          ? product.name === "BIRTHDAY"
          : occasion === "С любовью"
            ? ["LOVE", "HEARTS"].includes(product.name)
            : product.name === "AIR",
      )
      .slice(0, 4);
  }, [catalog.products, occasion]);

  function startFinder() {
    setAnswers([]);
    window.requestAnimationFrame(() => {
      finderHeading.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
      finderHeading.current?.focus({ preventScroll: true });
    });
  }

  return (
    <main className="wv2-home">
      <motion.div
        className="wv2-scroll-progress"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />

      <section className="wv2-hero" ref={heroRef} aria-labelledby="wv2-hero-title">
        <motion.div
          className="wv2-hero-media"
          style={reducedMotion ? undefined : { scale: heroScale, y: heroMediaY }}
          aria-hidden="true"
        >
          <Image src={IMAGES.air} alt="" fill priority unoptimized sizes="100vw" />
        </motion.div>
        <div className="wv2-hero-wash" aria-hidden="true" />
        <motion.div
          className="wv2-hero-inner"
          style={
            reducedMotion
              ? undefined
              : { y: heroCopyY, opacity: heroCopyOpacity }
          }
        >
          <div className="wv2-hero-topline">
            <span>WINK</span>
            <span>Красивые поздравления</span>
            <span>Кемерово</span>
          </div>
          <h1 id="wv2-hero-title">
            Красиво поздравить.
            <br />
            <em>Не разбираться в шарах.</em>
          </h1>
          <div className="wv2-hero-bottom">
            <p>
              Скажите, кого поздравляем, по какому поводу и на какой бюджет.
              WINK превращает контекст в два готовых решения — с понятной ценой,
              персонализацией и доставкой к вашему моменту.
            </p>
            <div className="wv2-hero-actions">
              <button type="button" className="wv2-button primary" onClick={startFinder}>
                Получить 2 варианта <ShopIcon name="arrow" />
              </button>
              <Link className="wv2-button ghost" href="/shop">
                Смотреть готовые решения
              </Link>
            </div>
            {startPrice > 0 && (
              <span className="wv2-price-note">
                Готовые решения от {money(startPrice)} · доставка отдельно
              </span>
            )}
          </div>
        </motion.div>
      </section>

      <section
        className="wv2-context"
        ref={contextRef}
        aria-labelledby="wv2-context-title"
      >
        <div className="wv2-context-grid">
          <div className="wv2-context-copy">
            <p className="wv2-kicker">01 / Проблема не в выборе цвета</p>
            <motion.h2
              id="wv2-context-title"
              initial={reducedMotion ? false : { opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.05, ease: EASE }}
            >
              Важный человек. Повод. Дедлайн. И одна мысль: только бы не выбрать
              ерунду.
            </motion.h2>
            <p className="wv2-lead">
              Большинство магазинов отвечает на это ещё большим выбором. WINK
              делает наоборот: берёт профессиональный выбор на себя.
            </p>
          </div>
          <motion.figure
            className="wv2-context-visual"
            style={
              reducedMotion
                ? undefined
                : { y: contextImageY, scale: contextImageScale }
            }
          >
            <Image
              src={IMAGES.hearts}
              alt="Композиция с воздушными шарами-сердцами в интерьере"
              fill
              unoptimized
              sizes="(max-width: 820px) 100vw, 44vw"
            />
            <figcaption>Не «много шаров». Точный жест для конкретного человека.</figcaption>
          </motion.figure>
        </div>
        <div className="wv2-context-ledger" aria-label="Что WINK берёт на себя">
          {[
            ["01", "Не нужно знать, сколько элементов будет выглядеть красиво."],
            ["02", "Не нужно вручную сводить оттенки и искать сочетания."],
            ["03", "Не нужно угадывать масштаб для комнаты или момента."],
          ].map(([number, text], index) => (
            <motion.div
              key={number}
              initial={reducedMotion ? false : { opacity: 0, x: 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.65 }}
              transition={{ duration: 0.85, delay: index * 0.08, ease: EASE }}
            >
              <span>{number}</span>
              <p>{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="wv2-match" id="finder" aria-labelledby="wv2-match-title">
        <div className="wv2-match-stage">
          <div className="wv2-match-intro">
            <p className="wv2-kicker inverse">02 / WINK MATCH</p>
            <h2 id="wv2-match-title" ref={finderHeading} tabIndex={-1}>
              Контекст
              <br />
              <em>→ два решения.</em>
            </h2>
            <p>
              Вы не собираете композицию из 84 элементов. Вы описываете
              ситуацию. Профессиональный выбор остаётся внутри WINK.
            </p>
            <div className="wv2-match-index" aria-hidden="true">
              <strong>04</strong>
              <span>ответа</span>
              <i />
              <strong>02</strong>
              <span>решения</span>
            </div>
          </div>

          <div className="wv2-match-panel">
            <div
              className="wv2-match-progress"
              aria-label={`Шаг ${Math.min(answers.length + 1, 4)} из 4`}
            >
              {finderQuestions.map((question, index) => (
                <span
                  className={index <= answers.length ? "active" : ""}
                  key={question.title}
                >
                  0{index + 1}
                </span>
              ))}
            </div>

            <motion.div
              className="wv2-match-step"
              key={answers.length}
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: EASE }}
            >
              {answers.length < 4 ? (
                <>
                  <span className="wv2-step-number">0{answers.length + 1} / 04</span>
                  <h3>{finderQuestions[answers.length].title}</h3>
                  <p className="wv2-step-hint">{finderQuestions[answers.length].hint}</p>
                  <div className="wv2-match-choices">
                    {finderQuestions[answers.length].values.map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setAnswers((current) => [...current, value])}
                      >
                        <span>{label}</span>
                        <ShopIcon name="arrow" />
                      </button>
                    ))}
                  </div>
                  {answers.length > 0 && (
                    <button
                      type="button"
                      className="wv2-match-back"
                      onClick={() => setAnswers((current) => current.slice(0, -1))}
                    >
                      ← Назад
                    </button>
                  )}
                </>
              ) : (
                <div className="wv2-match-result" aria-live="polite">
                  <span className="wv2-step-number">WINK MATCH / готово</span>
                  <h3>
                    {recommendations.length
                      ? "Вот два решения, с которых стоит начать."
                      : "В этой рамке готового решения пока нет."}
                  </h3>
                  <p>
                    {recommendations.length
                      ? "Разница уже в масштабе и сценарии. Откройте вариант — персонализация и точная цена внутри."
                      : "Измените бюджет или напишите нам. Мы предложим ближайший по смыслу вариант вместо случайного компромисса."}
                  </p>
                  <div className="wv2-inline-actions">
                    <button
                      type="button"
                      className="wv2-button light"
                      onClick={() => setAnswers([])}
                    >
                      Пройти ещё раз
                    </button>
                    {!recommendations.length && (
                      <a
                        className="wv2-button light"
                        href={CONTACT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Написать WINK
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <motion.div
            className="wv2-match-results"
            initial={reducedMotion ? false : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {recommendations.map((product) => (
              <ProductCard key={product.slug} product={product} palette={answers[2]} />
            ))}
          </motion.div>
        )}
      </section>

      <section className="wv2-edit" aria-labelledby="wv2-edit-title">
        <div className="wv2-edit-head">
          <div>
            <p className="wv2-kicker">03 / Готовые сценарии</p>
            <h2 id="wv2-edit-title">Когда повод уже горит.</h2>
          </div>
          <div className="wv2-edit-aside">
            <p>
              Короткая витрина вместо бесконечного ассортимента. Цена относится
              к готовому визуальному результату, а точный состав остаётся в карточке.
            </p>
            <Link href="/shop" className="wv2-text-link">
              Смотреть все решения <ShopIcon name="arrow" />
            </Link>
          </div>
        </div>
        <div className="wv2-filter-rail" aria-label="Подборка по поводу">
          {["Все", "День рождения", "С любовью", "Просто так"].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={occasion === value}
              onClick={() => setOccasion(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="wv2-edit-grid">
          {selection.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        <p className="wv2-media-note">
          Визуализации передают характер коллекции. Фактический состав, количество
          и доступные оттенки зафиксированы в карточке выбранного решения.
        </p>
      </section>

      <section className="wv2-taste" aria-labelledby="wv2-taste-title">
        <div className="wv2-taste-title">
          <p className="wv2-kicker">04 / Вкус как работа</p>
          <h2 id="wv2-taste-title">
            Красиво —
            <br />
            <em>не когда больше.</em>
          </h2>
          <p>
            Перегруз, случайная палитра и неверный масштаб чаще всего делают
            поздравление дешевле визуально. Поэтому мы сначала убираем лишнее.
          </p>
        </div>
        <div className="wv2-taste-composition">
          <figure className="wv2-taste-large">
            <Image
              src={IMAGES.birthday}
              alt="Композиция с цифрами для дня рождения"
              fill
              unoptimized
              sizes="(max-width: 820px) 100vw, 58vw"
            />
            <figcaption>Масштаб должен работать в комнате, а не только на карточке товара.</figcaption>
          </figure>
          <figure className="wv2-taste-small">
            <Image
              src={IMAGES.hearts}
              alt="Композиция с сердцами в спокойной палитре"
              fill
              unoptimized
              sizes="(max-width: 820px) 70vw, 24vw"
            />
          </figure>
        </div>
        <div className="wv2-taste-ledger">
          {tastePrinciples.map(([number, title, text], index) => (
            <motion.article
              key={number}
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.55 }}
              transition={{ duration: 0.8, delay: index * 0.08, ease: EASE }}
            >
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section
        className="wv2-personal"
        ref={personalRef}
        aria-labelledby="wv2-personal-title"
      >
        <motion.figure
          className="wv2-personal-media"
          style={
            reducedMotion
              ? undefined
              : { y: personalImageY, scale: personalImageScale }
          }
        >
          <Image
            src={IMAGES.birthday}
            alt="Композиция с персональными цифрами"
            fill
            unoptimized
            sizes="(max-width: 820px) 100vw, 48vw"
          />
          <figcaption>Личная деталь сильнее случайного декора.</figcaption>
        </motion.figure>
        <div className="wv2-personal-copy">
          <p className="wv2-kicker">05 / Сделать про вашего человека</p>
          <h2 id="wv2-personal-title">
            Готовая форма.
            <br />
            <em>Ваш смысл.</em>
          </h2>
          <div className="wv2-personal-steps">
            {[
              ["01", "Цифра", "Возраст или другая важная цифра. Стоимость одной и двух цифр показывается до корзины."],
              ["02", "Слова", "В MESSAGE можно добавить короткую личную надпись — без отдельного согласования макета на десять сообщений."],
              ["03", "Настроение", "Выбирайте не из десятков оттенков, а из собранных палитр с понятным характером."],
            ].map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="wv2-palette-rail" aria-label="Палитры WINK">
            {["PINK_MILK", "PINK_CHROME", "MILK", "BLACK_CHROME"].map((id) => (
              <Link key={id} href={`/shop/?palette=${id}`}>
                <span className="wv2-swatches" aria-hidden="true">
                  {PALETTES[id].colors.map((color, index) => (
                    <i key={index} style={{ background: color }} />
                  ))}
                </span>
                <span>{PALETTES[id].name}</span>
                <ShopIcon name="arrow" />
              </Link>
            ))}
          </div>
          <Link href="/build" className="wv2-button outline">
            Настроить готовое решение <ShopIcon name="arrow" />
          </Link>
        </div>
      </section>

      <section className="wv2-proof" aria-labelledby="wv2-proof-title">
        <div className="wv2-proof-head">
          <div>
            <p className="wv2-kicker">06 / Контроль результата</p>
            <h2 id="wv2-proof-title">Важная дата не переносится.</h2>
          </div>
          <p>
            Поэтому мы не называем пожелание подтверждением. Сначала проверяем
            заказ и возможность доставки — потом фиксируем детали и оплату.
          </p>
        </div>
        <div className="wv2-proof-ledger">
          {[
            ["01", "Заявка", "Вы фиксируете решение, персонализацию и желаемую дату. Деньги автоматически не списываются."],
            ["02", "Проверка", "Мы сверяем состав, цифры или надпись, доступную дату и формат доставки."],
            ["03", "Подтверждение", "Вы знаете итоговую сумму и согласованный момент до того, как заказ считается подтверждённым."],
            ["04", "Доставка", "Композиция приезжает собранной. Для сюрприза организационные вопросы решаем с покупателем."],
          ].map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="wv2-proof-actions">
          <Link href="/delivery" className="wv2-button outline">
            Как работает доставка <ShopIcon name="arrow" />
          </Link>
          <button type="button" className="wv2-text-button" onClick={startFinder}>
            Не знаете, что выбрать? Начать подбор →
          </button>
        </div>
      </section>

      <section className="wv2-faq" aria-labelledby="wv2-faq-title">
        <div className="wv2-faq-title">
          <p className="wv2-kicker">07 / Перед первым WINK</p>
          <h2 id="wv2-faq-title">Снять последние сомнения.</h2>
        </div>
        <div className="wv2-faq-list">
          {faq.map(([question, answer]) => (
            <details key={question}>
              <summary>
                <span>{question}</span>
                <i aria-hidden="true">+</i>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
          <a
            className="wv2-text-link"
            href={CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Остался свой вопрос — написать WINK <ShopIcon name="arrow" />
          </a>
        </div>
      </section>

      <section
        className="wv2-close"
        ref={closeRef}
        aria-labelledby="wv2-close-title"
      >
        <motion.div
          className="wv2-close-inner"
          style={reducedMotion ? undefined : { scale: closeScale, y: closeY }}
        >
          <p className="wv2-kicker inverse">WINK / Кемерово</p>
          <h2 id="wv2-close-title">
            Не знаете, что выбрать?
            <br />
            <em>Это и есть наш вход.</em>
          </h2>
          <p>
            Назовите человека, повод, настроение и бюджет. Дальше выбор становится
            нашей работой.
          </p>
          <div className="wv2-inline-actions">
            <button type="button" className="wv2-button light" onClick={startFinder}>
              Получить 2 варианта <ShopIcon name="arrow" />
            </button>
            <Link className="wv2-button light ghost" href="/shop">
              Смотреть готовые решения
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
