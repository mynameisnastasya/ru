"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";

const HERO = "https://images.pexels.com/photos/30277077/pexels-photo-30277077.jpeg?auto=compress&cs=tinysrgb&w=1900";
const GIRL = "https://images.pexels.com/photos/30277237/pexels-photo-30277237.jpeg?auto=compress&cs=tinysrgb&w=1500";
const PINK = "https://images.pexels.com/photos/31840152/pexels-photo-31840152.jpeg?auto=compress&cs=tinysrgb&w=1500";
const NUMBER = "https://images.pexels.com/photos/31840097/pexels-photo-31840097.jpeg?auto=compress&cs=tinysrgb&w=1500";
const NIGHT = "https://images.pexels.com/photos/31840156/pexels-photo-31840156.jpeg?auto=compress&cs=tinysrgb&w=1500";
const FLOWERS = "https://images.pexels.com/photos/30277270/pexels-photo-30277270.jpeg?auto=compress&cs=tinysrgb&w=1500";

const FALLBACK_PRODUCTS: Product[] = [
  { id: "air16", slug: "air16", name: "AIR", subtitle: "16 шаров", base_price_minor: 349000 },
  { id: "air30", slug: "air30", name: "AIR", subtitle: "30 шаров", base_price_minor: 559000 },
  { id: "birthday16-1", slug: "birthday16-1", name: "BIRTHDAY", subtitle: "16 шаров + 1 цифра", base_price_minor: 439000 },
  { id: "birthday16-2", slug: "birthday16-2", name: "BIRTHDAY", subtitle: "16 шаров + 2 цифры", base_price_minor: 519000 },
  { id: "birthday30-1", slug: "birthday30-1", name: "BIRTHDAY", subtitle: "30 шаров + 1 цифра", base_price_minor: 659000 },
  { id: "birthday30-2", slug: "birthday30-2", name: "BIRTHDAY", subtitle: "30 шаров + 2 цифры", base_price_minor: 729000 },
  { id: "love16", slug: "love16", name: "LOVE", subtitle: "16 шаров + 2 сердца", base_price_minor: 429000 },
  { id: "love30", slug: "love30", name: "LOVE", subtitle: "30 шаров + 4 сердца", base_price_minor: 689000 },
  { id: "hearts7", slug: "hearts7", name: "HEARTS", subtitle: "7 сердец", base_price_minor: 279000 },
  { id: "hearts14", slug: "hearts14", name: "HEARTS", subtitle: "14 сердец", base_price_minor: 479000 },
  { id: "message16", slug: "message16", name: "MESSAGE", subtitle: "16 шаров + личная надпись", base_price_minor: 509000 },
  { id: "message30", slug: "message30", name: "MESSAGE", subtitle: "30 шаров + личная надпись", base_price_minor: 729000 },
  { id: "baby-reveal-solo", slug: "baby-reveal-solo", name: "BABY REVEAL", subtitle: "Шар-сюрприз", base_price_minor: 339000 },
  { id: "baby-reveal16", slug: "baby-reveal16", name: "BABY REVEAL", subtitle: "Шар-сюрприз + 16 шаров", base_price_minor: 629000 },
];

type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  base_price_minor: number;
  bestseller?: boolean;
};

type Catalog = { products: Product[] };
type Recipient = "Девушку" | "Мужчину" | "Ребёнка" | "Маму" | "Подругу";
type Occasion = "День рождения" | "Любовь" | "Без повода" | "Другое";
type Vibe = "Нежно" | "Эффектно" | "Спокойно" | "Ярко" | "Не знаю";
type Budget = "до 5 000 ₽" | "5–10 000 ₽" | "10–20 000 ₽" | "20 000 ₽+";

const RECIPIENTS: Recipient[] = ["Девушку", "Мужчину", "Ребёнка", "Маму", "Подругу"];
const OCCASIONS: Occasion[] = ["День рождения", "Любовь", "Без повода", "Другое"];
const VIBES: Vibe[] = ["Нежно", "Эффектно", "Спокойно", "Ярко", "Не знаю"];
const BUDGETS: Budget[] = ["до 5 000 ₽", "5–10 000 ₽", "10–20 000 ₽", "20 000 ₽+"];

