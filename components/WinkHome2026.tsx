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
      ["any", "Просто так"],
      ["baby", "Узнать пол малыша"],
    ],
  },
  {
    title: "Какое настроение?",
    values: [
      ["PINK_MILK", "Нежное"],
      ["PINK_CHROME", "С блеском"],
      ["MILK", "Спокойное"],
      ["BLACK_CHROME", "Контрастное"],
    ],
  },
  {
    title: "Сколько потратим на композицию?",
    values: [
      ["5000", "До 5 000 ₽"],
      ["7500", "До 7 500 ₽"],
      ["any", "Посмотрю все цены"],
    ],
  },
] as const;

const faq = [
  [
    "Можно выбрать свою цифру?",
    "Да. В композициях с цифрами укажите нужный возраст. Для одной и двух цифр есть отдельные составы и цены.",
  ],
  [
    "Что входит в цену?",
    "Точный состав указан в карточке набора: шары, цифры или другие акценты, ленты, грузики и упаковка. Доставка считается отдельно.",
  ],
  [
    "Можно сделать сюрприз?",
    "Да. При оформлении выберите «Это подарок» и «Не звонить получателю». Организационные вопросы будем решать с вами.",
  ],
  [
    "Когда оплачивать?",
    "Сначала согласуем состав, доступную дату, доставку и способ оплаты. До подтверждения дата остаётся пожеланием.",
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
      finderHeading.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
          <Image
            src={IMAGES.air}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
          />
        </motion.div>
        <div className="wx-hero-iridescence" aria-hidden="true" />
        <motion.div
          className="wx-hero-inner"
          style={reducedMotion ? undefined : { y: heroCopyY, opacity: heroCopyOpacity }}
        >
          <p className="wx-kicker">Воздушные композиции · Кемерово</p>
          <h1 className="wx-display" id="wx-hero-title">
            Подарок, который видно из дверей.
          </h1>
          <div className="wx-hero-bottom">
            <div>
              <p className="wx-hero-copy">
                Вы называете повод, человека и бюджет. WINK помогает выбрать
                композицию, добавить личную деталь и привезти её готовой к вашему
                моменту.
              </p>
              <div className="wx-actions">
                <Link className="wx-pill-dark" href="/shop">
                  Выбрать композицию <ShopIcon name="arrow" />
                </Link>
                <button className="wx-pill-dark" type="button" onClick={startFinder}>
                  Подобрать за 4 ответа
                </button>
              </div>
              {startPrice > 0 && (
                <span className="wx-hero-price">
                  Композиции от <strong>{money(startPrice)}</strong> · доставка отдельно
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
          <p className="wx-kicker">Не каталог ради каталога</p>
          <motion.h2
            className="wx-title"
            id="wx-manifesto-title"
            initial={reducedMotion ? false : { opacity: 0, y: 44 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, ease: EASE }}
          >
            Меньше выбора. Больше точного попадания.
          </motion.h2>
          <div className="wx-principles">
            <article className="wx-principle">
              <span>01</span>
              <div>
                <h3>Не знаете, что выбрать? Покажем два варианта, а не двести.</h3>
                <p>
                  Подбор начинается с человека, повода и бюджета — не с названий
                  шаров и бесконечного каталога.
                </p>
              </div>
            </article>
            <article className="wx-principle">
              <span>02</span>
              <div>
                <h3>Нужна личная деталь? Она добавляется до корзины.</h3>
                <p>
                  Цифра, надпись, палитра и доступные дополнения видны там, где
                  конкретная композиция их поддерживает.
                </p>
              </div>
            </article>
            <article className="wx-principle">
              <span>03</span>
              <div>
                <h3>Сюрприз остаётся сюрпризом.</h3>
                <p>
                  В оформлении можно отметить «не звонить получателю». Дату,
                  доставку и оплату сначала согласуем с вами.
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
            <figcaption className="wx-visual-caption">Для слов без длинной речи</figcaption>
          </figure>
          <figure>
            <Image
              src={IMAGES.birthday}
              alt="Визуализация композиции с цифрами на день рождения"
              fill
              unoptimized
              sizes="(max-width: 820px) 44vw, 22vw"
            />
            <figcaption className="wx-visual-caption">Для того самого утра</figcaption>
          </figure>
        </div>
      </section>

      <section className="wx-edit" aria-labelledby="wx-edit-title">
        <div className="wx-edit-head">
          <div>
            <p className="wx-kicker">The WINK edit / 01</p>
            <h2 className="wx-title" id="wx-edit-title">
              С чего стоит начать.
            </h2>
          </div>
          <div className="wx-edit-side">
            <p>
              Небольшая подборка понятных форматов. Откройте композицию — там
              будет точный состав, цена и доступная персонализация.
            </p>
            <Link href="/shop" className="wx-text-link">
              Смотреть весь каталог <ShopIcon name="arrow" />
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
          Визуализации передают настроение коллекции. Точный состав, количество
          шаров и доступные оттенки указаны внутри каждой композиции.
        </p>
      </section>

      <section className="wx-finder" id="finder" aria-labelledby="wx-finder-title">
        <div className="wx-finder-intro">
          <p className="wx-kicker">Когда выбирать не хочется</p>
          <h2 className="wx-title" id="wx-finder-title" ref={finderHeading} tabIndex={-1}>
            Четыре ответа. До двух вариантов.
          </h2>
          <p>
            Без регистрации и длинного конструктора. Доставка считается отдельно,
            а желаемую дату мы подтверждаем до оплаты.
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
                <span className="wx-kicker">Готово</span>
                <h3>Вот с чего можно начать.</h3>
                <p>
                  {recommendations.length
                    ? `${recommendations.length} ${recommendations.length === 1 ? "вариант" : "варианта"} под ваш запрос. Откройте композицию, чтобы выбрать детали.`
                    : "В этом бюджете подходящих наборов пока нет. Попробуйте другой бюджет или напишите нам — подскажем ближайший вариант."}
                </p>
                <div className="wx-actions">
                  <button
                    type="button"
                    className="wx-pill"
                    onClick={() => setAnswers([])}
                  >
                    Подобрать заново
                  </button>
                  {!recommendations.length && (
                    <a className="wx-pill" href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
                      Написать нам
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
          <figcaption className="wx-personal-label">Личная деталь меняет всё</figcaption>
        </figure>
        <div className="wx-personal-copy">
          <p className="wx-kicker">Сделать именно для вашего человека</p>
          <h2 className="wx-title" id="wx-personal-title">
            Один набор. Ваш смысл.
          </h2>
          <article className="wx-personal-step">
            <span>01</span>
            <div>
              <h3>Цифра</h3>
              <p>
                Выберите композицию с цифрами и укажите возраст. Цена для одной
                и двух цифр показывается отдельно — без сюрприза в финале.
              </p>
            </div>
          </article>
          <article className="wx-personal-step">
            <span>02</span>
            <div>
              <h3>Надпись</h3>
              <p>
                В наборах MESSAGE можно добавить личные слова. Поле появляется
                именно там, где надпись входит в производимый состав.
              </p>
            </div>
          </article>
          <article className="wx-personal-step">
            <span>03</span>
            <div>
              <h3>Оттенок</h3>
              <p>
                Выберите настроение палитры до корзины. Изображение показывает
                характер коллекции, а фактические доступные цвета перечислены в карточке.
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
              Собрать свой вариант <ShopIcon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="wx-order" aria-labelledby="wx-order-title">
        <div className="wx-order-head">
          <div>
            <p className="wx-kicker">Что происходит после «оформить»</p>
            <h2 className="wx-title" id="wx-order-title">
              Без обещаний наобум.
            </h2>
          </div>
          <p className="wx-copy">
            Мы не притворяемся, что дата, доставка и оплата уже подтверждены.
            Сначала заявка — затем реальное согласование деталей.
          </p>
        </div>
        <div className="wx-order-ledger">
          {[
            [
              "01",
              "Вы отправляете заявку",
              "Корзина хранит выбранный состав, персонализацию и пожелание по дате. Это ещё не автоматическое списание денег.",
            ],
            [
              "02",
              "Мы подтверждаем детали",
              "Проверяем состав, доступную дату, способ доставки и её стоимость. Если нужен сюрприз — общаемся с вами, не с получателем.",
            ],
            [
              "03",
              "Согласуем оплату",
              "Способ оплаты фиксируем после того, как вам понятна итоговая сумма и подтверждён момент доставки.",
            ],
            [
              "04",
              "Привозим готовым",
              "Композиция приезжает собранной, с лентами, грузиками и транспортной упаковкой согласно карточке набора.",
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
            Доставка и оплата <ShopIcon name="arrow" />
          </Link>
          <Link href="/shop" className="wx-text-link">
            Перейти к композициям <ShopIcon name="arrow" />
          </Link>
        </div>
      </section>

      <section className="wx-faq" aria-labelledby="wx-faq-title">
        <div>
          <p className="wx-kicker">Перед первым WINK</p>
          <h2 className="wx-title" id="wx-faq-title">
            Коротко о важном.
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
              Остался вопрос — написать нам <ShopIcon name="arrow" />
            </a>
          </div>
        </div>
      </section>

      <section className="wx-closing" aria-labelledby="wx-closing-title">
        <p className="wx-kicker">WINK · Кемерово</p>
        <h2 className="wx-display" id="wx-closing-title">
          Есть повод? Сделаем красиво.
        </h2>
        <div className="wx-closing-bottom">
          <p>
            Начните с готовой композиции или ответьте на четыре вопроса. Дальше
            мы оставили только те шаги, которые действительно нужны заказу.
          </p>
          <div className="wx-actions">
            <Link className="wx-pill-dark" href="/shop">
              Выбрать WINK <ShopIcon name="arrow" />
            </Link>
            <button className="wx-pill-dark" type="button" onClick={startFinder}>
              Помочь выбрать
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
