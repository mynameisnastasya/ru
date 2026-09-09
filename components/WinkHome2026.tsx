"use client";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  CONTACT_URL,
  IMAGES,
  displayPrice,
  money,
  Product,
} from "@/lib/wink-shop";
import { useWinkCatalog } from "@/lib/use-wink-catalog";
import { recommendWinkMatch, type WinkMatchAnswers } from "@/lib/wink-match";
import { ProductCard, ShopIcon } from "./WinkShopUI";
import WinkPaletteScene from "./WinkPaletteScene";
import WinkMomentStory from "./WinkMomentStory";

export default function WinkHome2026() {
  const { catalog } = useWinkCatalog();
  const [occasion, setOccasion] = useState("Все");
  const [answers, setAnswers] = useState<string[]>([]);
  const finderHeading = useRef<HTMLHeadingElement>(null);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  function answer(next: string[]) {
    setAnswers(next);
    requestAnimationFrame(() =>
      questionHeading.current?.focus({ preventScroll: true }),
    );
  }
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
      title: "Где будет сюрприз?",
      values: [
        ["bedroom", "Спальня или небольшой номер"],
        ["living", "Гостиная"],
        ["venue", "Ресторан или просторный зал"],
        ["unsure", "Пока не знаю"],
      ],
    },
    {
      title: "Какое настроение?",
      values: [
        ["PINK_MILK", "Нежное"],
        ["PINK_CHROME", "С блеском"],
        ["MILK", "Спокойное"],
        ["BLACK_CHROME", "Контрастное"],
        ["choose", "Доверюсь WINK"],
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
    if (answers.length !== 5) return [];
    const [recipient, occasion, space, mood, budget] = answers;
    return recommendWinkMatch(catalog.products, {
      recipient,
      occasion,
      space,
      mood,
      budget: budget === "any" ? "any" : Number(budget),
    } as WinkMatchAnswers);
  }, [catalog.products, answers]);
  const preferred = ["air16", "birthday16-2", "hearts7"];
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
          .slice(0, 3);
  function startFinder() {
    setAnswers([]);
    window.requestAnimationFrame(() => {
      finderHeading.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
      finderHeading.current?.focus({ preventScroll: true });
    });
  }
  return (
    <main className="wk-home">
      <section className="wk-hero wk-gifting-hero">
        <div className="wk-hero-copy">
          <p className="wk-eyebrow">Красиво поздравить · Кемерово</p>
          <h1>
            Дарите
            <br />
            <em>это чувство.</em>
          </h1>
          <p className="wk-hero-intro">
            Готовые воздушные композиции для ваших людей. Соберём и привезём по
            Кемерову.
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
            Продуманные сочетания. Ничего случайного.
          </span>
        </div>
        <figure className="wk-hero-image">
          <Image
            src={IMAGES.momentReaction}
            alt="Визуализация: девушка рядом с молочной воздушной композицией в домашней спальне"
            width={1000}
            height={1250}
            priority
            unoptimized
            sizes="(max-width: 700px) 100vw, 52vw"
          />
          <figcaption>
            <small>Тот самый момент · визуализация WINK</small>
          </figcaption>
        </figure>
        <Link
          className="wk-hero-postcard"
          href="/occasion/love"
          aria-label="Посмотреть композиции с сердцами"
        >
          <Image
            src={IMAGES.hearts}
            alt=""
            width={180}
            height={240}
            unoptimized
          />
          <span>
            От всего <em>сердца.</em> <ShopIcon name="arrow" />
          </span>
        </Link>
      </section>
      <div className="wk-service-strip">
        <span>Готовые сочетания</span>
        <span>Ваша цифра или надпись</span>
        <span>Доставим собранными</span>
      </div>
      <section className="wk-section" id="selection">
        <div className="wk-section-heading">
          <div>
            <p className="wk-eyebrow">Выбрано с чувством</p>
            <h2>
              Не тысяча вариантов.
              <br />
              <em>Только ваши.</em>
            </h2>
          </div>
          <Link href="/shop" className="wk-text-link">
            Все композиции <ShopIcon name="arrow" />
          </Link>
        </div>
        <div className="wk-chips" role="group" aria-label="Подборка по поводу">
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
        <div className="wk-grid wk-edit-grid" aria-live="polite">
          {selection.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <p className="wk-image-note">
          Изображения показывают настроение коллекций. Точное количество шаров и
          детали — в составе каждого набора.
        </p>
      </section>
      <WinkMomentStory onFind={startFinder} />
      <section className="wk-finder wk-section" id="finder">
        <div>
          <p className="wk-eyebrow">WINK MATCH · можно без долгого выбора</p>
          <h2 ref={finderHeading} tabIndex={-1}>
            «Хочу красиво.
            <br />
            <em>Помогите выбрать».</em>
          </h2>
          <p>
            Пять коротких ответов — до двух композиций под ваш повод,
            пространство и бюджет. Объясним, почему они подходят. Доставка
            считается отдельно.
          </p>
        </div>
        <div className="wk-finder-panel">
          <div
            className="wk-finder-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={answers.length}
            aria-label={`Подбор: ${answers.length} из ${questions.length} ответов`}
          >
            {questions.map((q, i) => (
              <span
                className={i <= answers.length ? "active" : ""}
                key={q.title}
              />
            ))}
          </div>
          {answers.length > 0 && (
            <div
              className="wk-match-answers"
              role="group"
              aria-label="Изменить ответы подбора"
            >
              {answers.map((value, i) => (
                <button
                  key={questions[i].title}
                  type="button"
                  onClick={() => answer(answers.slice(0, i))}
                  aria-label={`Изменить ответ: ${questions[i].title}`}
                >
                  {questions[i].values.find(([id]) => id === value)?.[1]}
                </button>
              ))}
            </div>
          )}
          {answers.length < questions.length ? (
            <>
              <span className="wk-eyebrow">
                Шаг {answers.length + 1} из {questions.length}
              </span>
              <h3 ref={questionHeading} tabIndex={-1}>
                {questions[answers.length].title}
              </h3>
              <div className="wk-finder-choices">
                {questions[answers.length].values.map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => answer([...answers, value])}
                  >
                    {label}
                    <ShopIcon name="arrow" />
                  </button>
                ))}
              </div>
              {answers.length > 0 && (
                <button
                  className="wk-text-button"
                  onClick={() => answer(answers.slice(0, -1))}
                >
                  Назад
                </button>
              )}
            </>
          ) : (
            <div aria-live="polite">
              <h3 ref={questionHeading} tabIndex={-1}>
                {recommendations.length
                  ? "Вот ваш WINK."
                  : "Найдём другой вариант."}
              </h3>
              <p>
                {recommendations.length
                  ? `${recommendations.length} ${recommendations.length === 1 ? "вариант" : "варианта"} в вашем бюджете. Палитра уже выбрана; цифру или надпись добавите в карточке. Цвет фольгированных сердец выбирается отдельно.`
                  : "В этом бюджете подходящих наборов пока нет. Попробуйте другой бюджет или напишите нам."}
              </p>
              <button className="wk-text-button" onClick={() => answer([])}>
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
            {recommendations.map(({ product, palette, reason }, i) => (
              <div className="wk-match-result" key={product.slug}>
                <p className="wk-match-reason">
                  <strong>
                    {i === 0 ? "WINK рекомендует" : "Ещё один вариант"}
                  </strong>
                  {reason}
                </p>
                <ProductCard product={product} palette={palette} />
              </div>
            ))}
          </div>
        )}
      </section>
      <WinkPaletteScene />
      <section
        className="wk-section wk-occasion-edit"
        aria-labelledby="occasion-title"
      >
        <div className="wk-section-heading">
          <div>
            <p className="wk-eyebrow">У каждого — свой повод</p>
            <h2 id="occasion-title">
              Для <em>ваших людей.</em>
            </h2>
          </div>
          <p>Мы поможем попасть в настроение.</p>
        </div>
        <div className="wk-occasion-grid">
          {[
            {
              href: "/for-her",
              image: IMAGES.love,
              title: "Для неё",
              text: "Когда слова — это ещё не всё",
            },
            {
              href: "/for-him",
              image: IMAGES.forHim,
              title: "Для него",
              text: "Красивый жест в его характере",
            },
            {
              href: "/kids",
              image: IMAGES.kids,
              title: "Маленьким мечтателям",
              text: "Праздник, который больше тебя",
            },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="wk-occasion-card">
              <Image
                src={item.image}
                alt={`Вдохновение: ${item.title}`}
                width={1000}
                height={1250}
                unoptimized
                sizes="(max-width: 700px) 80vw, 33vw"
              />
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ShopIcon name="arrow" />
              </div>
            </Link>
          ))}
        </div>
        <p className="wk-image-note">
          Идеи оформления, созданные с помощью ИИ. Доступные оттенки и состав
          выбираются в карточке.
        </p>
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