function money(minor: number) {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(minor / 100))} ₽`;
}

function productImage(product: Product) {
  if (product.name === "BIRTHDAY") return NUMBER;
  if (product.name === "LOVE" || product.name === "HEARTS") return PINK;
  if (product.name === "MESSAGE" || product.name === "BABY REVEAL") return NIGHT;
  return HERO;
}

function scoreProduct(product: Product, recipient: Recipient | null, occasion: Occasion | null, vibe: Vibe | null, budget: Budget | null) {
  let score = product.bestseller ? 6 : 0;
  const family = product.name;

  if (occasion === "День рождения") score += ({ BIRTHDAY: 36, MESSAGE: 27, AIR: 22, HEARTS: 10, LOVE: 8 } as Record<string, number>)[family] || 0;
  if (occasion === "Любовь") score += ({ HEARTS: 36, LOVE: 34, MESSAGE: 26, AIR: 15 } as Record<string, number>)[family] || 0;
  if (occasion === "Без повода") score += ({ AIR: 30, LOVE: 27, MESSAGE: 25, HEARTS: 22 } as Record<string, number>)[family] || 0;
  if (occasion === "Другое") score += ({ AIR: 24, MESSAGE: 23, BIRTHDAY: 18, LOVE: 16 } as Record<string, number>)[family] || 0;

  if (recipient === "Ребёнка" && family === "BIRTHDAY") score += 12;
  if (recipient === "Мужчину" && ["AIR", "BIRTHDAY", "MESSAGE"].includes(family)) score += 9;
  if (["Девушку", "Подругу", "Маму"].includes(recipient || "") && ["MESSAGE", "LOVE", "HEARTS"].includes(family)) score += 8;

  if (vibe === "Нежно" && ["AIR", "LOVE", "MESSAGE"].includes(family)) score += 8;
  if (vibe === "Эффектно" && ["BIRTHDAY", "LOVE"].includes(family) && product.base_price_minor >= 500000) score += 10;
  if (vibe === "Спокойно" && ["AIR", "MESSAGE"].includes(family)) score += 8;
  if (vibe === "Ярко" && ["BIRTHDAY", "HEARTS"].includes(family)) score += 8;

  const price = product.base_price_minor;
  if (budget === "до 5 000 ₽") score += price <= 500000 ? 18 : -18;
  if (budget === "5–10 000 ₽") score += price >= 450000 && price <= 1000000 ? 18 : -10;
  if (budget === "10–20 000 ₽") score += price >= 650000 ? 16 : 4;
  if (budget === "20 000 ₽+") score += price >= 650000 ? 12 : 2;

  return score;
}

function Icon({ name }: { name: "search" | "heart" | "user" | "bag" }) {
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>,
    heart: <path d="M20.3 5.7a5 5 0 0 0-7.1 0L12 6.9l-1.2-1.2a5 5 0 1 0-7.1 7.1L12 21l8.3-8.2a5 5 0 0 0 0-7.1Z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
    bag: <><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function WinkHome2026() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [finderOpen, setFinderOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/api/catalog`)
      .then((response) => {
        if (!response.ok) throw new Error("catalog");
        return response.json() as Promise<Catalog>;
      })
      .then((catalog) => {
        if (active && Array.isArray(catalog.products) && catalog.products.length) setProducts(catalog.products);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const results = useMemo(() => products
    .map((product) => ({ product, score: scoreProduct(product, recipient, occasion, vibe, budget) }))
    .sort((a, b) => b.score - a.score || a.product.base_price_minor - b.product.base_price_minor)
    .slice(0, 3)
    .map((entry) => entry.product), [products, recipient, occasion, vibe, budget]);

  const hits = useMemo(() => {
    const preferred = ["birthday16-2", "love16", "message16", "air16", "hearts14", "birthday30-2"];
    return preferred.map((slug) => products.find((product) => product.slug === slug)).filter((product): product is Product => Boolean(product));
  }, [products]);

  function startFinder(value?: Recipient) {
    if (value) setRecipient(value);
    setStep(value ? 1 : 0);
    setFinderOpen(true);
    window.setTimeout(() => document.getElementById("finder")?.scrollIntoView({ behavior: "smooth", block: "start" }), 10);
  }

  function resetFinder() {
    setRecipient(null);
    setOccasion(null);
    setVibe(null);
    setBudget(null);
    setStep(0);
  }

  return <main className="wh26">
    <section className="wh26-hero" aria-label="WINK — когда хочется сделать красиво">
      <img src={HERO} alt="Живой момент с подарочной композицией WINK в светлом интерьере" />
      <div className="wh26-heroOverlay" />
      <div className="wh26-heroCopy">
        <p>Современные подарки и красивые поздравления</p>
        <h1>Когда хочется<br/>сделать красиво.</h1>
        <span>Готовые подарочные композиции и оформление с доставкой. Красиво уже придумали за вас.</span>
        <div className="wh26-actions">
          <button className="wh26-primary light" onClick={() => startFinder()}>Выбрать подарок</button>
          <Link className="wh26-secondary light" href="/shop">Смотреть по поводу</Link>
        </div>
        <small>Не знаете, что выбрать? Подберём сами за минуту.</small>
      </div>
    </section>

    <section className="wh26-section wh26-people">
      <div className="wh26-heading"><p>Начнём с человека</p><h2>Кого радуем?</h2><span>Не нужно сначала выбирать шары. Скажите, для кого этот момент — дальше сузим выбор сами.</span></div>
      <div className="wh26-peopleGrid">
        {[
          ["Её", "Девушку", GIRL],
          ["Его", "Мужчину", NIGHT],
          ["Ребёнка", "Ребёнка", NUMBER],
          ["Подругу", "Подругу", PINK],
          ["Маму", "Маму", FLOWERS],
        ].map(([label, value, image]) => <button key={label} onClick={() => startFinder(value as Recipient)} className="wh26-personCard"><img src={image} alt=""/><span>{label}</span></button>)}
        <button onClick={() => startFinder()} className="wh26-personCard wh26-personUnknown"><span>Пока не знаю</span><small>WINK выберет вместе с вами →</small></button>
      </div>
    </section>

    <section className={`wh26-section wh26-finder ${finderOpen ? "open" : ""}`} id="finder">
      <div className="wh26-heading"><p>Быстрый подбор</p><h2>Давайте выберем за минуту.</h2><span>Четыре коротких ответа. В конце — только три варианта, с которыми сложно ошибиться.</span></div>
      <div className="wh26-finderCard">
        <div className="wh26-progress">{[0,1,2,3].map((value) => <i className={step >= value ? "on" : ""} key={value}/>)}</div>
        {step === 0 && <FinderQuestion number="01" title="Кого поздравляем?" values={RECIPIENTS} value={recipient} onChoose={(choice) => { setRecipient(choice as Recipient); setStep(1); }}/>} 
        {step === 1 && <FinderQuestion number="02" title="Какой повод?" values={OCCASIONS} value={occasion} onChoose={(choice) => { setOccasion(choice as Occasion); setStep(2); }}/>} 
        {step === 2 && <FinderQuestion number="03" title="Какое настроение?" values={VIBES} value={vibe} onChoose={(choice) => { setVibe(choice as Vibe); setStep(3); }}/>} 
        {step === 3 && !budget && <FinderQuestion number="04" title="Какой бюджет?" values={BUDGETS} value={budget} onChoose={(choice) => setBudget(choice as Budget)}/>} 
        {budget && <div className="wh26-results">
          <div className="wh26-resultsHead"><div><small>Готово</small><h3>Вот три варианта.</h3><p>Мы бы начали с них — дальше можно поменять палитру и персонализацию внутри карточки.</p></div><button onClick={resetFinder}>Начать заново</button></div>
          <div className="wh26-resultGrid">{results.map((product, index) => <ProductCard key={product.slug} product={product} label={index === 0 ? "Самый простой выбор" : index === 1 ? "Чуть больше эмоции" : "Если хочется вау"}/>)}</div>
        </div>}
        {step > 0 && !budget && <button className="wh26-back" onClick={() => setStep((current) => Math.max(0, current - 1))}>← Назад</button>}
      </div>
    </section>

    <section className="wh26-section wh26-hits">
      <div className="wh26-heading row"><div><p>Короткий список</p><h2>Сейчас выбирают</h2></div><Link href="/shop">Смотреть весь каталог →</Link></div>
      <div className="wh26-hitGrid">{hits.map((product) => <ProductCard key={product.slug} product={product}/>)}</div>
    </section>

    <section className="wh26-section wh26-help">
      <div className="wh26-helpPanel">
        <div><p>WINK concierge</p><h2>Не знаете, какие шары ей нравятся?</h2><span>И не надо. Мы уже собрали сочетания, которые хорошо выглядят вместе.</span></div>
        <div className="wh26-helpSteps"><article><b>01</b><span>Вы выбираете повод.</span></article><article><b>02</b><span>Мы показываем 2–3 варианта.</span></article><article><b>03</b><span>Привозим готовым.</span></article><button className="wh26-primary" onClick={() => startFinder()}>Подберите мне</button></div>
      </div>
    </section>

    <section className="wh26-section wh26-palettes">
      <div className="wh26-heading"><p>Не цвета, а настроение</p><h2>Выберите настроение</h2><span>Мы не даём 84 оттенка. Только сочетания, которые уже проверены визуально.</span></div>
      <div className="wh26-paletteGrid">
        <MoodCard title="Нежный" caption="blush · milk · chrome" image={PINK}/>
        <MoodCard title="Тёплый" caption="cocoa · cream" image={FLOWERS}/>
        <MoodCard title="Чистый" caption="milk · silver" image={HERO}/>
        <MoodCard title="Романтичный" caption="rose · blush" image={GIRL}/>
        <MoodCard title="Спокойный" caption="taupe · milk" image={FLOWERS}/>
        <MoodCard title="Контрастный" caption="graphite · chrome" image={NIGHT}/>
      </div>
    </section>

    <EditorialSection eyebrow="Для неё" title={<>Для того самого<br/><em>«это всё мне?»</em></>} text="День рождения, годовщина, признание или просто хороший повод. Собрали варианты, которые хочется сфотографировать ещё до того, как открыли подарок." image={GIRL} href="/for-her" cta="Выбрать для неё" />

    <section className="wh26-room">
      <div className="wh26-roomBefore"><img src={HERO} alt="Комната до оформления WINK"/><span>До WINK</span></div>
      <div className="wh26-roomAfter"><img src={NUMBER} alt="Комната после оформления WINK"/><span>После WINK</span></div>
      <div className="wh26-roomCopy"><p>Оформление комнаты</p><h2>Проснуться внутри праздника.</h2><span>Вы выбираете стиль — мы собираем сценарий из цифр, композиций и оформления пространства.</span><Link className="wh26-primary light" href="/room">Смотреть оформления</Link></div>
    </section>

    <section className="wh26-section wh26-splitChoices">
      <Link href="/for-him" className="wh26-choiceCard dark"><img src={NIGHT} alt="Спокойная композиция для него"/><div><p>Для него</p><h2>Красиво — не обязательно розово.</h2><span>Graphite, cocoa, silver и milk. Чистые формы и ничего лишнего.</span><b>Выбрать для него →</b></div></Link>
      <Link href="/kids" className="wh26-choiceCard"><img src={NUMBER} alt="Красивое детское оформление"/><div><p>Детям</p><h2>Детский праздник, но красиво.</h2><span>Мягкие палитры, возраст как персонализация и никакого разноцветного зоопарка.</span><b>Выбрать детское →</b></div></Link>
    </section>

    <section className="wh26-section wh26-addons">
      <div className="wh26-heading row"><div><p>Рост чека через заботу</p><h2>Добавить к моменту</h2></div><Link href="/gifts">Все подарки →</Link></div>
      <div className="wh26-addonGrid">
        <AddonCard title="Цветы" note="Скоро" image={FLOWERS}/><AddonCard title="Открытка" note="Можно добавить к заказу" image={PINK}/><AddonCard title="Фотографии" note="После теста формата" image={GIRL}/><AddonCard title="Зайчик ручной работы" note="Скоро" image={HERO}/><AddonCard title="Свечи" note="Планируется" image={NIGHT}/><AddonCard title="Торт" note="Планируется" image={FLOWERS}/>
      </div>
    </section>

    <section className="wh26-gifts"><img src={FLOWERS} alt="Подарочный момент WINK"/><div><p>WINK Gifts</p><h2>Красивое не заканчивается на шарах.</h2><span>WINK собирает подарки вокруг момента: цветы, открытки, фотографии и вещи, которые хочется оставить.</span><Link className="wh26-secondary light" href="/gifts">Смотреть направление</Link></div></section>

    <section className="wh26-section wh26-life">
      <div className="wh26-heading"><p>Не рекламный рендер</p><h2>WINK в жизни</h2><span>Здесь будут реальные заказы, комнаты и реакции клиентов. Пока не подменяем UGC выдуманными отзывами и цифрами.</span></div>
      <div className="wh26-lifeGrid"><figure><img src={GIRL} alt="Живой момент с подарком"/><figcaption>День рождения дома</figcaption></figure><figure><img src={PINK} alt="Подарочная композиция в интерьере"/><figcaption>Сюрприз от подруг</figcaption></figure><figure><img src={NUMBER} alt="Композиция с цифрами"/><figcaption>Утро дня рождения</figcaption></figure><figure><img src={HERO} alt="WINK в светлом интерьере"/><figcaption>Просто хотелось порадовать</figcaption></figure></div>
    </section>

    <section className="wh26-section wh26-service">
      <div className="wh26-heading"><p>Сервис — часть подарка</p><h2>Вам остаётся только подарить.</h2></div>
      <div className="wh26-serviceGrid"><article><b>01</b><h3>Подскажем</h3><p>Если не знаете что выбрать, не заставим отвечать на двадцать вопросов.</p></article><article><b>02</b><h3>Соберём</h3><p>По утверждённой композиции и производственному стандарту.</p></article><article><b>03</b><h3>Привезём</h3><p>К выбранному моменту после подтверждения доступного слота.</p></article><article><b>04</b><h3>Решим</h3><p>Если что-то пошло не так, не будем перекладывать проблему на клиента.</p></article></div>
    </section>

    <section className="wh26-dates"><div><p>Будущий WINK</p><h2>Любимые люди случаются чаще одного раза в год.</h2><span>Сохраняйте важные даты — WINK напомнит заранее и покажет новые варианты для человека, которого вы уже поздравляли.</span><div className="wh26-dateChips"><i>День рождения</i><i>Годовщина</i><i>14 февраля</i><i>8 марта</i><i>Встреча</i><i>Просто так</i></div><Link href="/account" className="wh26-primary">Сохранить важную дату</Link></div></section>

    <footer className="wh26-footer"><div className="wh26-footerBrand"><b>WINK</b><p>Когда хочется сделать красиво.</p></div><div><h4>Каталог</h4><Link href="/shop">Все композиции</Link><Link href="/for-her">Для неё</Link><Link href="/for-him">Для него</Link><Link href="/kids">Детям</Link></div><div><h4>Поводы</h4><Link href="/occasion/birthday">День рождения</Link><Link href="/occasion/love">Любовь</Link><Link href="/room">Оформление комнаты</Link><Link href="/gifts">Подарки</Link></div><div><h4>Помощь</h4><Link href="/delivery">Доставка и оплата</Link><Link href="/faq">FAQ</Link><Link href="/about">О WINK</Link><Link href="/corporate">Корпоративным</Link></div><div className="wh26-footerBottom"><span>WINK · Кемерово</span><span>Telegram · Instagram</span></div></footer>

    <nav className="wh26-mobileNav" aria-label="Мобильная навигация"><Link href="/">Главная</Link><Link href="/shop">Каталог</Link><Link href="/favorites"><Icon name="heart"/><span>Избранное</span></Link><button onClick={() => document.querySelector<HTMLButtonElement>(".wv4-bag")?.click()}><Icon name="bag"/><span>Корзина</span></button></nav>

    <style jsx global>{`
      .wh26{--milk:#F7F3EE;--white:#FFFDFC;--graphite:#242222;--blush:#E5C8CE;--rose:#D5A8B2;--taupe:#B7A9A2;--cocoa:#5A403E;--line:rgba(36,34,34,.13);background:var(--milk);color:var(--graphite);font-family:Inter,Arial,sans-serif}.wh26 *{box-sizing:border-box}.wh26 a{color:inherit;text-decoration:none}.wh26 button{font:inherit;color:inherit}.wh26 img{display:block;width:100%;height:100%;object-fit:cover}.wh26 em{font-family:"Instrument Serif",Georgia,serif;font-weight:400}.wh26-hero{height:calc(100svh - 68px);min-height:680px;position:relative;overflow:hidden;background:#5a403e}.wh26-hero>img{filter:saturate(.85);object-position:center 40%}.wh26-heroOverlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(24,19,18,.68),rgba(24,19,18,.22) 54%,rgba(24,19,18,.05))}.wh26-heroCopy{position:absolute;left:max(64px,calc((100vw - 1400px)/2));bottom:11vh;width:min(720px,calc(100% - 120px));color:white}.wh26-heroCopy>p,.wh26-heading>p,.wh26-heading>div>p,.wh26-helpPanel p,.wh26-roomCopy>p,.wh26-choiceCard p,.wh26-gifts p,.wh26-dates p{margin:0 0 18px;font-size:11px;letter-spacing:.15em;text-transform:uppercase}.wh26-heroCopy h1{font:500 clamp(58px,6vw,88px)/.94 Inter,Arial,sans-serif;letter-spacing:-.055em;margin:0;max-width:780px}.wh26-heroCopy>span{display:block;max-width:580px;font-size:18px;line-height:1.55;margin:28px 0}.wh26-actions{display:flex;gap:10px;align-items:center}.wh26-primary,.wh26-secondary{min-height:54px;display:inline-flex;align-items:center;justify-content:center;border-radius:13px;padding:0 22px;font-weight:600;font-size:14px}.wh26-primary{border:0;background:var(--graphite);color:white;cursor:pointer}.wh26-primary.light{background:white;color:var(--graphite)}.wh26-secondary{border:1px solid rgba(36,34,34,.28);background:transparent}.wh26-secondary.light{border-color:rgba(255,255,255,.6);color:white}.wh26-heroCopy small{display:block;margin-top:18px;color:rgba(255,255,255,.78);font-size:12px}.wh26-section{padding:120px max(64px,calc((100vw - 1400px)/2))}.wh26-heading{max-width:790px;margin-bottom:48px}.wh26-heading.row{max-width:none;display:flex;align-items:end;justify-content:space-between;gap:30px}.wh26-heading.row>a{font-size:13px;border-bottom:1px solid currentColor;padding-bottom:3px}.wh26-heading h2,.wh26-helpPanel h2,.wh26-roomCopy h2,.wh26-choiceCard h2,.wh26-gifts h2,.wh26-dates h2{font:500 clamp(42px,4.3vw,64px)/1 Inter,Arial,sans-serif;letter-spacing:-.055em;margin:0}.wh26-heading>span,.wh26-helpPanel>div>span,.wh26-roomCopy>span,.wh26-choiceCard span,.wh26-gifts span,.wh26-dates span{display:block;margin-top:20px;max-width:610px;color:#736b67;font-size:17px;line-height:1.6}.wh26-people{background:var(--white)}.wh26-peopleGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.wh26-personCard{position:relative;min-height:310px;border:0;padding:0;overflow:hidden;background:#ece4de;cursor:pointer;text-align:left}.wh26-personCard:after{content:"";position:absolute;inset:45% 0 0;background:linear-gradient(transparent,rgba(20,18,18,.52))}.wh26-personCard img{transition:transform .5s ease}.wh26-personCard:hover img{transform:scale(1.025)}.wh26-personCard>span{position:absolute;z-index:2;left:18px;bottom:18px;color:white;font-size:20px;font-weight:600}.wh26-personUnknown{background:var(--graphite);color:white;padding:22px;display:flex;flex-direction:column;justify-content:flex-end}.wh26-personUnknown:after{display:none}.wh26-personUnknown>span{position:static;font-size:24px}.wh26-personUnknown small{margin-top:10px;color:rgba(255,255,255,.65);line-height:1.5}.wh26-finder{background:#efe8e4}.wh26-finderCard{background:var(--white);border:1px solid var(--line);padding:30px;min-height:450px}.wh26-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.wh26-progress i{height:2px;background:#ded6d1}.wh26-progress i.on{background:var(--graphite)}.wh26-question{padding:56px 16px 22px}.wh26-question>small,.wh26-resultsHead small{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#827975}.wh26-question h3,.wh26-resultsHead h3{font:500 38px/1.05 Inter,Arial,sans-serif;letter-spacing:-.04em;margin:13px 0 30px}.wh26-options{display:grid;grid-template-columns:repeat(5,1fr);gap:9px}.wh26-options button{min-height:62px;border:1px solid var(--line);background:var(--milk);border-radius:12px;padding:12px;cursor:pointer}.wh26-options button:hover,.wh26-options button.active{background:var(--graphite);color:white}.wh26-back{border:0;background:transparent;margin:18px 14px 0;color:#746c68;cursor:pointer}.wh26-results{padding:32px 12px 10px}.wh26-resultsHead{display:flex;justify-content:space-between;gap:30px;align-items:start;margin-bottom:26px}.wh26-resultsHead h3{font-size:42px;margin-bottom:10px}.wh26-resultsHead p{margin:0;color:#746c68;max-width:560px;line-height:1.55}.wh26-resultsHead>button{border:0;background:transparent;border-bottom:1px solid currentColor;cursor:pointer}.wh26-resultGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.wh26-productCard{background:var(--white);min-width:0}.wh26-productCard>a{display:block}.wh26-productImage{aspect-ratio:4/5;overflow:hidden;background:#e8dfd9;position:relative}.wh26-productImage img{transition:transform .45s ease;filter:saturate(.86)}.wh26-productCard:hover .wh26-productImage img{transform:scale(1.025)}.wh26-productLabel{position:absolute;left:12px;top:12px;background:rgba(255,253,252,.93);padding:8px 10px;font-size:10px}.wh26-productMeta{padding:15px 2px 0;display:flex;justify-content:space-between;gap:16px}.wh26-productMeta small{display:block;color:#817873;font-size:11px;margin-bottom:5px}.wh26-productMeta h3{font-size:19px;line-height:1.25;margin:0;font-weight:600}.wh26-productMeta strong{font-size:16px;white-space:nowrap}.wh26-help{padding-top:0}.wh26-helpPanel{background:var(--blush);display:grid;grid-template-columns:1.05fr .95fr;gap:70px;padding:72px}.wh26-helpSteps{display:grid;gap:0;align-content:center}.wh26-helpSteps article{display:grid;grid-template-columns:42px 1fr;gap:12px;border-top:1px solid rgba(36,34,34,.18);padding:17px 0}.wh26-helpSteps article b{font-size:11px}.wh26-helpSteps article span{font-size:16px}.wh26-helpSteps .wh26-primary{justify-self:start;margin-top:18px}.wh26-palettes{background:var(--graphite);color:white}.wh26-palettes .wh26-heading>span{color:#b9b0ab}.wh26-paletteGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.wh26-mood{position:relative;aspect-ratio:1.35/1;overflow:hidden}.wh26-mood:after{content:"";position:absolute;inset:45% 0 0;background:linear-gradient(transparent,rgba(20,18,18,.65))}.wh26-mood img{filter:saturate(.78)}.wh26-mood div{position:absolute;z-index:2;left:20px;right:20px;bottom:18px}.wh26-mood h3{margin:0 0 4px;font-size:24px}.wh26-mood span{font-size:12px;color:rgba(255,255,255,.7)}.wh26-editorial{min-height:760px;display:grid;grid-template-columns:1fr 1fr;background:var(--white)}.wh26-editorialImage{min-height:620px}.wh26-editorialCopy{padding:100px max(50px,8vw);display:flex;flex-direction:column;justify-content:center}.wh26-editorialCopy>p{font-size:11px;letter-spacing:.15em;text-transform:uppercase;margin:0 0 18px}.wh26-editorialCopy h2{font:500 clamp(48px,4.5vw,68px)/1 Inter,Arial,sans-serif;letter-spacing:-.055em;margin:0}.wh26-editorialCopy h2 em{font-size:1.05em}.wh26-editorialCopy>span{color:#736b67;font-size:17px;line-height:1.6;max-width:590px;margin:22px 0 30px}.wh26-editorialCopy .wh26-primary{align-self:flex-start}.wh26-room{min-height:820px;display:grid;grid-template-columns:1fr 1fr;position:relative;background:#302b2a}.wh26-roomBefore,.wh26-roomAfter{position:relative;overflow:hidden}.wh26-roomBefore img{filter:saturate(.42) brightness(.76)}.wh26-roomAfter img{filter:saturate(.82)}.wh26-roomBefore>span,.wh26-roomAfter>span{position:absolute;top:20px;left:20px;background:rgba(255,253,252,.92);padding:8px 11px;font-size:10px;letter-spacing:.11em;text-transform:uppercase}.wh26-roomCopy{position:absolute;z-index:3;left:50%;top:50%;transform:translate(-50%,-50%);width:min(680px,80%);background:rgba(36,34,34,.92);color:white;padding:50px;text-align:center;backdrop-filter:blur(12px)}.wh26-roomCopy>span{color:#c9c1bc;margin:20px auto 28px}.wh26-roomCopy .wh26-primary{display:inline-flex}.wh26-splitChoices{display:grid;grid-template-columns:1fr 1fr;gap:14px;background:var(--white)}.wh26-choiceCard{min-height:720px;position:relative;overflow:hidden;color:white}.wh26-choiceCard:after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 35%,rgba(22,19,18,.72))}.wh26-choiceCard img{filter:saturate(.75)}.wh26-choiceCard>div{position:absolute;z-index:2;left:38px;right:38px;bottom:38px}.wh26-choiceCard h2{font-size:48px;max-width:580px}.wh26-choiceCard span{color:rgba(255,255,255,.75);max-width:500px}.wh26-choiceCard b{display:inline-block;margin-top:24px;border-bottom:1px solid currentColor;padding-bottom:4px;font-size:13px}.wh26-addonGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.wh26-addon{background:var(--white)}.wh26-addonImage{aspect-ratio:1/1.25;overflow:hidden}.wh26-addonImage img{filter:saturate(.72)}.wh26-addon div:last-child{padding:13px 2px}.wh26-addon h3{margin:0 0 4px;font-size:17px}.wh26-addon span{font-size:11px;color:#817873}.wh26-gifts{min-height:700px;display:grid;grid-template-columns:1.05fr .95fr;background:var(--cocoa);color:white}.wh26-gifts>div{padding:90px 8vw;display:flex;flex-direction:column;justify-content:center}.wh26-gifts>span,.wh26-gifts span{color:#d7cbc5}.wh26-gifts .wh26-secondary{align-self:flex-start;margin-top:28px}.wh26-life{background:var(--white)}.wh26-lifeGrid{display:grid;grid-template-columns:1.25fr .75fr .75fr 1.25fr;gap:9px;align-items:stretch}.wh26-lifeGrid figure{margin:0;position:relative;height:520px;overflow:hidden}.wh26-lifeGrid figure:nth-child(2),.wh26-lifeGrid figure:nth-child(3){height:410px;align-self:center}.wh26-lifeGrid figcaption{position:absolute;left:14px;bottom:14px;background:rgba(255,253,252,.92);padding:8px 11px;font-size:11px}.wh26-serviceGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.wh26-serviceGrid article{border-top:1px solid var(--graphite);padding:24px 4px 40px}.wh26-serviceGrid b{font-size:11px;color:#817873}.wh26-serviceGrid h3{font-size:26px;margin:18px 0 10px}.wh26-serviceGrid p{font-size:14px;line-height:1.6;color:#746c68;max-width:260px}.wh26-dates{background:var(--blush);padding:110px max(64px,calc((100vw - 1400px)/2))}.wh26-dates>div{max-width:980px}.wh26-dates>span{font-size:17px}.wh26-dateChips{display:flex;gap:8px;flex-wrap:wrap;margin:30px 0}.wh26-dateChips i{font-style:normal;border:1px solid rgba(36,34,34,.22);padding:10px 13px;border-radius:999px;font-size:12px}.wh26-footer{background:var(--cocoa);color:white;padding:80px max(64px,calc((100vw - 1400px)/2)) 34px;display:grid;grid-template-columns:2fr repeat(3,1fr);gap:50px}.wh26-footerBrand b{font:400 58px/1 "Instrument Serif",Georgia,serif}.wh26-footerBrand p{font-size:19px;color:#e5d8d2}.wh26-footer h4{font-size:11px;text-transform:uppercase;letter-spacing:.13em;margin:0 0 18px;color:#cfbeb7}.wh26-footer>div:not(.wh26-footerBrand):not(.wh26-footerBottom){display:flex;flex-direction:column;gap:10px}.wh26-footer a{font-size:13px;color:#f0e9e5}.wh26-footerBottom{grid-column:1/-1;display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.17);padding-top:24px;margin-top:20px;font-size:11px;color:#d0c2bc}.wh26-mobileNav{display:none}.wh26 svg{width:20px;height:20px}
      @media(max-width:1050px){.wh26-section{padding-left:30px;padding-right:30px}.wh26-heroCopy{left:30px;width:calc(100% - 60px)}.wh26-peopleGrid{grid-template-columns:repeat(3,1fr)}.wh26-hitGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px 10px}.wh26-addonGrid{grid-template-columns:repeat(3,1fr)}.wh26-footer,.wh26-dates{padding-left:30px;padding-right:30px}}
      @media(min-width:1051px){.wh26-hitGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}.wh26-hitGrid .wh26-productMeta{display:block}.wh26-hitGrid .wh26-productMeta strong{display:block;margin-top:8px}}
      @media(max-width:760px){.wh26{padding-bottom:66px}.wh26-hero{height:auto;min-height:0;padding-top:0;background:var(--milk)}.wh26-hero>img{height:62svh;min-height:430px;object-position:center}.wh26-heroOverlay{display:none}.wh26-heroCopy{position:static;width:auto;color:var(--graphite);padding:28px 18px 44px}.wh26-heroCopy>p{color:#746c68}.wh26-heroCopy h1{font-size:42px}.wh26-heroCopy>span{font-size:16px;margin:18px 0 24px}.wh26-actions{flex-direction:column;align-items:stretch}.wh26-primary.light{background:var(--graphite);color:white}.wh26-secondary.light{border-color:rgba(36,34,34,.3);color:var(--graphite)}.wh26-heroCopy small{color:#746c68}.wh26-section{padding:72px 18px}.wh26-heading{margin-bottom:30px}.wh26-heading.row{display:block}.wh26-heading.row>a{display:inline-block;margin-top:18px}.wh26-heading h2,.wh26-helpPanel h2,.wh26-roomCopy h2,.wh26-choiceCard h2,.wh26-gifts h2,.wh26-dates h2{font-size:32px}.wh26-heading>span,.wh26-helpPanel>div>span,.wh26-roomCopy>span,.wh26-choiceCard span,.wh26-gifts span,.wh26-dates span{font-size:16px}.wh26-peopleGrid{grid-template-columns:1fr 1fr;gap:7px}.wh26-personCard{min-height:230px}.wh26-personUnknown{min-height:230px}.wh26-finderCard{padding:15px}.wh26-question{padding:36px 2px 10px}.wh26-question h3{font-size:28px}.wh26-options{grid-template-columns:1fr 1fr}.wh26-results{padding:24px 0}.wh26-resultsHead{display:block}.wh26-resultsHead>button{margin-top:16px}.wh26-resultGrid{grid-template-columns:1fr}.wh26-hitGrid{display:grid;grid-template-columns:1fr 1fr;gap:28px 8px}.wh26-productImage{aspect-ratio:4/5}.wh26-productMeta{display:block}.wh26-productMeta strong{display:block;margin-top:8px}.wh26-helpPanel{grid-template-columns:1fr;padding:35px 22px;gap:38px}.wh26-paletteGrid{grid-template-columns:1fr 1fr;gap:7px}.wh26-mood{aspect-ratio:1/1.15}.wh26-mood h3{font-size:20px}.wh26-editorial{grid-template-columns:1fr;min-height:0}.wh26-editorialImage{min-height:520px}.wh26-editorialCopy{padding:58px 18px 70px}.wh26-editorialCopy h2{font-size:36px}.wh26-room{display:block;min-height:0}.wh26-roomBefore,.wh26-roomAfter{height:48svh;min-height:340px}.wh26-roomCopy{position:static;transform:none;width:auto;text-align:left;padding:52px 18px;background:var(--graphite)}.wh26-roomCopy>span{margin-left:0}.wh26-splitChoices{grid-template-columns:1fr;padding-left:18px;padding-right:18px}.wh26-choiceCard{min-height:560px}.wh26-choiceCard>div{left:22px;right:22px;bottom:24px}.wh26-choiceCard h2{font-size:34px}.wh26-addonGrid{grid-template-columns:1fr 1fr;gap:22px 8px}.wh26-gifts{grid-template-columns:1fr}.wh26-gifts>img{height:520px}.wh26-gifts>div{padding:62px 18px 70px}.wh26-lifeGrid{grid-template-columns:1fr 1fr;gap:7px}.wh26-lifeGrid figure,.wh26-lifeGrid figure:nth-child(2),.wh26-lifeGrid figure:nth-child(3){height:330px;align-self:auto}.wh26-serviceGrid{grid-template-columns:1fr 1fr}.wh26-dates{padding:72px 18px}.wh26-footer{padding:62px 18px 90px;grid-template-columns:1fr 1fr;gap:35px}.wh26-footerBrand{grid-column:1/-1}.wh26-footerBottom{display:block}.wh26-footerBottom span{display:block;margin-top:5px}.wh26-mobileNav{position:fixed;z-index:88;left:0;right:0;bottom:0;height:64px;background:rgba(255,253,252,.96);border-top:1px solid var(--line);display:grid;grid-template-columns:repeat(4,1fr);backdrop-filter:blur(18px)}.wh26-mobileNav a,.wh26-mobileNav button{border:0;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:9px}.wh26-mobileNav svg{width:17px;height:17px}}
      @media(max-width:430px){.wh26-peopleGrid{grid-template-columns:1fr 1fr}.wh26-personCard{min-height:205px}.wh26-paletteGrid{grid-template-columns:1fr 1fr}.wh26-serviceGrid{grid-template-columns:1fr}.wh26-lifeGrid figure,.wh26-lifeGrid figure:nth-child(2),.wh26-lifeGrid figure:nth-child(3){height:270px}}
    `}</style>
  </main>;
}

function FinderQuestion({ number, title, values, value, onChoose }: { number: string; title: string; values: readonly string[]; value: string | null; onChoose: (value: string) => void }) {
  return <div className="wh26-question"><small>{number} / 04</small><h3>{title}</h3><div className="wh26-options">{values.map((option) => <button key={option} className={value === option ? "active" : ""} onClick={() => onChoose(option)}>{option}</button>)}</div></div>;
}

function ProductCard({ product, label }: { product: Product; label?: string }) {
  return <article className="wh26-productCard"><Link href={`/product/${product.slug}`}><div className="wh26-productImage"><img src={productImage(product)} alt={`${product.subtitle} — WINK`}/>{label && <span className="wh26-productLabel">{label}</span>}</div><div className="wh26-productMeta"><div><small>{product.name}</small><h3>{product.subtitle}</h3></div><strong>{money(product.base_price_minor)}</strong></div></Link></article>;
}

function MoodCard({ title, caption, image }: { title: string; caption: string; image: string }) {
  return <article className="wh26-mood"><img src={image} alt={`${title} — ${caption}`}/><div><h3>{title}</h3><span>{caption}</span></div></article>;
}

function EditorialSection({ eyebrow, title, text, image, href, cta }: { eyebrow: string; title: React.ReactNode; text: string; image: string; href: string; cta: string }) {
  return <section className="wh26-editorial"><div className="wh26-editorialImage"><img src={image} alt={eyebrow}/></div><div className="wh26-editorialCopy"><p>{eyebrow}</p><h2>{title}</h2><span>{text}</span><Link className="wh26-primary" href={href}>{cta}</Link></div></section>;
}

function AddonCard({ title, note, image }: { title: string; note: string; image: string }) {
  return <article className="wh26-addon"><div className="wh26-addonImage"><img src={image} alt={title}/></div><div><h3>{title}</h3><span>{note}</span></div></article>;
}
