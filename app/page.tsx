"use client";

import { FormEvent, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  tag?: string;
  mood: string;
};

type CartItem = Product & { qty: number };

const IMAGES = {
  hero: "https://images.pexels.com/photos/30277077/pexels-photo-30277077.jpeg?auto=compress&cs=tinysrgb&w=1800",
  pink: "https://images.pexels.com/photos/31840152/pexels-photo-31840152.jpeg?auto=compress&cs=tinysrgb&w=1400",
  number: "https://images.pexels.com/photos/31840097/pexels-photo-31840097.jpeg?auto=compress&cs=tinysrgb&w=1400",
  flowers: "https://images.pexels.com/photos/30277270/pexels-photo-30277270.jpeg?auto=compress&cs=tinysrgb&w=1400",
  portrait: "https://images.pexels.com/photos/30277237/pexels-photo-30277237.jpeg?auto=compress&cs=tinysrgb&w=1400",
  night: "https://images.pexels.com/photos/31840156/pexels-photo-31840156.jpeg?auto=compress&cs=tinysrgb&w=1400",
};

const PRODUCTS: Product[] = [
  { id: "blush15", name: "BLUSH 15", subtitle: "15 helium balloons", price: 6490, image: IMAGES.hero, tag: "Bestseller", mood: "Soft girl" },
  { id: "hearts", name: "HEARTS", subtitle: "7 foil hearts + ribbons", price: 7490, image: IMAGES.pink, mood: "Pink overload" },
  { id: "number", name: "NUMBER SET", subtitle: "2 numbers + 15 balloons", price: 8990, image: IMAGES.number, tag: "Birthday icon", mood: "Clean & expensive" },
  { id: "room", name: "ROOM", subtitle: "full room birthday moment", price: 13900, image: IMAGES.flowers, tag: "WOW", mood: "Pink overload" },
  { id: "cloud", name: "CLOUD", subtitle: "25 soft white balloons", price: 6990, image: IMAGES.portrait, mood: "Minimal" },
  { id: "silver", name: "SILVER NIGHT", subtitle: "chrome + hearts + numbers", price: 10900, image: IMAGES.night, mood: "Silver night" },
];

const FOR_WHOM = ["Она", "Он", "Ребёнок", "Мама", "Подруга", "Пара"];
const OCCASIONS = ["Birthday", "Date", "Love", "Baby", "Just because"];
const BUDGETS = ["до 5 000 ₽", "5–8 000 ₽", "8–12 000 ₽", "12 000 ₽+"];

const moods = [
  { name: "Blush", note: "soft, romantic", colors: ["#f1d9dc", "#f8eeee", "#d6bfc2"] },
  { name: "Chrome", note: "clean, expensive", colors: ["#d8d8d6", "#868884", "#f1f0ec"] },
  { name: "Vanilla", note: "quiet luxury", colors: ["#eee7d8", "#faf8f2", "#cfc4b1"] },
  { name: "Cherry", note: "bold, flirty", colors: ["#8f2332", "#cf6a78", "#f2d8db"] },
  { name: "Baby Blue", note: "fresh, playful", colors: ["#d7e4eb", "#f8faf9", "#9fb8c7"] },
  { name: "Black Tie", note: "night, dramatic", colors: ["#171719", "#57575c", "#dedbd3"] },
];

const addons = [
  { id: "card", label: "Handwritten card", price: 390 },
  { id: "photo", label: "Printed photo", price: 490 },
  { id: "heart", label: "Extra heart balloon", price: 790 },
  { id: "extra", label: "+5 balloons", price: 1490 },
  { id: "bunny", label: "WINK bunny", price: 5990 },
];

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

