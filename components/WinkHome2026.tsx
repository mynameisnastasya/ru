"use client";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  CONTACT_URL,
  IMAGES,
  PALETTES,
  budgetMatches,
  displayPrice,
  paletteIds,
  money,
  Product,
} from "@/lib/wink-shop";
import { useWinkCatalog } from "@/lib/use-wink-catalog";
import { rankFinderCandidates } from "@/lib/wink-finder";
import { ProductCard, ShopIcon } from "./WinkShopUI";

export default function WinkHome2026() {
  const { catalog } = useWinkCatalog();
  const [occasion, setOccasion] = useState("Все");
  const [answers, setAnswers] = useState<string[]>([]);
  const finderHeading = useRef<HTMLHeadingElement>(null);
  const questions = [
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
  ];
  const recommendations = useMemo(() => {
    if (answers.length !== 4) return [];
    const [recipient, event, palette, budget] = answers;
    return rankFinderCandidates(
      catalog.products
        .filter(
          (p) =>
            budgetMatches(displayPrice(p, palette), budget) &&
            (p.name === "HEARTS" ||
              p.name === "BABY REVEAL" ||
              paletteIds(p).includes(palette)) &&
            (event === "baby"
              ? p.name === "BABY REVEAL"
              : p.name !== "BABY REVEAL"),
        )
        .map((p) => ({
          item: p,
          signals: {
            recipientMatch:
              recipient === "kids"
                ? Number(p.name === "BIRTHDAY")
                : recipient === "him"
                  ? Number(["AIR", "BIRTHDAY", "MESSAGE"].includes(p.name))
                  : 1,
            occasionMatch:
              event === "birthday"
                ? Number(p.name === "BIRTHDAY")
                : event === "love"
                  ? Number(["LOVE", "HEARTS", "MESSAGE"].includes(p.name))
                  : 1,
            vibeMatch: 0,
            budgetFit: 1,
            bestseller: Boolean(p.bestseller),
            inStock: false,
            slotRisk: 0,
          },
        })),
      2,
    ).map((r) => r.item);
  }, [catalog.products, answers]);
  const preferred = ["air16", "birthday16-2", "hearts7", "message16"];
  const selection =
    occasion === "Все"
      ? preferred
          .map((slug) => catalog.products.find((p) => p.slug === slug))
          .filter((p): p is Product => Boolean(p))
      : catalog.products
          .filter((p) =>
            occasion === "День рождения"
              ? p.name === "BIRTHDAY"
              : occasion === "С любовью"
                ? ["LOVE", "HEARTS"].includes(p.name)
                : p.name === "AIR",
          )
          .slice(0, 4);
  function startFinder() {
    setAnswers([]);
    window.requestAnimationFrame(() => {
      finderHeading.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      finderHeading.current?.focus({ preventScroll: true });
    });
  }
  return (
    <main className="wk-home">
      <section className="wk-hero">
        <div className="wk-hero-copy">
          <p className="wk-eyebrow">WINK · Шары в Кемерово</p>
          <h1>
            Для ваших
            <br />
            самых <em>своих.</em>
          </h1>
          <p className="wk-hero-intro">
            Готовые композиции, красивые сочетания и несколько слов от вас.
            Чтобы человеку стало очень хорошо.
          </p>
          <p className="wk-start-price">
            Композиции от{" "}
            <strong>
              {money(Math.min(...catalog.products.map((p) => displayPrice(p))))}
            </strong>
          </p>
          <div className="wk-actions">
            <Link className="wk-button" href="/shop">
              Выбрать композицию <ShopIcon name="arrow" />
            </Link>
            <button className="wk-text-button" onClick={startFinder}>
              Помочь с выбором
            </button>
          </div>
          <span className="wk-hero-note">
            Палитра — на ваш вкус. Доставка — по согласованию.
          </span>
        </div>
        <figure className="wk-hero-image">
          <Image
            src={IMAGES.air}
            alt="Визуализация воздушной композиции: розовые, молочные и серебряные шары в светлой комнате"
            width={1536}
            height={1024}
            priority
            unoptimized
            sizes="(max-width: 700px) 100vw, 55vw"
          />
          <figcaption>
            <span>
              Маленький жест.
              <br />
              <em>Большое «люблю».</em>
            </span>
            <small>Визуализация WINK</small>
          </figcaption>
        </figure>
      </section>
      <div className="wk-service-strip">
        <span>Готовые сочетания</span>
        <span>Ваша цифра или надпись</span>
        <span>Доставим собранными</span>
      </div>
      <section className="wk-section" id="selection">
        <div className="wk-section-heading">
          <div>
            <p className="wk-eyebrow">Начните с этих</p>
            <h2>
              Красиво уже <em>придумали.</em>
            </h2>
          </div>
          <Link href="/shop" className="wk-text-link">
            Все композиции <ShopIcon name="arrow" />
          </Link>
        </div>
        <div className="wk-chips" aria-label="Подборка по поводу">
          {["Все", "День рождения", "С любовью", "Просто так"].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={occasion === value}
              className={occasion === value ? "active" : ""}
              onClick={() => setOccasion(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="wk-grid" aria-live="polite">
          {selection.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <p className="wk-image-note">
          Изображения показывают настроение коллекций. Точное количество шаров и
          детали — в составе каждого набора.
        </p>
      </section>
      <section className="wk-finder wk-section" id="finder">
        <div>
          <p className="wk-eyebrow">Можно без долгого выбора</p>
          <h2 ref={finderHeading} tabIndex={-1}>
            «Хочу красиво.
            <br />
            <em>Помогите выбрать».</em>
          </h2>
          <p>
            Четыре коротких ответа — до двух композиций в вашем бюджете.
            Доставка считается отдельно.
          </p>
        </div>
        <div className="wk-finder-panel">
          <div
            className="wk-finder-progress"
            aria-label={`Шаг ${Math.min(answers.length + 1, 4)} из 4`}
          >
            {questions.map((q, i) => (
              <span
                className={i <= answers.length ? "active" : ""}
                key={q.title}
              />
            ))}
          </div>
          {answers.length < 4 ? (
            <>
              <span className="wk-eyebrow">0{answers.length + 1} / 04</span>
              <h3>{questions[answers.length].title}</h3>
              <div className="wk-finder-choices">
                {questions[answers.length].values.map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setAnswers([...answers, value])}
                  >
                    {label}
                    <ShopIcon name="arrow" />
                  </button>
                ))}
              </div>
              {answers.length > 0 && (
                <button
                  className="wk-text-button"
                  onClick={() => setAnswers(answers.slice(0, -1))}
                >
                  Назад
                </button>
              )}
            </>
          ) : (
            <div aria-live="polite">
              <h3>Вот с чего можно начать.</h3>
              <p>
                {recommendations.length
                  ? `${recommendations.length} ${recommendations.length === 1 ? "вариант" : "варианта"} под ваш запрос. Посмотрите детали ниже.`
                  : "В этом бюджете подходящих наборов пока нет. Попробуйте другой бюджет или напишите нам."}
              </p>
              <button className="wk-text-button" onClick={() => setAnswers([])}>
                Подобрать заново
              </button>
              {!recommendations.length && (
                <a className="wk-text-link" href={CONTACT_URL}>
                  Написать нам
                </a>
              )}
            </div>
          )}
        </div>
        {recommendations.length > 0 && (
          <div className="wk-finder-results">
            {recommendations.map((p) => (
              <ProductCard key={p.slug} product={p} palette={answers[2]} />
            ))}
          </div>
        )}
      </section>
      <section className="wk-section wk-palettes">
        <div className="wk-section-heading">
          <div>
            <p className="wk-eyebrow">Один набор — разное настроение</p>
            <h2>
              Найдите <em>свои оттенки.</em>
            </h2>
          </div>
          <p>Мы собрали сочетания. Вам осталось выбрать то самое.</p>
        </div>
        <div className="wk-palette-grid">
          {["PINK_MILK", "PINK_CHROME", "MILK", "BLACK_CHROME"].map((id) => (
            <Link
              key={id}
              href={`/shop/?palette=${id}`}
              className="wk-palette-link"
            >
              <span className="wk-swatches">
                {PALETTES[id].colors.map((c, i) => (
                  <i key={i} style={{ background: c }} />
                ))}
              </span>
              <span>{PALETTES[id].name}</span>
              <ShopIcon name="arrow" />
            </Link>
          ))}
        </div>
      </section>
      <section className="wk-story">
        <figure>
          <Image
            src={IMAGES.birthday}
            alt="Визуализация композиции с серебряными цифрами 25 и нежными шарами"
            width={1024}
            height={1536}
            unoptimized
            sizes="(max-width: 700px) 100vw, 50vw"
          />
          <figcaption>Вдохновение для дня рождения</figcaption>
        </figure>
        <div>
          <p className="wk-eyebrow">Для того самого утра</p>
          <h2>
            «Ты это всё
            <br />
            <em>для меня?»</em>
          </h2>
          <p>
            Цифры, которые что-то значат. Цвета, которые нравятся вашему
            человеку. И ощущение: «обо мне подумали».
          </p>
          <Link className="wk-button" href="/occasion/birthday">
            Собрать день рождения <ShopIcon name="arrow" />
          </Link>
          <Link className="wk-text-link" href="/room">
            Хочется оформить всю комнату?
          </Link>
        </div>
      </section>
      <section className="wk-section wk-how">
        <div className="wk-section-heading">
          <div>
            <p className="wk-eyebrow">Всего три шага</p>
            <h2>
              Вам остаётся <em>порадовать.</em>
            </h2>
          </div>
        </div>
        <div className="wk-how-grid">
          {[
            [
              "01",
              "Выберите основу",
              "Набор и палитру. Состав и цена — сразу в карточке.",
            ],
            [
              "02",
              "Добавьте личное",
              "Важная цифра, надпись или акцент из бантов.",
            ],
            [
              "03",
              "Доверьте нам детали",
              "Согласуем доставку и оплату. Соберём и привезём готовую композицию.",
            ],
          ].map(([n, title, text]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="wk-section wk-faq">
        <div>
          <p className="wk-eyebrow">Перед вашим первым WINK</p>
          <h2>
            Пара <em>вопросов.</em>
          </h2>
          <a className="wk-text-link" href={CONTACT_URL}>
            Можно просто написать нам <ShopIcon name="arrow" />
          </a>
        </div>
        <div>
          {[
            [
              "Можно выбрать свою цифру?",
              "Да. В карточке набора с цифрами укажите нужный возраст. Для одной цифры и двух цифр предусмотрены разные наборы и цены.",
            ],
            [
              "Что входит в цену?",
              "Состав указан в карточке: количество шаров, цифры или другие акценты, ленты, грузики и упаковка. Платные дополнения видны до добавления в корзину. Доставка оплачивается отдельно.",
            ],
            [
              "Можно заказать сюрприз?",
              "При оформлении выберите «Это подарок» и отметьте «Не звонить получателю». Организационные вопросы будем решать с вами.",
            ],
            [
              "Когда и как оплатить?",
              "После отправки заявки согласуем состав, доступную дату, стоимость доставки и способ оплаты. До подтверждения дата остаётся пожеланием.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
