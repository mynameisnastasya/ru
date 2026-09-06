"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Occasion = "Birthday" | "Love" | "Date" | "Baby" | "Just because";
type Recipient = "Она" | "Он" | "Ребёнок" | "Мама" | "Подруга" | "Пара";
type Mood = "Blush" | "Chrome" | "Vanilla" | "Cherry" | "Baby Blue" | "Black Tie";
type Budget = "до 5 000 ₽" | "5–8 000 ₽" | "8–12 000 ₽" | "12 000 ₽+";
type Tier = "Cute" | "Perfect" | "WOW";

type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  tag?: string;
  moods: Mood[];
  occasions: Occasion[];
  recipients: Recipient[];
  tier: Tier;
  supportsNumber?: boolean;
  numberIncluded?: boolean;
};

type LineConfig = { palette: Mood; number?: string; addons: string[] };
type CartItem = { lineId: string; productId: string; name: string; subtitle: string; unitPrice: number; image: string; qty: number; config: LineConfig };

const IMAGES = {
  hero: "https://images.pexels.com/photos/30277077/pexels-photo-30277077.jpeg?auto=compress&cs=tinysrgb&w=1800",
  pink: "https://images.pexels.com/photos/31840152/pexels-photo-31840152.jpeg?auto=compress&cs=tinysrgb&w=1400",
  number: "https://images.pexels.com/photos/31840097/pexels-photo-31840097.jpeg?auto=compress&cs=tinysrgb&w=1400",
  flowers: "https://images.pexels.com/photos/30277270/pexels-photo-30277270.jpeg?auto=compress&cs=tinysrgb&w=1400",
  portrait: "https://images.pexels.com/photos/30277237/pexels-photo-30277237.jpeg?auto=compress&cs=tinysrgb&w=1400",
  night: "https://images.pexels.com/photos/31840156/pexels-photo-31840156.jpeg?auto=compress&cs=tinysrgb&w=1400",
};

const MOODS: { name: Mood; note: string; colors: string[] }[] = [
  { name: "Blush", note: "soft, romantic", colors: ["#f1d9dc", "#f8eeee", "#d6bfc2"] },
  { name: "Chrome", note: "clean, expensive", colors: ["#d8d8d6", "#868884", "#f1f0ec"] },
  { name: "Vanilla", note: "quiet luxury", colors: ["#eee7d8", "#faf8f2", "#cfc4b1"] },
  { name: "Cherry", note: "bold, flirty", colors: ["#8f2332", "#cf6a78", "#f2d8db"] },
  { name: "Baby Blue", note: "fresh, playful", colors: ["#d7e4eb", "#f8faf9", "#9fb8c7"] },
  { name: "Black Tie", note: "night, dramatic", colors: ["#171719", "#57575c", "#dedbd3"] },
];

const PRODUCTS: Product[] = [
  { id: "wink10", name: "WINK 10", subtitle: "10 helium balloons", price: 3990, image: IMAGES.portrait, tag: "Easy gift", moods: ["Blush", "Vanilla", "Baby Blue", "Chrome"], occasions: ["Birthday", "Love", "Date", "Baby", "Just because"], recipients: ["Она", "Он", "Ребёнок", "Мама", "Подруга", "Пара"], tier: "Cute", supportsNumber: true },
  { id: "blush15", name: "BLUSH 15", subtitle: "15 helium balloons", price: 5490, image: IMAGES.hero, tag: "Bestseller", moods: ["Blush", "Vanilla", "Cherry"], occasions: ["Birthday", "Love", "Date", "Just because"], recipients: ["Она", "Мама", "Подруга", "Пара"], tier: "Cute", supportsNumber: true },
  { id: "hearts", name: "HEARTS", subtitle: "7 foil hearts + ribbons", price: 6490, image: IMAGES.pink, moods: ["Blush", "Cherry", "Chrome"], occasions: ["Love", "Date", "Birthday", "Just because"], recipients: ["Она", "Мама", "Подруга", "Пара"], tier: "Perfect" },
  { id: "cloud", name: "CLOUD", subtitle: "25 soft balloons", price: 6990, image: IMAGES.portrait, moods: ["Vanilla", "Blush", "Baby Blue"], occasions: ["Birthday", "Baby", "Just because"], recipients: ["Она", "Ребёнок", "Мама", "Подруга"], tier: "Perfect", supportsNumber: true },
  { id: "kids", name: "KIDS POP", subtitle: "bright birthday set + foil accent", price: 7490, image: IMAGES.number, moods: ["Baby Blue", "Cherry", "Vanilla"], occasions: ["Birthday"], recipients: ["Ребёнок"], tier: "Perfect", supportsNumber: true },
  { id: "number", name: "NUMBER SET", subtitle: "2 numbers + 15 balloons", price: 8490, image: IMAGES.number, tag: "Birthday icon", moods: ["Chrome", "Blush", "Vanilla", "Baby Blue", "Black Tie"], occasions: ["Birthday"], recipients: ["Она", "Он", "Ребёнок", "Мама", "Подруга", "Пара"], tier: "Perfect", supportsNumber: true, numberIncluded: true },
  { id: "love", name: "LOVE LETTER", subtitle: "hearts + handwritten card + photo", price: 7990, image: IMAGES.pink, moods: ["Blush", "Cherry", "Chrome"], occasions: ["Love", "Date", "Just because"], recipients: ["Она", "Он", "Пара"], tier: "Perfect" },
  { id: "silver", name: "SILVER NIGHT", subtitle: "chrome + hearts + numbers", price: 10900, image: IMAGES.night, moods: ["Chrome", "Black Tie"], occasions: ["Birthday", "Love", "Date"], recipients: ["Она", "Он", "Подруга", "Пара"], tier: "WOW", supportsNumber: true, numberIncluded: true },
  { id: "room", name: "ROOM", subtitle: "full room birthday moment", price: 13900, image: IMAGES.flowers, tag: "WOW", moods: ["Blush", "Chrome", "Vanilla", "Cherry", "Baby Blue", "Black Tie"], occasions: ["Birthday", "Love", "Date", "Baby"], recipients: ["Она", "Он", "Ребёнок", "Мама", "Подруга", "Пара"], tier: "WOW", supportsNumber: true },
];

