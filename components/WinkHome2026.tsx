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
    title: "Кого поздравляем?",
    values: [
      ["her", "Девушку"],
      ["him", "Мужчину"],
      ["kids", "Ребёнка"],
      ["mom", "Маму"],
      ["friend", "Подругу"],
    ],
  },
  {
    title: "Что за момент?",
    values: [
      ["birthday", "День рождения"],
      ["love", "Хочу сказать «люблю»"],
      ["any", "Без повода"],
      ["baby", "Узнать пол малыша"],
    ],
  },
  {
    title: "Как должно ощущаться?",
    values: [
      ["PINK_MILK", "Нежно"],
      ["PINK_CHROME", "С блеском"],
      ["MILK", "Спокойно"],
      ["BLACK_CHROME", "Контрастно"],
    ],
  },
  {
    title: "В какой бюджет остаёмся?",
    values: [
      ["5000", "До 5 000 ₽"],
      ["7500", "До 7 500 ₽"],
      ["any", "Покажите все цены"],
    ],
  },
] as const;

const faq = [
  [
    "Не знаю, что выбрать. Вы правда поможете?",
    "Да. Ответьте на четыре вопроса — быстрый WINK MATCH оставит до двух подходящих решений. Если хочется живого совета, напишите нам повод, дату и бюджет.",
  ],
  [
    "Что входит в цену?",
    "Точный состав указан в карточке: шары, цифры или другие акценты, ленты, грузики и упаковка. Стандартная палитра цену не меняет. Доставка считается отдельно.",
  ],
  [
    "Можно сделать сюрприз?",
    "Да. При оформлении выберите «Это подарок» и «Не звонить получателю». Организационные вопросы будем решать с вами.",
  ],
  [
    "Когда оплачивать?",
    "После того как подтвердим состав, доступную дату, доставку и итоговую сумму. До подтверждения дата остаётся пожеланием.",
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
          <p className="wx-kicker">WINK · красивые поздравления · Кемерово</p>
          <h1 className="wx-display" id="wx-hero-title">
            Когда надо красиво поздравить.
          </h1>
          <div className="wx-hero-bottom">
            <div>
              <p className="wx-hero-copy">
                Вы рассказываете, кого поздравляем и на какой бюджет ориентируемся.
                WINK сужает выбор до нескольких красивых решений, помогает с личной
                деталью и согласует доставку к вашему моменту.
              </p>
              <div className="wx-actions">
                <Link className="wx-pill-dark" href="/shop">
                  Смотреть готовые решения <ShopIcon name="arrow" />
                </Link>
                <button className="wx-pill-dark" type="button" onClick={startFinder}>
                  Получить 2 варианта
                </button>
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
          <p className="wx-kicker">Красивый результат без сложного выбора</p>
          <motion.h2
            className="wx-title"
            id="wx-manifesto-title"
            initial={reducedMotion ? false : { opacity: 0, y: 44 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, ease: EASE }}
          >
            Вы не обязаны становиться дизайнером, чтобы хорошо поздравить.
          </motion.h2>
          <div className="wx-principles">
            <article className="wx-principle">
              <span>01</span>
              <div>
                <h3>Мы уже убрали всё лишнее.</h3>
                <p>
                  В WINK не попадает всё, что можно купить. Только готовые сочетания,
                  в которых формы, масштаб и цвет уже работают вместе.
                </p>
              </div>
            </article>
            <article className="wx-principle">
              <span>02</span>
              <div>
                <h3>Сначала человек. Потом композиция.</h3>
                <p>
                  Повод, человек, бюджет и нужный эффект важнее названий шаров.
                  Поэтому подбор начинается с контекста, а не с каталога.
                </p>
              </div>
            </article>
            <article className="wx-principle">
              <span>03</span>
              <div>
                <h3>Сюрприз — получателю. Не вам.</h3>
                <p>
                  До оплаты согласуем доступную дату, доставку и итоговую сумму.
                  Если получателю нельзя звонить — общаемся с вами.
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
            <figcaption className="wx-visual-caption">Красивый жест без перебора</figcaption>
          </figure>
          <figure>
            <Image
              src={IMAGES.birthday}
              alt="Визуализация композиции с цифрами на день рождения"
              fill
              unoptimized
              sizes="(max-width: 820px) 44vw, 22vw"
            />
            <figcaption className="wx-visual-caption">Чтобы к утру всё было готово</figcaption>
          </figure>
        </div>
      </section>

      <section className="wx-edit" aria-labelledby="wx-edit-title">
        <div className="wx-edit-head">
          <div>
            <p className="wx-kicker">Готовые решения / 01</p>
            <h2 className="wx-title" id="wx-edit-title">
              Начните не с шаров. Начните с повода.
            </h2>
          </div>
          <div className="wx-edit-side">
            <p>
              В каждом формате уже зафиксированы состав и цена. Вам остаётся выбрать
              масштаб, палитру и личную деталь — если она нужна.
            </p>
            <Link href="/shop" className="wx-text-link">
              Все готовые решения <ShopIcon name="arrow" />
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
          Изображения показывают визуальный характер коллекции, а не обещают точную
          копию. Точный состав, количество и доступные оттенки фиксируем в карточке.
        </p>
      </section>

      <section className="wx-finder" id="finder" aria-labelledby="wx-finder-title">
        <div className="wx-finder-intro">
          <p className="wx-kicker">WINK MATCH · быстрый подбор</p>
          <h2 className="wx-title" id="wx-finder-title" ref={finderHeading} tabIndex={-1}>
            Четыре ответа. Два решения.
          </h2>
          <p>
            Не нужно знать названия шаров и сочетаний. Расскажите главное — кому,
            по какому поводу, какое настроение и бюджет. Дату и доставку подтвердим
            отдельно.
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
                <span className="wx-kicker">WINK MATCH</span>
                <h3>Вот с чего WINK советует начать.</h3>
                <p>
                  {recommendations.length
                    ? `${recommendations.length} ${recommendations.length === 1 ? "решение" : "решения"} под ваш запрос. Откройте композицию — там останется выбрать только детали.`
                    : "Не будем притягивать неподходящий вариант к бюджету. Попробуйте другую рамку или напишите нам — предложим ближайшее решение."}
                </p>
                <div className="wx-actions">
                  <button
                    type="button"
                    className="wx-pill"
                    onClick={() => setAnswers([])}
                  >
                    Пройти подбор заново
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
          <figcaption className="wx-personal-label">Личное — не значит сложное</figcaption>
        </figure>
        <div className="wx-personal-copy">
          <p className="wx-kicker">Персонализация без хаоса</p>
          <h2 className="wx-title" id="wx-personal-title">
            Добавьте только то, что имеет смысл.
          </h2>
          <article className="wx-personal-step">
            <span>01</span>
            <div>
              <h3>Возраст</h3>
              <p>
                Выберите основу BIRTHDAY и укажите цифру. Одна и две цифры имеют
                отдельные составы и цены — итог понятен заранее.
              </p>
            </div>
          </article>
          <article className="wx-personal-step">
            <span>02</span>
            <div>
              <h3>Ваши слова</h3>
              <p>
                В MESSAGE персональная надпись входит в сам сценарий подарка:
                до 40 символов и трёх строк.
              </p>
            </div>
          </article>
          <article className="wx-personal-step">
            <span>03</span>
            <div>
              <h3>Настроение</h3>
              <p>
                Палитра выбирается как готовое сочетание. Стандартная палитра не
                меняет цену — вы покупаете визуальный результат, а не стоимость оттенков.
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
              Выбрать основу <ShopIcon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="wx-order" aria-labelledby="wx-order-title">
        <div className="wx-order-head">
          <div>
            <p className="wx-kicker">После заявки</p>
            <h2 className="wx-title" id="wx-order-title">
              Сначала подтверждаем. Потом обещаем.
            </h2>
          </div>
          <p className="wx-copy">
            Дата, внешний вид, доставка и итоговая сумма — часть результата.
            Поэтому не делаем вид, что всё подтверждено, пока реально не проверили.
          </p>
        </div>
        <div className="wx-order-ledger">
          {[
            [
              "01",
              "Фиксируем ваш выбор",
              "Сохраняем композицию, персонализацию, контакты и пожелание по дате. Деньги на этом шаге не списываются.",
            ],
            [
              "02",
              "Проверяем дату и доставку",
              "Подтверждаем доступность, адрес, время и стоимость доставки. Если это сюрприз — общаемся с вами, а не с получателем.",
            ],
            [
              "03",
              "Подтверждаем итог",
              "Вы видите понятную итоговую сумму и способ оплаты до того, как заказ считается согласованным.",
            ],
            [
              "04",
              "Привозим готовым",
              "Композиция приезжает собранной, с лентами, грузиками и транспортной упаковкой согласно карточке.",
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
            Смотреть решения <ShopIcon name="arrow" />
          </Link>
        </div>
      </section>

      <section className="wx-faq" aria-labelledby="wx-faq-title">
        <div>
          <p className="wx-kicker">Снимем последние вопросы</p>
          <h2 className="wx-title" id="wx-faq-title">
            Чтобы нажать «оформить» спокойно.
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
              Задать свой вопрос <ShopIcon name="arrow" />
            </a>
          </div>
        </div>
      </section>

      <section className="wx-closing" aria-labelledby="wx-closing-title">
        <p className="wx-kicker">WINK · когда надо красиво поздравить</p>
        <h2 className="wx-display" id="wx-closing-title">
          Повод уже есть. Остальное можно делегировать.
        </h2>
        <div className="wx-closing-bottom">
          <p>
            Назовите человека, дату и бюджет. Мы сузим выбор до нескольких красивых
            решений и возьмём профессиональный выбор на себя.
          </p>
          <div className="wx-actions">
            <Link className="wx-pill-dark" href="/shop">
              Смотреть готовые решения <ShopIcon name="arrow" />
            </Link>
            <button className="wx-pill-dark" type="button" onClick={startFinder}>
              Получить 2 варианта
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
