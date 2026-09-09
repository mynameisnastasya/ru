"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
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
    title: "Кого порадуем?",
    values: [
      ["her", "Её"],
      ["him", "Его"],
      ["kids", "Ребёнка"],
      ["mom", "Маму"],
      ["friend", "Подругу"],
    ],
  },
  {
    title: "По какому поводу?",
    values: [
      ["birthday", "День рождения"],
      ["love", "Сказать «люблю»"],
      ["any", "Просто порадовать"],
      ["baby", "Узнать пол малыша"],
    ],
  },
  {
    title: "Какой эффект нужен?",
    values: [
      ["PINK_MILK", "Нежно"],
      ["PINK_CHROME", "Эффектно"],
      ["MILK", "Спокойно"],
      ["BLACK_CHROME", "Контрастно"],
    ],
  },
  {
    title: "Какой бюджет комфортен?",
    values: [
      ["5000", "До 5 000 ₽"],
      ["7500", "До 7 500 ₽"],
      ["any", "Покажите все"],
    ],
  },
] as const;

const faq = [
  [
    "А если я вообще не знаю, что выбрать?",
    "Так и задумано. Ответьте на четыре вопроса: кому, по какому поводу, какой эффект нужен и какой бюджет комфортен. WINK сузит выбор до двух решений — вам не придётся разбираться в десятках вариантов.",
  ],
  [
    "Фото на сайте — точный вид заказа?",
    "Сейчас изображения передают визуальное направление коллекции, а не обещают повторение кадра один в один. Точный состав, цена и доступные варианты персонализации зафиксированы в карточке каждого решения.",
  ],
  [
    "Можно сохранить сюрприз?",
    "Да. При оформлении отметьте «Это сюрприз — не звонить получателю». Все организационные вопросы будем решать с вами.",
  ],
  [
    "Когда дата считается подтверждённой?",
    "Дата в корзине — ваше пожелание. До оплаты мы проверяем возможность, согласуем доставку и подтверждаем итоговые детали заказа.",
  ],
] as const;