const FOR_WHOM: Recipient[] = ["Она", "Он", "Ребёнок", "Мама", "Подруга", "Пара"];
const OCCASIONS: Occasion[] = ["Birthday", "Love", "Date", "Baby", "Just because"];
const BUDGETS: Budget[] = ["до 5 000 ₽", "5–8 000 ₽", "8–12 000 ₽", "12 000 ₽+"];
const ADDONS = [
  { id: "card", label: "Handwritten card", price: 390 },
  { id: "photo", label: "Printed photo", price: 490 },
  { id: "heart", label: "Extra heart balloon", price: 790 },
  { id: "extra", label: "+5 balloons", price: 1490 },
  { id: "bunny", label: "WINK bunny", price: 5990 },
] as const;
const BASE_PRICES: Record<number, number> = { 10: 3990, 15: 4990, 25: 6990, 40: 9990 };
const NUMBER_ADDON_PRICE = 1990;
const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

function localDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function budgetRange(budget: Budget | null) {
  if (budget === "до 5 000 ₽") return { min: 0, max: 5000, target: 4300 };
  if (budget === "5–8 000 ₽") return { min: 5000, max: 8000, target: 6800 };
  if (budget === "8–12 000 ₽") return { min: 8000, max: 12000, target: 9800 };
  if (budget === "12 000 ₽+") return { min: 12000, max: 20000, target: 14000 };
  return { min: 0, max: 20000, target: 8000 };
}

function productScore(product: Product, occasion: Occasion | null, recipient: Recipient | null, mood: Mood | null, numberValue: string) {
  let score = 0;
  if (occasion && product.occasions.includes(occasion)) score += 8;
  if (recipient && product.recipients.includes(recipient)) score += 5;
  if (mood && product.moods.includes(mood)) score += 6;
  if (numberValue && product.supportsNumber) score += 3;
  return score;
}