export default function Home() {
  const [forWhom, setForWhom] = useState("Подруга");
  const [occasion, setOccasion] = useState("Birthday");
  const [budget, setBudget] = useState("5–8 000 ₽");
  const [activeMood, setActiveMood] = useState("Blush");
  const [baseCount, setBaseCount] = useState(15);
  const [numberGift, setNumberGift] = useState(false);
  const [numberValue, setNumberValue] = useState("19");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["card"]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [giftForSomeone, setGiftForSomeone] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [orderReady, setOrderReady] = useState(false);

  const finderProducts = useMemo(() => {
    let max = Infinity;
    let min = 0;
    if (budget === "до 5 000 ₽") max = 5500;
    if (budget === "5–8 000 ₽") { min = 5000; max = 8500; }
    if (budget === "8–12 000 ₽") { min = 8000; max = 12500; }
    if (budget === "12 000 ₽+") min = 12000;
    const filtered = PRODUCTS.filter((p) => p.price >= min && p.price <= max);
    const source = filtered.length >= 3 ? filtered : [...filtered, ...PRODUCTS.filter((p) => !filtered.includes(p))];
    return source.slice(0, 3);
  }, [budget]);

  const builderPrice = useMemo(() => {
    const base = baseCount === 15 ? 4990 : baseCount === 25 ? 6990 : 9990;
    const numbers = numberGift ? 1990 : 0;
    const extras = addons.filter((item) => selectedAddons.includes(item.id)).reduce((sum, item) => sum + item.price, 0);
    return base + numbers + extras;
  }, [baseCount, numberGift, selectedAddons]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addGift(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...current, { ...product, qty: 1 }];
    });
    setCartOpen(true);
    setOrderReady(false);
  }

  function addBuilderGift() {
    const custom: Product = {
      id: `custom-${Date.now()}`,
      name: `WINK ${baseCount}${numberGift ? ` + ${numberValue}` : ""}`,
      subtitle: `${activeMood} palette · custom gift`,
      price: builderPrice,
      image: IMAGES.hero,
      mood: activeMood,
    };
    setCart((current) => [...current, { ...custom, qty: 1 }]);
    setCartOpen(true);
    setOrderReady(false);
  }

  function toggleAddon(id: string) {
    setSelectedAddons((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderReady(true);
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={() => scrollTo("top")} aria-label="WINK — наверх">WINK<span>.</span></button>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <button onClick={() => scrollTo("shop")}>Shop</button>
          <button onClick={() => scrollTo("builder")}>Build your gift</button>
          <button onClick={() => scrollTo("wow")}>WOW</button>
          <button onClick={() => scrollTo("delivery")}>Delivery</button>
        </nav>
        <button className="gift-bag" onClick={() => setCartOpen(true)}>Gift <span>{cartCount}</span></button>
      </header>

      <section className="hero" id="top">
        <img src={IMAGES.hero} alt="Праздничная композиция WINK с розовыми шарами и цветами" className="hero-image" />
        <div className="hero-scrim" />
        <div className="hero-kicker">Premium gifting studio · same-day moments</div>
        <div className="hero-copy">
          <p className="eyebrow">WINK — gifts that make a moment</p>
          <h1>Подарок, который невозможно <em>не сфотографировать.</em></h1>
          <p className="hero-note">Готовые композиции, персонализация и доставка момента — без двух дней выбора шариков.</p>
          <div className="hero-actions">
            <button className="button button-light" onClick={() => scrollTo("finder")}>Выбрать подарок</button>
            <button className="button button-ghost" onClick={() => scrollTo("builder")}>Собрать свой</button>
          </div>
        </div>
        <button className="scroll-cue" onClick={() => scrollTo("finder")} aria-label="Перейти к подбору">↓</button>
      </section>

      <section className="finder section" id="finder">
        <div className="section-head finder-head">
          <p className="eyebrow">Digital concierge</p>
          <h2>What are we <em>celebrating?</em></h2>
          <p>Три ответа — и мы сокращаем каталог до трёх подарков. Никакой бесконечной ленты.</p>
        </div>
        <div className="finder-grid">
          <div className="finder-step">
            <span>01</span><h3>Для кого?</h3>
            <div className="choice-row">{FOR_WHOM.map((item) => <button key={item} className={forWhom === item ? "choice active" : "choice"} onClick={() => setForWhom(item)}>{item}</button>)}</div>
          </div>
          <div className="finder-step">
            <span>02</span><h3>Повод?</h3>
            <div className="choice-row">{OCCASIONS.map((item) => <button key={item} className={occasion === item ? "choice active" : "choice"} onClick={() => setOccasion(item)}>{item}</button>)}</div>
          </div>
          <div className="finder-step">
            <span>03</span><h3>Бюджет?</h3>
            <div className="choice-row">{BUDGETS.map((item) => <button key={item} className={budget === item ? "choice active" : "choice"} onClick={() => setBudget(item)}>{item}</button>)}</div>
          </div>
        </div>
        <div className="finder-result">
          <div className="result-intro">
            <p>Для: {forWhom} · {occasion}</p>
            <h3>We found your gift.</h3>
          </div>
          <div className="result-cards">
            {finderProducts.map((product, index) => (
              <article className="mini-product" key={product.id}>
                <div className="mini-image-wrap"><img src={product.image} alt={product.name} /><span>{["Cute", "Perfect", "WOW"][index]}</span></div>
                <div className="mini-meta"><div><h4>{product.name}</h4><p>{product.subtitle}</p></div><strong>{money(product.price)}</strong></div>
                <button onClick={() => addGift(product)}>Add to gift</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shop section" id="shop">
        <div className="section-head split-head">
          <div><p className="eyebrow">Bestsellers</p><h2>Six gifts.<br/><em>No wrong choice.</em></h2></div>
          <p>Самые понятные WINK-композиции: достаточно разные по настроению, но без каталога на сто одинаковых SKU.</p>
        </div>
        <div className="product-grid">
          {PRODUCTS.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image-wrap">
                <img src={product.image} alt={product.name} />
                {product.tag && <span className="product-tag">{product.tag}</span>}
                <button className="quick-add" onClick={() => addGift(product)}>+</button>
              </div>
              <div className="product-line"><div><h3>{product.name}</h3><p>{product.subtitle}</p></div><strong>{money(product.price)}</strong></div>
            </article>
          ))}
        </div>
      </section>

      <section className="moods section">
        <div className="section-head">
          <p className="eyebrow">Choose your mood</p>
          <h2>Не цвет. <em>Настроение.</em></h2>
        </div>
        <div className="mood-grid">
          {moods.map((mood) => (
            <button key={mood.name} className={activeMood === mood.name ? "mood-card active" : "mood-card"} onClick={() => setActiveMood(mood.name)}>
              <span className="mood-orbs">{mood.colors.map((color, i) => <i key={color} style={{ background: color, left: `${16 + i * 25}%`, top: `${16 + (i % 2) * 25}%` }} />)}</span>
              <span className="mood-copy"><b>{mood.name}</b><small>{mood.note}</small></span>
            </button>
          ))}
        </div>
      </section>

      <section className="builder section" id="builder">
        <div className="builder-visual">
          <img src={IMAGES.pink} alt="Розовая композиция для конструктора WINK" />
          <div className="builder-stamp">Made by you<br/>finished by WINK</div>
        </div>
        <div className="builder-panel">
          <p className="eyebrow">Build your gift</p>
          <h2>Собери его <em>под человека.</em></h2>
          <div className="build-group"><div className="build-label"><span>01</span><b>Base</b></div><div className="segmented">{[15,25,40].map((count) => <button key={count} className={baseCount === count ? "active" : ""} onClick={() => setBaseCount(count)}>{count} balloons</button>)}</div></div>
          <div className="build-group"><div className="build-label"><span>02</span><b>Palette</b></div><div className="palette-row">{moods.map((mood) => <button key={mood.name} className={activeMood === mood.name ? "palette active" : "palette"} onClick={() => setActiveMood(mood.name)} aria-label={mood.name}><i style={{ background: mood.colors[0] }} /></button>)}</div><p className="selected-note">{activeMood}</p></div>
          <div className="build-group"><div className="build-label"><span>03</span><b>Your number</b></div><div className="number-row"><button className={numberGift ? "toggle active" : "toggle"} onClick={() => setNumberGift(!numberGift)}><i />{numberGift ? "Add numbers" : "Without numbers"}</button>{numberGift && <input value={numberValue} onChange={(e) => setNumberValue(e.target.value.replace(/\D/g, "").slice(0,2))} aria-label="Возраст или число" />}</div></div>
          <div className="build-group"><div className="build-label"><span>04</span><b>Make it personal</b></div><div className="addon-list">{addons.map((addon) => <button key={addon.id} className={selectedAddons.includes(addon.id) ? "addon active" : "addon"} onClick={() => toggleAddon(addon.id)}><span>{addon.label}</span><b>+{money(addon.price)}</b></button>)}</div></div>
          <button className="builder-add" onClick={addBuilderGift}><span>Add to gift</span><strong>{money(builderPrice)}</strong></button>
        </div>
      </section>

      <section className="wow section" id="wow">
        <div className="wow-copy">
          <p className="eyebrow">WINK / WOW</p>
          <h2>When balloons are <em>not enough.</em></h2>
          <p>Оформление комнаты, oversized-композиции, цветы, персональные фотографии и будущие WINK bunnies ручной работы. Раздел, который делает весь бренд дороже ещё до покупки.</p>
          <button className="text-link" onClick={() => addGift(PRODUCTS[3])}>Explore WOW gifts ↗</button>
        </div>
        <div className="wow-gallery">
          <figure className="wow-main"><img src={IMAGES.flowers} alt="WOW подарок WINK"/><figcaption>ROOM / from {money(13900)}</figcaption></figure>
          <figure className="wow-small"><img src={IMAGES.number} alt="Композиция WINK с цифрами"/><figcaption>NUMBER MOMENT</figcaption></figure>
        </div>
      </section>

      <section className="moments section">
        <div className="section-head split-head"><div><p className="eyebrow">Real WINK moments</p><h2>Made to be <em>remembered.</em></h2></div><p>Не постановочные «отзывы со звёздочками», а визуальное доказательство масштаба и эмоции подарка.</p></div>
        <div className="moments-grid">
          {[IMAGES.hero, IMAGES.number, IMAGES.pink, IMAGES.portrait].map((image, index) => <figure key={image}><img src={image} alt={`WINK moment ${index + 1}`} /><figcaption><span>{["19th birthday", "best friend / 21", "just because", "birthday night"][index]}</span><b>{["08:10", "11:40", "19:20", "22:05"][index]}</b></figcaption></figure>)}
        </div>
      </section>

      <section className="delivery section" id="delivery">
        <div className="delivery-intro"><p className="eyebrow">How it works</p><h2>Choose → Personalize → <em>We deliver the moment.</em></h2></div>
        <div className="steps">
          <article><span>01</span><h3>Choose</h3><p>Выбери готовый WINK или начни с конструктора. Мы уже сократили выбор до понятных решений.</p></article>
          <article><span>02</span><h3>Personalize</h3><p>Палитра, цифры, открытка, фото, анонимная доставка — всё задаётся в заказе, а не в переписке.</p></article>
          <article><span>03</span><h3>Deliver</h3><p>Укажи получателя, адрес, дату и предпочтительный слот. Финальные условия доставки подтверждаются до оплаты.</p></article>
        </div>
        <div className="faq-grid">
          <details><summary>Можно привезти сюрпризом?</summary><p>Да. В gift-checkout можно отметить, чтобы получателю не звонили заранее. Точный сценарий согласуем по адресу и доступу.</p></details>
          <details><summary>Как выбрать цифры?</summary><p>Прямо в конструкторе или карточке NUMBER SET. Никаких «напишите цифру в комментарии».</p></details>
          <details><summary>Можно выбрать своё время?</summary><p>Да, дата и слот указываются на этапе оформления. Доступность конкретного времени зависит от загрузки и адреса.</p></details>
          <details><summary>Сколько живут шары?</summary><p>Срок зависит от типа шара, температуры и условий помещения. Для каждого заказа мы даём рекомендации по хранению.</p></details>
        </div>
      </section>

      <section className="closing section">
        <p className="eyebrow">Need a gift tomorrow?</p>
        <h2>Don’t overthink it.<br/><em>Make a WINK.</em></h2>
        <button className="button button-dark" onClick={() => scrollTo("finder")}>Find my gift</button>
      </section>

      <footer>
        <div className="footer-brand">WINK<span>.</span></div>
        <div><p>Gifts that make a moment.</p><small>Premium balloon & gifting studio.</small></div>
        <div className="footer-links"><button onClick={() => scrollTo("shop")}>Shop</button><button onClick={() => scrollTo("delivery")}>Delivery & FAQ</button><button onClick={() => scrollTo("builder")}>Build your gift</button></div>
        <div className="footer-end"><small>Instagram · Telegram</small><small>© 2026 WINK</small></div>
      </footer>

      <button className="mobile-cta" onClick={() => scrollTo("finder")}>What are we celebrating? <span>→</span></button>

      {cartOpen && <div className="drawer-layer" role="dialog" aria-modal="true" aria-label="Gift checkout">
        <button className="drawer-backdrop" onClick={() => setCartOpen(false)} aria-label="Закрыть корзину" />
        <aside className="drawer">
          <div className="drawer-head"><div><p className="eyebrow">Your gift</p><h2>{cartCount ? `${cartCount} item${cartCount > 1 ? "s" : ""}` : "Empty for now"}</h2></div><button onClick={() => setCartOpen(false)}>×</button></div>
          {cart.length === 0 ? <div className="empty-gift"><p>Сюда складываются не товары, а будущий подарок.</p><button onClick={() => { setCartOpen(false); scrollTo("finder"); }}>Find a gift</button></div> : <>
            <div className="cart-items">{cart.map((item, index) => <div className="cart-item" key={`${item.id}-${index}`}><img src={item.image} alt=""/><div><b>{item.name}</b><small>{item.subtitle}</small></div><strong>{money(item.price)}</strong></div>)}</div>
            <form className="gift-form" onSubmit={submitOrder}>
              <div className="gift-question"><b>Is this a gift?</b><div className="two-buttons"><button type="button" className={giftForSomeone ? "active" : ""} onClick={() => setGiftForSomeone(true)}>Yes, for someone else</button><button type="button" className={!giftForSomeone ? "active" : ""} onClick={() => setGiftForSomeone(false)}>No, for me</button></div></div>
              {giftForSomeone && <div className="form-grid"><label>Recipient name<input required placeholder="Имя"/></label><label>Recipient phone<input required inputMode="tel" placeholder="+7 ..."/></label></div>}
              <label>Delivery address<input required placeholder="Адрес доставки"/></label>
              <div className="form-grid"><label>Date<input required type="date"/></label><label>Preferred time<input type="time"/></label></div>
              {giftForSomeone && <><label>Who is it from?<input placeholder="Ваше имя" disabled={anonymous}/></label><label className="check"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)}/> Keep me anonymous</label><label className="check"><input type="checkbox"/> Don’t call the recipient before arrival</label><label>Message<textarea placeholder="Что написать на открытке?" rows={3}/></label></>}
              <div className="checkout-total"><span>Total before delivery</span><strong>{money(cartTotal)}</strong></div>
              <button className="checkout-button" type="submit">Continue order</button>
              <p className="checkout-note">Доставка и доступный слот подтверждаются до оплаты. Платёжный провайдер подключается к этому checkout отдельно.</p>
              {orderReady && <div className="order-ready">Готово — форма заказа собрана. Следующий технический шаг: подключить оплату и отправку заказа в CRM/Telegram.</div>}
            </form>
          </>}
        </aside>
      </div>}
    </main>
  );
}