export default function WinkHome2026() {
  const { catalog } = useWinkCatalog();
  const [occasion, setOccasion] = useState("Все");
  const [answers, setAnswers] = useState<string[]>([]);
  const finderHeading = useRef<HTMLHeadingElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.09]);
  const heroMediaY = useTransform(heroProgress, [0, 1], [0, 70]);
  const heroCopyY = useTransform(heroProgress, [0, 1], [0, -72]);
  const heroCopyOpacity = useTransform(heroProgress, [0, 0.82, 1], [1, 0.82, 0.25]);

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
                  ? Number(["AIR", "BIRTHDAY", "MESSAGE"].includes(product.name))
                  : 1,
            occasionMatch:
              event === "birthday"
                ? Number(product.name === "BIRTHDAY")
                : event === "love"
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
    <main className="wx-home">
      <motion.div className="wx-scroll-progress" style={{ scaleX: scrollYProgress }} />

      <section className="wx-hero" ref={heroRef} aria-labelledby="wx-hero-title">
        <motion.div
          className="wx-hero-media"
          style={reducedMotion ? undefined : { scale: heroScale, y: heroMediaY }}
          aria-hidden="true"
        >
          <Image src={IMAGES.air} alt="" fill priority unoptimized sizes="100vw" />
        </motion.div>
        <div className="wx-hero-iridescence" aria-hidden="true" />
        <motion.div
          className="wx-hero-inner"
          style={reducedMotion ? undefined : { y: heroCopyY, opacity: heroCopyOpacity }}
        >
          <p className="wx-kicker">Красивые поздравления · Кемерово</p>
          <h1 className="wx-display" id="wx-hero-title">
            Когда надо красиво поздравить.
          </h1>
          <div className="wx-hero-bottom">
            <div>
              <p className="wx-hero-copy">
                Вы знаете человека и повод. Мы берём на себя остальное: сузим
                выбор до двух решений, подберём визуальный масштаб, палитру и
                личную деталь — без бесконечного каталога.
              </p>
              <div className="wx-actions">
                <button className="wx-pill-dark" type="button" onClick={startFinder}>
                  Подобрать 2 варианта
                </button>
                <Link className="wx-pill-dark" href="/shop">
                  Смотреть готовые решения <ShopIcon name="arrow" />
                </Link>
              </div>
              {startPrice > 0 && (
                <span className="wx-hero-price">
                  Готовые решения от <strong>{money(startPrice)}</strong> · доставка отдельно
                </span>
              )}
            </div>
            <div className="wx-scroll-mark" aria-hidden="true">
              scroll · wink ·
            </div>
          </div>
        </motion.div>
      </section>

      <section className="wx-manifesto" aria-labelledby="wx-manifesto-title">
        <div className="wx-manifesto-copy">
          <p className="wx-kicker">WINK берёт профессиональный выбор на себя</p>
          <motion.h2
            className="wx-title"
            id="wx-manifesto-title"
            initial={reducedMotion ? false : { opacity: 0, y: 44 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, ease: EASE }}
          >
            Ваша задача — порадовать. Наша — сделать так, чтобы получилось красиво.
          </motion.h2>
          <div className="wx-principles">
            <article className="wx-principle">
              <span>01</span>
              <div>
                <h3>Не заставляем вас быть дизайнером.</h3>
                <p>
                  Повод, человек, настроение и бюджет — достаточно. Дальше мы
                  сужаем выбор до нескольких уместных решений.
                </p>
              </div>
            </article>
            <article className="wx-principle">
              <span>02</span>
              <div>
                <h3>Смотрим на эффект, а не на количество.</h3>
                <p>
                  Масштаб, палитра и акценты должны работать вместе и подходить
                  моменту. Больше шаров не всегда значит красивее.
                </p>
              </div>
            </article>
            <article className="wx-principle">
              <span>03</span>
              <div>
                <h3>Важная дата — не место для догадок.</h3>
                <p>
                  До оплаты фиксируем состав, проверяем доступность и согласуем
                  доставку. Если это сюрприз — организационные вопросы решаем с вами.
                </p>
              </div>
            </article>
          </div>
        </div>
        <div className="wx-manifesto-visual" aria-label="Визуальное настроение WINK">
          <figure>
            <Image
              src={IMAGES.hearts}
              alt="Визуализация композиции с воздушными шарами-сердцами"
              fill
              unoptimized
              sizes="(max-width: 820px) 100vw, 45vw"
            />
            <figcaption className="wx-visual-caption">Когда хочется сказать без длинной речи</figcaption>
          </figure>
          <figure>
            <Image
              src={IMAGES.birthday}
              alt="Визуализация композиции с цифрами на день рождения"
              fill
              unoptimized
              sizes="(max-width: 820px) 44vw, 22vw"
            />
            <figcaption className="wx-visual-caption">Для утра, которое запомнят</figcaption>
          </figure>
        </div>
      </section>

      <section className="wx-edit" aria-labelledby="wx-edit-title">
        <div className="wx-edit-head">
          <div>
            <p className="wx-kicker">WINK edit / готовые решения</p>
            <h2 className="wx-title" id="wx-edit-title">
              Мы уже выбрали красивое.
            </h2>
          </div>
          <div className="wx-edit-side">
            <p>
              Не сотни похожих наборов, а короткая матрица с понятным результатом:
              от небольшого жеста до композиции, которая меняет комнату.
            </p>
            <Link href="/shop" className="wx-text-link">
              Смотреть все решения <ShopIcon name="arrow" />
            </Link>
          </div>
        </div>
        <div className="wx-filter-rail" aria-label="Подборка по поводу">
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
        <div className="wx-edit-grid" aria-live="polite">
          {selection.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        <p className="wx-edit-note">
          Фото показывают визуальное направление коллекции. В карточке каждого
          решения — фиксированный состав, цена и доступная персонализация.
        </p>
      </section>

      <section className="wx-finder" id="finder" aria-labelledby="wx-finder-title">
        <div className="wx-finder-intro">
          <p className="wx-kicker">WINK MATCH</p>
          <h2 className="wx-title" id="wx-finder-title" ref={finderHeading} tabIndex={-1}>
            Расскажите контекст. Выбор возьмём на себя.
          </h2>
          <p>
            Четыре ответа — человек, повод, настроение и бюджет. В конце покажем
            до двух решений, которые подходят вашему случаю.
          </p>
        </div>
        <div className="wx-finder-panel">
          <div
            className="wx-finder-progress"
            aria-label={`Шаг ${Math.min(answers.length + 1, 4)} из 4`}
          >
            {finderQuestions.map((question, index) => (
              <span className={index <= answers.length ? "active" : ""} key={question.title} />
            ))}
          </div>
          <motion.div
            className="wx-finder-step"
            key={answers.length}
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            {answers.length < 4 ? (
              <>
                <span className="wx-kicker">0{answers.length + 1} / 04</span>
                <h3>{finderQuestions[answers.length].title}</h3>
                <div className="wx-finder-choices">
                  {finderQuestions[answers.length].values.map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setAnswers((current) => [...current, value])}
                    >
                      {label}
                      <ShopIcon name="arrow" />
                    </button>
                  ))}
                </div>
                {answers.length > 0 && (
                  <button
                    type="button"
                    className="wx-finder-back"
                    onClick={() => setAnswers((current) => current.slice(0, -1))}
                  >
                    Назад
                  </button>
                )}
              </>
            ) : (
              <div className="wx-finder-result-intro" aria-live="polite">
                <span className="wx-kicker">WINK MATCH · готово</span>
                <h3>Вот решения WINK.</h3>
                <p>
                  {recommendations.length
                    ? `Мы сузили выбор до ${recommendations.length === 1 ? "одного решения" : "двух решений"}. Откройте ${recommendations.length === 1 ? "его" : "их"} и сравните по масштабу — палитру и личные детали настроите внутри.`
                    : "В этой рамке готового решения нет. Напишите нам — предложим ближайший вариант без бесконечного конструктора."}
                </p>
                <div className="wx-actions">
                  <button type="button" className="wx-pill" onClick={() => setAnswers([])}>
                    Начать заново
                  </button>
                  {!recommendations.length && (
                    <a className="wx-pill" href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
                      Написать WINK
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
        {recommendations.length > 0 && (
          <motion.div
            className="wx-finder-results"
            initial={reducedMotion ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {recommendations.map((product) => (
              <ProductCard key={product.slug} product={product} palette={answers[2]} />
            ))}
          </motion.div>
        )}
      </section>

      <section className="wx-personal" aria-labelledby="wx-personal-title">
        <figure className="wx-personal-media">
          <Image
            src={IMAGES.birthday}
            alt="Визуализация воздушной композиции с персональными цифрами"
            fill
            unoptimized
            sizes="(max-width: 820px) 100vw, 50vw"
          />
          <figcaption className="wx-personal-label">Детали, которые делают подарок вашим</figcaption>
        </figure>
        <div className="wx-personal-copy">
          <p className="wx-kicker">Персонализация без хаоса</p>
          <h2 className="wx-title" id="wx-personal-title">
            Чтобы подарок был про вашего человека.
          </h2>
          <article className="wx-personal-step">
            <span>01</span>
            <div>
              <h3>Цифра — главный акцент.</h3>
              <p>
                Для BIRTHDAY вы сразу выбираете нужный возраст. Одна или две
                цифры — отдельные готовые форматы с понятной ценой.
              </p>
            </div>
          </article>
          <article className="wx-personal-step">
            <span>02</span>
            <div>
              <h3>Ваши слова — часть композиции.</h3>
              <p>
                В MESSAGE надпись наносится на Bubble: до 40 знаков и трёх строк.
                Коротко, лично, без случайного декора.
              </p>
            </div>
          </article>
          <article className="wx-personal-step">
            <span>03</span>
            <div>
              <h3>Палитра уже собрана за вас.</h3>
              <p>
                Мы оставили только сочетания, которые работают вместе. Вы
                выбираете настроение — не пытаетесь совместить семь оттенков.
              </p>
            </div>
          </article>
          <div className="wx-palette-rail" aria-label="Палитры WINK">
            {["PINK_MILK", "PINK_CHROME", "MILK", "BLACK_CHROME"].map((id) => (
              <Link key={id} href={`/shop/?palette=${id}`} className="wx-palette-link">
                <span className="wx-swatches" aria-hidden="true">
                  {PALETTES[id].colors.map((color, index) => (
                    <i key={index} style={{ background: color }} />
                  ))}
                </span>
                <span>{PALETTES[id].name}</span>
                <ShopIcon name="arrow" />
              </Link>
            ))}
          </div>
          <div className="wx-personal-cta">
            <Link href="/build" className="wx-pill">
              Собрать свой WINK <ShopIcon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="wx-order" aria-labelledby="wx-order-title">
        <div className="wx-order-head">
          <div>
            <p className="wx-kicker">Важная дата не переносится</p>
            <h2 className="wx-title" id="wx-order-title">
              До вручения должно быть спокойно.
            </h2>
          </div>
          <p className="wx-copy">
            Главная тревога — «будет ли вживую красиво и вовремя». Поэтому
            подтверждение деталей, даты и доставки — часть продукта, а не мелкий шрифт.
          </p>
        </div>
        <div className="wx-order-ledger">
          {[
            [
              "01",
              "Вы фиксируете решение",
              "Корзина сохраняет выбранный формат, палитру, персонализацию и желаемую дату. Деньги на этом шаге не списываются.",
            ],
            [
              "02",
              "Мы проверяем возможность",
              "Сверяем состав и персонализацию, доступную дату и доставку. Для сюрприза связываемся с вами, не с получателем.",
            ],
            [
              "03",
              "Вы знаете итог до оплаты",
              "Подтверждаем сумму товаров, стоимость доставки и способ оплаты — без неожиданностей в последнюю секунду.",
            ],
            [
              "04",
              "Готовим к вашему моменту",
              "Композиция приезжает собранной и подготовленной к вручению согласно зафиксированному составу.",
            ],
          ].map(([number, title, text]) => (
            <article className="wx-order-row" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="wx-order-actions">
          <Link href="/delivery" className="wx-pill">
            Как работает доставка <ShopIcon name="arrow" />
          </Link>
          <Link href="/shop" className="wx-text-link">
            Выбрать решение <ShopIcon name="arrow" />
          </Link>
        </div>
      </section>

      <section className="wx-faq" aria-labelledby="wx-faq-title">
        <div>
          <p className="wx-kicker">Перед первым WINK</p>
          <h2 className="wx-title" id="wx-faq-title">
            Чтобы всё было понятно заранее.
          </h2>
        </div>
        <div className="wx-faq-list">
          {faq.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
          <div className="wx-order-actions">
            <a className="wx-text-link" href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
              Остался вопрос — написать WINK <ShopIcon name="arrow" />
            </a>
          </div>
        </div>
      </section>

      <section className="wx-closing" aria-labelledby="wx-closing-title">
        <p className="wx-kicker">WINK · когда надо красиво поздравить</p>
        <h2 className="wx-display" id="wx-closing-title">
          Вы приносите повод. Мы возвращаем решение.
        </h2>
        <div className="wx-closing-bottom">
          <p>
            Ответьте на четыре вопроса — или начните с готового формата. Дальше
            выбор должен становиться проще, а не превращаться в ещё одну задачу.
          </p>
          <div className="wx-actions">
            <button className="wx-pill-dark" type="button" onClick={startFinder}>
              Подобрать 2 варианта
            </button>
            <Link className="wx-pill-dark" href="/shop">
              Смотреть решения <ShopIcon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