export default function WinkExperience() {
  const [finderStep, setFinderStep] = useState(0);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [birthdayNumber, setBirthdayNumber] = useState("");
  const [finderMood, setFinderMood] = useState<Mood | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [shopMood, setShopMood] = useState<Mood | null>(null);
  const [builderMood, setBuilderMood] = useState<Mood>("Blush");
  const [baseCount, setBaseCount] = useState(15);
  const [builderNumberOn, setBuilderNumberOn] = useState(false);
  const [builderNumber, setBuilderNumber] = useState("");
  const [builderAddons, setBuilderAddons] = useState<string[]>([]);
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [configMood, setConfigMood] = useState<Mood>("Blush");
  const [configNumber, setConfigNumber] = useState("");
  const [configAddons, setConfigAddons] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [giftForSomeone, setGiftForSomeone] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [noCall, setNoCall] = useState(true);
  const [deliveryMode, setDeliveryMode] = useState<"today" | "tomorrow" | "date">("tomorrow");
  const [deliveryDate, setDeliveryDate] = useState(() => localDate(1));
  const [deliverySlot, setDeliverySlot] = useState("12:00–15:00");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderReady, setOrderReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("wink-gift");
      if (saved) setCart(JSON.parse(saved) as CartItem[]);
    } catch {}
    setCartHydrated(true);
  }, []);
  useEffect(() => { if (cartHydrated) window.localStorage.setItem("wink-gift", JSON.stringify(cart)); }, [cart, cartHydrated]);
  useEffect(() => {
    document.body.style.overflow = cartOpen || configProduct ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, configProduct]);

  const finderReady = Boolean(occasion && recipient && finderMood && budget);
  const recommendations = useMemo(() => {
    if (!finderReady) return [];
    const range = budgetRange(budget);
    const ranked = PRODUCTS.map((product) => ({ product, score: productScore(product, occasion, recipient, finderMood, birthdayNumber), budgetDistance: product.price < range.min ? range.min - product.price : product.price > range.max ? product.price - range.max : 0, targetDistance: Math.abs(product.price - range.target) })).sort((a, b) => b.score - a.score || a.budgetDistance - b.budgetDistance || a.targetDistance - b.targetDistance);
    const pick = (tier: Tier, used: Set<string>) => {
      const pool = ranked.filter((item) => item.product.tier === tier && !used.has(item.product.id));
      const chosen = pool[0] ?? ranked.find((item) => !used.has(item.product.id));
      if (chosen) used.add(chosen.product.id);
      return chosen?.product;
    };
    const used = new Set<string>();
    return [pick("Cute", used), pick("Perfect", used), pick("WOW", used)].filter(Boolean) as Product[];
  }, [finderReady, occasion, recipient, finderMood, budget, birthdayNumber]);

  const shopProducts = useMemo(() => !shopMood ? PRODUCTS : [...PRODUCTS].sort((a, b) => Number(b.moods.includes(shopMood)) - Number(a.moods.includes(shopMood))), [shopMood]);
  const builderPrice = useMemo(() => BASE_PRICES[baseCount] + (builderNumberOn ? NUMBER_ADDON_PRICE : 0) + ADDONS.filter((item) => builderAddons.includes(item.id)).reduce((sum, item) => sum + item.price, 0), [baseCount, builderNumberOn, builderAddons]);
  const configPrice = useMemo(() => !configProduct ? 0 : configProduct.price + ADDONS.filter((item) => configAddons.includes(item.id)).reduce((sum, item) => sum + item.price, 0) + (configProduct.supportsNumber && configNumber && !configProduct.numberIncluded ? NUMBER_ADDON_PRICE : 0), [configProduct, configAddons, configNumber]);
  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const orderText = useMemo(() => {
    const items = cart.map((item) => {
      const details = [item.config.palette, item.config.number ? `number ${item.config.number}` : "", ...item.config.addons.map((id) => ADDONS.find((a) => a.id === id)?.label ?? id)].filter(Boolean).join(" · ");
      return `${item.qty}× ${item.name} — ${money(item.unitPrice * item.qty)}\n${details}`;
    }).join("\n\n");
    const delivery = deliveryMode === "today" ? localDate(0) : deliveryMode === "tomorrow" ? localDate(1) : deliveryDate;
    return ["WINK — draft order", "", items, "", `Total before delivery: ${money(cartTotal)}`, `Delivery: ${delivery} · ${deliverySlot}`, `Address: ${address}`, giftForSomeone ? `Recipient: ${recipientName} · ${recipientPhone}` : "Recipient: buyer", giftForSomeone ? `From: ${anonymous ? "anonymous" : senderName || customerName}` : "", giftForSomeone && message ? `Message: ${message}` : "", giftForSomeone && noCall ? "Do not call recipient before arrival" : "", `Buyer: ${customerName} · ${customerPhone}`].filter(Boolean).join("\n");
  }, [cart, cartTotal, deliveryMode, deliveryDate, deliverySlot, address, giftForSomeone, recipientName, recipientPhone, anonymous, senderName, customerName, message, noCall, customerPhone]);

  function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function restartFinder(prefill?: { occasion?: Occasion; recipient?: Recipient }) {
    setOccasion(prefill?.occasion ?? null); setRecipient(prefill?.recipient ?? null); setBirthdayNumber(""); setFinderMood(null); setBudget(null); setFinderStep(prefill?.occasion ? (prefill.recipient ? 2 : 1) : 0); requestAnimationFrame(() => scrollTo("finder"));
  }
  function selectOccasion(value: Occasion) { setOccasion(value); if (value !== "Birthday") setBirthdayNumber(""); setFinderStep(1); }
  function selectRecipient(value: Recipient) { setRecipient(value); setFinderStep(occasion === "Birthday" ? 2 : 3); }
  function selectFinderMood(value: Mood) { setFinderMood(value); setFinderStep(4); }
  function openProduct(product: Product) {
    const preferredMood = finderMood && product.moods.includes(finderMood) ? finderMood : shopMood && product.moods.includes(shopMood) ? shopMood : product.moods[0];
    setConfigProduct(product); setConfigMood(preferredMood); setConfigNumber(product.supportsNumber && birthdayNumber ? birthdayNumber : ""); setConfigAddons([]);
  }
  function addConfiguredProduct() {
    if (!configProduct || (configProduct.numberIncluded && !configNumber)) return;
    setCart((current) => [...current, { lineId: `${configProduct.id}-${Date.now()}`, productId: configProduct.id, name: configProduct.name, subtitle: configProduct.subtitle, unitPrice: configPrice, image: configProduct.image, qty: 1, config: { palette: configMood, number: configNumber || undefined, addons: configAddons } }]);
    setConfigProduct(null); setCheckoutStep(0); setOrderReady(false); setCartOpen(true);
  }
  function addBuilderGift() {
    if (builderNumberOn && !builderNumber) return;
    setCart((current) => [...current, { lineId: `custom-${Date.now()}`, productId: "custom", name: `WINK ${baseCount}${builderNumberOn ? ` + ${builderNumber}` : ""}`, subtitle: `${baseCount} balloons · custom gift`, unitPrice: builderPrice, image: IMAGES.hero, qty: 1, config: { palette: builderMood, number: builderNumberOn ? builderNumber : undefined, addons: builderAddons } }]);
    setCheckoutStep(0); setOrderReady(false); setCartOpen(true);
  }
  function updateQty(lineId: string, delta: number) { setCart((current) => current.flatMap((item) => item.lineId !== lineId ? [item] : item.qty + delta > 0 ? [{ ...item, qty: item.qty + delta }] : [])); }
  function toggleId(id: string, selected: string[], setter: (value: string[]) => void) { setter(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]); }
  function setDelivery(value: "today" | "tomorrow" | "date") { setDeliveryMode(value); if (value === "today") setDeliveryDate(localDate(0)); if (value === "tomorrow") setDeliveryDate(localDate(1)); }
  function checkoutGiftValid() { return !giftForSomeone || (recipientName.trim().length > 1 && recipientPhone.trim().length > 5); }
  function checkoutDeliveryValid() { return address.trim().length > 4 && Boolean(deliveryDate) && Boolean(deliverySlot); }
  function submitOrder(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!customerName.trim() || customerPhone.trim().length < 6) return; setOrderReady(true); }
  async function copyOrder() { try { await navigator.clipboard.writeText(orderText); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } }

  const currentQuestion = finderStep === 0 ? "occasion" : finderStep === 1 ? "recipient" : finderStep === 2 ? "birthday" : finderStep === 3 ? "mood" : finderStep === 4 ? "budget" : "result";

  return <main>
    <header className="site-header">
      <button className="brand" onClick={() => scrollTo("top")} aria-label="WINK — наверх">WINK<span>.</span></button>
      <nav className="desktop-nav" aria-label="Основная навигация"><button onClick={() => scrollTo("shop")}>Shop</button><button onClick={() => scrollTo("builder")}>Build your gift</button><button onClick={() => restartFinder({ occasion: "Birthday" })}>Birthdays</button><button onClick={() => restartFinder({ occasion: "Love" })}>Love</button><button onClick={() => restartFinder({ occasion: "Birthday", recipient: "Ребёнок" })}>Kids</button><button onClick={() => scrollTo("wow")}>WOW</button></nav>
      <button className="gift-bag" onClick={() => { setCheckoutStep(0); setCartOpen(true); }}>Gift <span>{cartCount}</span></button>
    </header>

    <section className="hero" id="top"><img src={IMAGES.hero} alt="Праздничная композиция WINK" className="hero-image"/><div className="hero-scrim"/><div className="hero-kicker">Premium gifting studio · delivery by request</div><div className="hero-copy"><p className="eyebrow">WINK — gifts that make a moment</p><h1>Подарок, который невозможно <em>не сфотографировать.</em></h1><p className="hero-note">Скажи, что празднуем. WINK сократит выбор до трёх подарков, которые реально подходят человеку и бюджету.</p><div className="hero-actions"><button className="button button-light" onClick={() => restartFinder()}>Найти подарок</button><button className="button button-ghost" onClick={() => scrollTo("builder")}>Собрать свой</button></div></div><button className="scroll-cue" onClick={() => restartFinder()} aria-label="Перейти к подбору">↓</button></section>

    <section className="finder section" id="finder"><div className="section-head finder-head"><p className="eyebrow">WINK gift concierge</p><h2>Не листай сотню шаров. <em>Ответь WINK.</em></h2><p>Один вопрос за раз. Результат появляется только после осмысленных ответов — не декоративный фильтр.</p></div>
      <div className="concierge-shell"><div className="concierge-progress" aria-label="Прогресс подбора">{[0,1,2,3,4].map((step) => <i key={step} className={finderStep >= step ? "done" : ""}/>)}</div><div className="concierge-topline"><span>{finderStep < 5 ? `0${Math.min(finderStep + 1, 5)} / 05` : "MATCHED"}</span>{finderStep > 0 && <button onClick={() => setFinderStep((step) => Math.max(0, step - 1))}>← Назад</button>}</div>
        {currentQuestion === "occasion" && <div className="concierge-question"><p>What are we celebrating?</p><h3>Что случилось?</h3><div className="concierge-options">{OCCASIONS.map((item) => <button key={item} onClick={() => selectOccasion(item)}>{item}</button>)}</div></div>}
        {currentQuestion === "recipient" && <div className="concierge-question"><p>{occasion}</p><h3>Кому дарим?</h3><div className="concierge-options">{FOR_WHOM.map((item) => <button key={item} onClick={() => selectRecipient(item)}>{item}</button>)}</div></div>}
        {currentQuestion === "birthday" && <div className="concierge-question"><p>Birthday detail</p><h3>Сколько исполняется?</h3><div className="birthday-input-row"><input autoFocus inputMode="numeric" value={birthdayNumber} onChange={(e) => setBirthdayNumber(e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="19" aria-label="Возраст"/><button onClick={() => setFinderStep(3)}>{birthdayNumber ? "Продолжить" : "Не нужны цифры"} →</button></div><small>Если укажешь возраст, WINK поднимет выше композиции с цифрами. Это не обязывает их покупать.</small></div>}
        {currentQuestion === "mood" && <div className="concierge-question"><p>Pick the vibe</p><h3>Как это должно ощущаться?</h3><div className="concierge-moods">{MOODS.map((mood) => <button key={mood.name} onClick={() => selectFinderMood(mood.name)}><span>{mood.colors.map((color) => <i key={color} style={{ background: color }}/>)}</span><b>{mood.name}</b><small>{mood.note}</small></button>)}</div></div>}
        {currentQuestion === "budget" && <div className="concierge-question"><p>Keep it comfortable</p><h3>Какой бюджет норм?</h3><div className="concierge-options budget-options">{BUDGETS.map((item) => <button key={item} onClick={() => { setBudget(item); setFinderStep(5); }}>{item}</button>)}</div><small>Мы можем показать WOW чуть выше бюджета, но всегда подпишем это честно.</small></div>}
        {currentQuestion === "result" && <div className="finder-result concierge-result"><div className="result-intro"><div><p>{recipient} · {occasion}{birthdayNumber ? ` · ${birthdayNumber}` : ""} · {finderMood} · {budget}</p><h3>We found your gift.</h3></div><button className="restart" onClick={() => restartFinder()}>Начать заново</button></div><div className="result-cards">{recommendations.map((product, index) => { const range = budgetRange(budget); const over = Math.max(0, product.price - range.max); return <article className="mini-product" key={product.id}><button className="mini-image-wrap product-button" onClick={() => openProduct(product)}><img src={product.image} alt={product.name}/><span>{["Cute","Perfect","WOW"][index]}</span></button><div className="mini-meta"><div><h4>{product.name}</h4><p>{product.subtitle}</p>{over > 0 && <small className="budget-note">выше бюджета на {money(over)}</small>}</div><strong>{money(product.price)}</strong></div><button onClick={() => openProduct(product)}>Выбрать детали</button></article>; })}</div></div>}
      </div>
    </section>

    <section className="shop section" id="shop"><div className="section-head split-head"><div><p className="eyebrow">Shop / bestsellers</p><h2>Готовые подарки.<br/><em>Настраиваются внутри.</em></h2></div><p>Сначала палитра, цифры и персонализация — потом Add to gift. Никаких потерянных комментариев.</p></div>{shopMood && <div className="shop-filter"><span>Сначала показываем настроение <b>{shopMood}</b></span><button onClick={() => setShopMood(null)}>Show all</button></div>}<div className="product-grid">{shopProducts.map((product) => <article className="product-card" key={product.id}><button className="product-image-wrap product-button" onClick={() => openProduct(product)}><img src={product.image} alt={product.name}/>{product.tag && <span className="product-tag">{product.tag}</span>}<span className="quick-add">→</span></button><button className="product-line product-button" onClick={() => openProduct(product)}><div><h3>{product.name}</h3><p>{product.subtitle}</p></div><strong>{money(product.price)}</strong></button></article>)}</div></section>

    <section className="moods section"><div className="section-head"><p className="eyebrow">Choose your mood</p><h2>Не цвет. <em>Настроение.</em></h2><p>Выбор здесь влияет на Shop: нужная эстетика поднимается наверх.</p></div><div className="mood-grid">{MOODS.map((mood) => <button key={mood.name} className={shopMood === mood.name ? "mood-card active" : "mood-card"} onClick={() => { setShopMood(mood.name); setTimeout(() => scrollTo("shop"), 50); }}><span className="mood-orbs">{mood.colors.map((color,i) => <i key={color} style={{ background: color, left: `${16+i*25}%`, top: `${16+(i%2)*25}%` }}/>)}</span><span className="mood-copy"><b>{mood.name}</b><small>{mood.note}</small></span></button>)}</div></section>

    <section className="builder section" id="builder"><div className="builder-visual"><img src={IMAGES.pink} alt="Композиция для конструктора WINK"/><div className="builder-stamp">Made by you<br/>finished by WINK</div></div><div className="builder-panel"><p className="eyebrow">Build your gift</p><h2>Собери его <em>под человека.</em></h2><div className="build-group"><div className="build-label"><span>01</span><b>Base</b></div><div className="segmented four">{[10,15,25,40].map((count) => <button key={count} className={baseCount === count ? "active" : ""} onClick={() => setBaseCount(count)}>{count} balloons</button>)}</div></div><div className="build-group"><div className="build-label"><span>02</span><b>Palette</b></div><div className="palette-row">{MOODS.map((mood) => <button key={mood.name} className={builderMood === mood.name ? "palette active" : "palette"} onClick={() => setBuilderMood(mood.name)} aria-label={mood.name}><i style={{ background: mood.colors[0] }}/></button>)}</div><p className="selected-note">{builderMood}</p></div><div className="build-group"><div className="build-label"><span>03</span><b>Your number</b></div><div className="number-row"><button className={builderNumberOn ? "toggle active" : "toggle"} onClick={() => setBuilderNumberOn((value) => !value)}><i/>{builderNumberOn ? "Numbers on" : "Without numbers"}</button>{builderNumberOn && <input value={builderNumber} onChange={(e) => setBuilderNumber(e.target.value.replace(/\D/g, "").slice(0,2))} placeholder="19" aria-label="Возраст или число"/>}</div>{builderNumberOn && !builderNumber && <small className="field-error">Укажи число — иначе мы не знаем, какие цифры класть.</small>}</div><div className="build-group"><div className="build-label"><span>04</span><b>Make it personal</b></div><div className="addon-list">{ADDONS.map((addon) => <button key={addon.id} className={builderAddons.includes(addon.id) ? "addon active" : "addon"} onClick={() => toggleId(addon.id,builderAddons,setBuilderAddons)}><span>{addon.label}</span><b>+{money(addon.price)}</b></button>)}</div></div><div className="builder-summary"><span>{baseCount} balloons · {builderMood}{builderNumberOn && builderNumber ? ` · ${builderNumber}` : ""}</span><small>{builderAddons.length ? `${builderAddons.length} personal add-on${builderAddons.length > 1 ? "s" : ""}` : "no extras yet"}</small></div><button className="builder-add" disabled={builderNumberOn && !builderNumber} onClick={addBuilderGift}><span>Add to gift</span><strong>{money(builderPrice)}</strong></button></div></section>

    <section className="wow section" id="wow"><div className="wow-copy"><p className="eyebrow">WINK / WOW</p><h2>When balloons are <em>not enough.</em></h2><p>Оформление комнаты, oversized-композиции, цветы, персональные фотографии и WINK bunny.</p><button className="text-link" onClick={() => openProduct(PRODUCTS.find((p) => p.id === "room")!)}>Configure ROOM ↗</button></div><div className="wow-gallery"><figure className="wow-main"><img src={IMAGES.flowers} alt="WOW подарок WINK"/><figcaption>ROOM / from {money(13900)}</figcaption></figure><figure className="wow-small"><img src={IMAGES.number} alt="Композиция WINK с цифрами"/><figcaption>NUMBER MOMENT</figcaption></figure></div></section>

    <section className="moments section"><div className="section-head split-head"><div><p className="eyebrow">Real WINK moments</p><h2>Made to be <em>remembered.</em></h2></div><p>Живые кадры объясняют масштаб и эмоцию быстрее любого блока «почему мы».</p></div><div className="moments-grid">{[IMAGES.hero,IMAGES.number,IMAGES.pink,IMAGES.portrait].map((image,index) => <figure key={`${image}-${index}`}><img src={image} alt={`WINK moment ${index+1}`}/><figcaption><span>{["19th birthday","best friend / 21","just because","birthday night"][index]}</span><b>{["08:10","11:40","19:20","22:05"][index]}</b></figcaption></figure>)}</div></section>

    <section className="delivery section" id="delivery"><div className="delivery-intro"><p className="eyebrow">How it works</p><h2>Choose → Personalize → <em>We deliver the moment.</em></h2></div><div className="steps"><article><span>01</span><h3>Choose</h3><p>Консьерж для сомневающихся. Shop и Builder — если направление уже понятно.</p></article><article><span>02</span><h3>Personalize</h3><p>Палитра, цифры, открытка и фото сохраняются внутри позиции.</p></article><article><span>03</span><h3>Deliver</h3><p>Получатель, покупатель, сюрприз и доставка разведены на отдельные шаги.</p></article></div><div className="faq-grid"><details><summary>Можно привезти сюрпризом?</summary><p>Да. В checkout есть «не звонить получателю заранее» и анонимный отправитель.</p></details><details><summary>Как выбрать цифры?</summary><p>В карточке NUMBER SET или конструкторе. Обязательные цифры валидируются до корзины.</p></details><details><summary>Можно выбрать своё время?</summary><p>Можно запросить сегодня, завтра или конкретную дату и выбрать слот. Финальная доступность подтверждается до оплаты.</p></details><details><summary>Корзина пропадёт после обновления?</summary><p>Нет. Черновик подарка сохраняется на этом устройстве.</p></details></div></section>

    <section className="closing section"><p className="eyebrow">Need a gift soon?</p><h2>Don’t overthink it.<br/><em>Make a WINK.</em></h2><button className="button button-dark" onClick={() => restartFinder()}>Find my gift</button></section>
    <footer><div className="footer-brand">WINK<span>.</span></div><div><p>Gifts that make a moment.</p><small>Premium balloon & gifting studio.</small></div><div className="footer-links"><button onClick={() => scrollTo("shop")}>Shop</button><button onClick={() => scrollTo("delivery")}>Delivery & FAQ</button><button onClick={() => scrollTo("builder")}>Build your gift</button></div><div className="footer-end"><small>Instagram · Telegram</small><small>© 2026 WINK</small></div></footer>
    <button className="mobile-cta" onClick={() => restartFinder()}>Найти подарок <span>→</span></button>

    {configProduct && <div className="drawer-layer" role="dialog" aria-modal="true" aria-label={`Настройка ${configProduct.name}`}><button className="drawer-backdrop" onClick={() => setConfigProduct(null)} aria-label="Закрыть карточку"/><aside className="drawer product-drawer"><div className="drawer-head"><div><p className="eyebrow">Configure your gift</p><h2>{configProduct.name}</h2></div><button onClick={() => setConfigProduct(null)}>×</button></div><img className="config-hero" src={configProduct.image} alt={configProduct.name}/><div className="config-copy"><p>{configProduct.subtitle}</p><strong>from {money(configProduct.price)}</strong></div><div className="config-group"><div className="config-label"><b>Choose your palette</b><span>{configMood}</span></div><div className="config-moods">{configProduct.moods.map((moodName) => { const mood = MOODS.find((item) => item.name === moodName)!; return <button key={mood.name} className={configMood === mood.name ? "active" : ""} onClick={() => setConfigMood(mood.name)}><span>{mood.colors.map((color) => <i key={color} style={{ background: color }}/>)}</span><small>{mood.name}</small></button>; })}</div></div>{configProduct.supportsNumber && <div className="config-group"><div className="config-label"><b>Your number</b><span>{configProduct.numberIncluded ? "included" : `+${money(NUMBER_ADDON_PRICE)}`}</span></div><div className="number-row"><input value={configNumber} onChange={(e) => setConfigNumber(e.target.value.replace(/\D/g, "").slice(0,2))} placeholder={configProduct.numberIncluded ? "19" : "optional"} aria-label="Цифры"/></div>{configProduct.numberIncluded && !configNumber && <small className="field-error">Для этого сета нужно указать цифры.</small>}</div>}<div className="config-group"><div className="config-label"><b>Make it personal</b><span>optional</span></div><div className="addon-list">{ADDONS.map((addon) => <button key={addon.id} className={configAddons.includes(addon.id) ? "addon active" : "addon"} onClick={() => toggleId(addon.id,configAddons,setConfigAddons)}><span>{addon.label}</span><b>+{money(addon.price)}</b></button>)}</div></div><button className="builder-add config-add" disabled={Boolean(configProduct.numberIncluded && !configNumber)} onClick={addConfiguredProduct}><span>Add to gift</span><strong>{money(configPrice)}</strong></button></aside></div>}

    {cartOpen && <div className="drawer-layer" role="dialog" aria-modal="true" aria-label="Gift checkout"><button className="drawer-backdrop" onClick={() => setCartOpen(false)} aria-label="Закрыть корзину"/><aside className="drawer checkout-drawer"><div className="drawer-head"><div><p className="eyebrow">Your gift</p><h2>{cartCount ? `${cartCount} piece${cartCount > 1 ? "s" : ""}` : "Empty for now"}</h2></div><button onClick={() => setCartOpen(false)}>×</button></div>{cart.length === 0 ? <div className="empty-gift"><p>Сюда складывается готовый подарок, а не случайные SKU.</p><button onClick={() => { setCartOpen(false); restartFinder(); }}>Find a gift</button></div> : <><div className="checkout-progress"><button className={checkoutStep === 0 ? "active" : ""} onClick={() => setCheckoutStep(0)}>Gift</button><button className={checkoutStep === 1 ? "active" : ""} onClick={() => setCheckoutStep(1)}>Recipient</button><button className={checkoutStep === 2 ? "active" : ""} onClick={() => setCheckoutStep(2)} disabled={!checkoutGiftValid()}>Delivery</button><button className={checkoutStep === 3 ? "active" : ""} onClick={() => setCheckoutStep(3)} disabled={!checkoutDeliveryValid()}>Review</button></div>
      {checkoutStep === 0 && <div className="checkout-panel"><div className="cart-items">{cart.map((item) => <div className="cart-item rich" key={item.lineId}><img src={item.image} alt=""/><div><b>{item.name}</b><small>{item.config.palette}{item.config.number ? ` · ${item.config.number}` : ""}</small><small>{item.config.addons.map((id) => ADDONS.find((a) => a.id === id)?.label).filter(Boolean).join(" · ") || "No extras"}</small><div className="qty"><button onClick={() => updateQty(item.lineId,-1)} aria-label="Уменьшить">−</button><span>{item.qty}</span><button onClick={() => updateQty(item.lineId,1)} aria-label="Увеличить">+</button></div></div><strong>{money(item.unitPrice*item.qty)}</strong></div>)}</div><div className="checkout-total"><span>Total before delivery</span><strong>{money(cartTotal)}</strong></div><button className="checkout-button" onClick={() => setCheckoutStep(1)}>Оформить подарок →</button></div>}
      {checkoutStep === 1 && <div className="checkout-panel gift-form"><div className="gift-question"><b>Is this a gift?</b><div className="two-buttons"><button type="button" className={giftForSomeone ? "active" : ""} onClick={() => setGiftForSomeone(true)}>Yes, for someone else</button><button type="button" className={!giftForSomeone ? "active" : ""} onClick={() => setGiftForSomeone(false)}>No, for me</button></div></div>{giftForSomeone && <><div className="form-grid"><label>Recipient name<input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Имя"/></label><label>Recipient phone<input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} inputMode="tel" placeholder="+7 ..."/></label></div><label>Who is it from?<input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Ваше имя" disabled={anonymous}/></label><label className="check"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)}/> Keep me anonymous</label><label className="check"><input type="checkbox" checked={noCall} onChange={(e) => setNoCall(e.target.checked)}/> Don’t call the recipient before arrival</label><label>Message<textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Что написать на открытке?" rows={3}/></label></>}<button className="checkout-button" disabled={!checkoutGiftValid()} onClick={() => setCheckoutStep(2)}>К доставке →</button></div>}
      {checkoutStep === 2 && <div className="checkout-panel gift-form"><div className="gift-question"><b>When should we arrive?</b><div className="three-buttons"><button type="button" className={deliveryMode === "today" ? "active" : ""} onClick={() => setDelivery("today")}>Запросить сегодня</button><button type="button" className={deliveryMode === "tomorrow" ? "active" : ""} onClick={() => setDelivery("tomorrow")}>Завтра</button><button type="button" className={deliveryMode === "date" ? "active" : ""} onClick={() => setDelivery("date")}>Дата</button></div></div>{deliveryMode === "date" && <label>Date<input type="date" min={localDate(0)} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}/></label>}<label>Preferred slot<select value={deliverySlot} onChange={(e) => setDeliverySlot(e.target.value)}><option>09:00–12:00</option><option>12:00–15:00</option><option>15:00–18:00</option><option>18:00–21:00</option><option>Точное время — запрос</option></select></label><label>Delivery address<input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Улица, дом, квартира / отель"/></label><p className="checkout-note">«Сегодня» и точное время — запрос. WINK подтверждает доступность слота и стоимость доставки до оплаты.</p><button className="checkout-button" disabled={!checkoutDeliveryValid()} onClick={() => setCheckoutStep(3)}>Проверить заказ →</button></div>}
      {checkoutStep === 3 && <form className="checkout-panel gift-form" onSubmit={submitOrder}><div className="review-card"><span>Gift</span><b>{cartCount} шт. · {money(cartTotal)}</b><button type="button" onClick={() => setCheckoutStep(0)}>Edit</button></div><div className="review-card"><span>Recipient</span><b>{giftForSomeone ? `${recipientName}${anonymous ? " · anonymous" : ""}` : "For me"}</b><button type="button" onClick={() => setCheckoutStep(1)}>Edit</button></div><div className="review-card"><span>Delivery</span><b>{deliveryMode === "today" ? "Сегодня — запрос" : deliveryMode === "tomorrow" ? "Завтра" : deliveryDate} · {deliverySlot}</b><button type="button" onClick={() => setCheckoutStep(2)}>Edit</button></div><div className="form-grid"><label>Your name<input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="Имя покупателя"/></label><label>Your phone<input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required inputMode="tel" placeholder="+7 ..."/></label></div><div className="checkout-total"><span>Total before delivery</span><strong>{money(cartTotal)}</strong></div><button className="checkout-button" type="submit">Собрать заявку</button><p className="checkout-note">Сайт не притворяется, что оплатил заказ. После подключения CRM и эквайринга кнопка станет реальной отправкой + оплатой.</p>{orderReady && <div className="order-ready final"><b>Черновик заказа готов.</b><p>Все данные собраны: позиции, палитры, цифры, получатель, сюрприз, дата и покупатель.</p><button type="button" onClick={copyOrder}>{copied ? "Скопировано ✓" : "Скопировать заказ"}</button></div>}</form>}
    </>}</aside></div>}
  </main>;
}
