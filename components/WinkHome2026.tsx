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
      ["her", "Её"],
      ["him", "Его"],
      ["kids", "Ребёнка"],
      ["mom", "Маму"],
      ["friend", "Подругу"],
    ],
  },
  {
    title: "Какой повод?",
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
      ["BLACK_CHROME", "Графично"],
    ],
  },
  {
    title: "Какой бюджет комфортен?",
    values: [
      ["5000", "До 5 000 ₽"],
      ["7500", "До 7 500 ₽"],
      ["any", "Покажите всё"],
    ],
  },
] as const;

const faq = [
  [
    "Вживую будет так же красиво?",
    "На сайте используются визуализации коллекций, поэтому мы честно не обещаем пиксель-в-пиксель. Точный состав, количество и доступные оттенки указаны в карточке. Перед заказом фиксируем выбранный вариант, чтобы результат был предсказуемым.",
  ],
  [
    "Можно выбрать свою цифру или надпись?",
    "Да. В BIRTHDAY укажите нужный возраст, а в MESSAGE — личный текст до 40 символов. Цена доступной персонализации показывается до отправки заявки.",
  ],
  [
    "Можно сделать сюрприз?",
    "Да. Отметьте «не звонить получателю». Организационные вопросы будем решать с вами, чтобы не испортить момент.",
  ],
  [
    "Когда дата и доставка считаются подтверждёнными?",
    "После заявки мы проверяем состав, доступную дату, адрес и стоимость доставки. Только после этого согласуем итог и способ оплаты.",
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
                Вы говорите, кого поздравляем, по какому поводу и на какой бюджет.
                Мы сокращаем выбор до нескольких сильных решений, помогаем с личной
                деталью и согласуем доставку к вашему моменту.
              </p>
              <div className="wx-actions">
                <Link className="wx-pill-dark" href="/shop">
                  Посмотреть готовые решения <ShopIcon name="arrow" />
                </Link>
                <button className="wx-pill-dark" type="button" onClick={startFinder}>
                  Подобрать за 4 ответа
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
          <p className="wx-kicker">Красиво — не значит сложно</p>
          <motion.h2
            className="wx-title"
            id="wx-manifesto-title"
            initial={reducedMotion ? false : { opacity: 0, y: 44 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, ease: EASE }}
          >
            Вам не нужно разбираться в шарах, чтобы не ошибиться с подарком.
          </motion.h2>
          <div className="wx-principles">
            <article className="wx-principle">
              <span>01</span>
              <div>
                <h3>Не выбирайте из сотни вариантов. Назовите человека, повод и бюджет.</h3>
                <p>
                  Профессиональный выбор — наша работа. Покажем несколько решений,
                  между которыми действительно есть смысл выбирать.
                </p>
              </div>
            </article>
            <article className="wx-principle">
              <span>02</span>
              <div>
                <h3>Не количество шаров. То, как будет выглядеть момент.</h3>
                <p>
                  Масштаб, палитра и акценты собираются как один визуальный результат —
                  без случайного декора и перегруза.
                </p>
              </div>
            </article>
            <article className="wx-principle">
              <span>03</span>
              <div>
                <h3>Важная дата не переносится.</h3>
                <p>
                  До оплаты согласуем состав, дату и доставку. Если это сюрприз,
                  можно попросить нас не звонить получателю.
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
            <figcaption className="wx-visual-caption">Пока именинник ещё не видел</figcaption>
          </figure>
        </div>
      </section>

      <section className="wx-edit" aria-labelledby="wx-edit-title">
        <div className="wx-edit-head">
          <div>
            <p className="wx-kicker">Готовые решения / 01</p>
            <h2 className="wx-title" id="wx-edit-title">
              То, с чем сложно ошибиться.
            </h2>
          </div>
          <div className="wx-edit-side">
            <p>
              Не бесконечный каталог. Несколько понятных сценариев — от небольшого
              жеста до заметного поздравления. Внутри — точная цена и доступные детали.
            </p>
            <Link href="/shop" className="wx-text-link">
              Посмотреть все решения <ShopIcon name="arrow" />
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
          Фото задают настроение коллекции. Точный состав, количество и доступные
          оттенки всегда указаны внутри конкретного решения.
        </p>
      </section>

      <section className="wx-finder" id="finder" aria-labelledby="wx-finder-title">
        <div className="wx-finder-intro">
          <p className="wx-kicker">WINK MATCH</p>
          <h2 className="wx-title" id="wx-finder-title" ref={finderHeading} tabIndex={-1}>
            Скажите четыре вещи. Мы сократим выбор до двух.
          </h2>
          <p>
            Кого поздравляем, какой повод, нужный эффект и бюджет. Дальше — уже наша работа.
            Дату и стоимость доставки подтвердим до оплаты.
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
                <span className="wx-kicker">Рекомендация WINK</span>
                <h3>Начните с этих вариантов.</h3>
                <p>
                  {recommendations.length
                    ? `${recommendations.length} ${recommendations.length === 1 ? "решение" : "решения"}, которые лучше всего совпали с вашим запросом. Откройте карточку — там останутся только личные детали.`
                    : "В этой рамке готового решения пока нет. Измените бюджет или напишите нам — предложим ближайший сильный вариант без случайной замены."}
                </p>
                <div className="wx-actions">
                  <button
                    type="button"
                    className="wx-pill"
                    onClick={() => setAnswers([])}
                  >
                    Ответить заново
                  </button>
                  {!recommendations.length && (
                    <a className="wx-pill" href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
                      Написать для подбора
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
          <p className="wx-kicker">Персонализация без конструктора</p>
          <h2 className="wx-title" id="wx-personal-title">
            Личная деталь. Не визуальный шум.
          </h2>
          <article className="wx-personal-step">
            <span>01</span>
            <div>
              <h3>Возраст</h3>
              <p>
                В BIRTHDAY нужная цифра уже предусмотрена форматом. Вы указываете возраст,
                а цена для одной и двух цифр видна заранее.
              </p>
            </div>
          </article>
          <article className="wx-personal-step">
            <span>02</span>
            <div>
              <h3>Ваши слова</h3>
              <p>
                В MESSAGE надпись становится частью композиции. До 40 символов — достаточно,
                чтобы подарок говорил лично, но не превращался в плакат.
              </p>
            </div>
          </article>
          <article className="wx-personal-step">
            <span>03</span>
            <div>
              <h3>Настроение</h3>
              <p>
                Выбирайте из сочетаний, которые уже прошли отбор WINK. Стоимость стандартной
                палитры не меняется от оттенка — вы выбираете результат, а не цену цвета.
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
              Добавить личную деталь <ShopIcon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="wx-order" aria-labelledby="wx-order-title">
        <div className="wx-order-head">
          <div>
            <p className="wx-kicker">Сервис без красивых обещаний</p>
            <h2 className="wx-title" id="wx-order-title">
              Сначала подтверждаем. Потом берём деньги.
            </h2>
          </div>
          <p className="wx-copy">
            Важная дата не переносится, поэтому мы не выдаём пожелание за бронь.
            Сначала проверяем реальную возможность выполнить заказ — потом фиксируем итог.
          </p>
        </div>
        <div className="wx-order-ledger">
          {[
            [
              "01",
              "Фиксируем ваш выбор",
              "В заявке остаются конкретная композиция, выбранные детали и пожелание по дате. Деньги на этом шаге не списываются.",
            ],
            [
              "02",
              "Проверяем ваш момент",
              "Подтверждаем состав, дату, адрес и стоимость доставки. Если это сюрприз — связываемся с вами, а не с получателем.",
            ],
            [
              "03",
              "Подтверждаем итог",
              "Вы знаете финальную сумму и согласованный сценарий до оплаты — без неожиданной доплаты в последнюю секунду.",
            ],
            [
              "04",
              "Привозим готовым",
              "Композиция приезжает собранной, с лентами, грузиками и транспортной упаковкой согласно выбранному формату.",
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
            Посмотреть готовые решения <ShopIcon name="arrow" />
          </Link>
        </div>
      </section>

      <section className="wx-faq" aria-labelledby="wx-faq-title">
        <div>
          <p className="wx-kicker">Перед первым WINK</p>
          <h2 className="wx-title" id="wx-faq-title">
            Что обычно важно знать заранее.
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
              Не нашли ответ — написать WINK <ShopIcon name="arrow" />
            </a>
          </div>
        </div>
      </section>

      <section className="wx-closing" aria-labelledby="wx-closing-title">
        <p className="wx-kicker">Когда надо красиво поздравить</p>
        <h2 className="wx-display" id="wx-closing-title">
          Скажите, кого. Выбор сузим сами.
        </h2>
        <div className="wx-closing-bottom">
          <p>
            Можно выбрать готовое решение или пройти WINK MATCH. Вам не нужно знать,
            сколько шаров «правильно»: достаточно человека, повода, эффекта и бюджета.
          </p>
          <div className="wx-actions">
            <Link className="wx-pill-dark" href="/shop">
              Выбрать готовое <ShopIcon name="arrow" />
            </Link>
            <button className="wx-pill-dark" type="button" onClick={startFinder}>
              Подобрать за 4 ответа
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}