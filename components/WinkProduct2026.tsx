"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WinkPageFrame2026 from "@/components/WinkPageFrame2026";

const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const CART_KEY = "wink-v4-cart";
const FAVORITES_KEY = "wink-favorites";
const DELIVERY_INTENT_KEY = "wink-delivery-intent";

const HERO = "https://images.pexels.com/photos/30277077/pexels-photo-30277077.jpeg?auto=compress&cs=tinysrgb&w=1800";
const PINK = "https://images.pexels.com/photos/31840152/pexels-photo-31840152.jpeg?auto=compress&cs=tinysrgb&w=1600";
const NUMBER = "https://images.pexels.com/photos/31840097/pexels-photo-31840097.jpeg?auto=compress&cs=tinysrgb&w=1600";
const NIGHT = "https://images.pexels.com/photos/31840156/pexels-photo-31840156.jpeg?auto=compress&cs=tinysrgb&w=1600";
const ROOM = "https://images.pexels.com/photos/30277237/pexels-photo-30277237.jpeg?auto=compress&cs=tinysrgb&w=1600";

const PALETTE_SWATCHES: Record<string, string[]> = {
  MILK: ["#F7F3EE", "#E9DFD0", "#FFFDFC"],
  PINK_MILK: ["#E5C8CE", "#F7F3EE", "#FFFDFC"],
  PINK_CHROME: ["#E5C8CE", "#C8CDD2", "#F7F3EE"],
  BLACK_GOLD: ["#242222", "#D1B47A", "#EEE1D0"],
  NUDE_GOLD: ["#E9DFD0", "#D1B47A", "#FFFDFC"],
  BLACK_CHROME: ["#242222", "#C8CDD2", "#F7F3EE"],
  FROST: ["#D7E4EB", "#C8CDD2", "#F7F3EE"],
  CHERRY_MILK: ["#8F2332", "#E5C8CE", "#F7F3EE"],
};

const PALETTE_RU: Record<string, string> = {
  MILK: "Молочный",
  PINK_MILK: "Розовый + milk",
  PINK_CHROME: "Розовый + chrome",
  BLACK_GOLD: "Чёрный + gold",
  NUDE_GOLD: "Айвори + gold",
  BLACK_CHROME: "Чёрный + chrome",
  FROST: "Голубой + chrome",
  CHERRY_MILK: "Вишня + blush",
};

const FOIL_RU: Record<string, string> = { S: "Silver", G: "Gold", R: "Red" };

type Config = Record<string, unknown>;
type Variant = { id: string; sku: string; palette_id: string | null; price_delta_minor: number; config: Config };
type Product = { id: string; slug: string; name: string; subtitle: string; description: string; base_price_minor: number; config: Config; variants: Variant[] };
type Modifier = { code: string; name: string; price_delta_minor: number };
type Catalog = { products: Product[]; modifiers: Modifier[] };
type LineConfig = { palette?: string; foilColor?: string; number?: string; inscription?: string; revealResult?: "girl" | "boy"; addons: string[] };
type CartLine = { lineId: string; productId: string; name: string; subtitle: string; qty: number; unitPriceMinor: number; config: LineConfig };

const FALLBACK: Product[] = [
  ["air16", "AIR", "Воздушный сет · 16 шаров", 349000, { production_id: "AIR16", latex_count: 16, bows_eligible: true }],
  ["air30", "AIR", "Воздушный сет · 30 шаров", 559000, { production_id: "AIR30", latex_count: 30, bows_eligible: true }],
  ["birthday16-1", "BIRTHDAY", "16 шаров + 1 цифра", 439000, { production_id: "NUM16_1", latex_count: 16, digit_count: 1, number_required: true, bows_eligible: true }],
  ["birthday16-2", "BIRTHDAY", "16 шаров + 2 цифры", 519000, { production_id: "NUM16_2", latex_count: 16, digit_count: 2, number_required: true, bows_eligible: true }],
  ["birthday30-1", "BIRTHDAY", "30 шаров + 1 цифра", 659000, { production_id: "NUM30_1", latex_count: 30, digit_count: 1, number_required: true, bows_eligible: true }],
  ["birthday30-2", "BIRTHDAY", "30 шаров + 2 цифры", 729000, { production_id: "NUM30_2", latex_count: 30, digit_count: 2, number_required: true, bows_eligible: true }],
  ["love16", "LOVE", "16 шаров + 2 сердца", 429000, { production_id: "MIX16", latex_count: 16, heart_count: 2 }],
  ["love30", "LOVE", "30 шаров + 4 сердца", 689000, { production_id: "MIX30", latex_count: 30, heart_count: 4 }],
  ["hearts7", "HEARTS", "7 шаров в форме сердца", 279000, { production_id: "HEART7", heart_count: 7 }],
  ["hearts14", "HEARTS", "14 шаров в форме сердца", 479000, { production_id: "HEART14", heart_count: 14 }],
  ["message16", "MESSAGE", "16 шаров + прозрачный шар с надписью", 509000, { production_id: "MSG16", latex_count: 16, message_required: true, bows_eligible: true }],
  ["message30", "MESSAGE", "30 шаров + прозрачный шар с надписью", 729000, { production_id: "MSG30", latex_count: 30, message_required: true, bows_eligible: true }],
  ["baby-reveal-solo", "BABY REVEAL", "Шар-сюрприз", 339000, { production_id: "REV0", reveal_result_required: true }],
  ["baby-reveal16", "BABY REVEAL", "Шар-сюрприз + 16 шаров", 629000, { production_id: "REV16", latex_count: 16, reveal_result_required: true }],
].map(([slug, name, subtitle, price, config]) => ({ id: String(slug), slug: String(slug), name: String(name), subtitle: String(subtitle), description: String(subtitle), base_price_minor: Number(price), config: config as Config, variants: [] }));

function family(p: Product) { return p.name.toUpperCase(); }
function num(c: Config, key: string) { const value = c[key]; return typeof value === "number" ? value : Number(value || 0); }
function yes(c: Config, key: string) { return c[key] === true; }
function money(minor: number) { return `${new Intl.NumberFormat("ru-RU").format(Math.round(minor / 100))} ₽`; }
function productImage(p: Product) { const f = family(p); if (f === "BIRTHDAY") return NUMBER; if (["LOVE", "HEARTS"].includes(f)) return PINK; if (["MESSAGE", "BABY REVEAL"].includes(f)) return NIGHT; return HERO; }
function paletteIds(p: Product) { const ids = [...new Set((p.variants || []).map(v => v.palette_id).filter((x): x is string => Boolean(x)))]; return ids.length ? ids : Object.keys(PALETTE_SWATCHES); }
function bowCode(p: Product) { const count = num(p.config, "latex_count"); return count === 30 ? "BOWS_30" : count === 16 ? "BOWS_16" : ""; }
function cartRead(): CartLine[] { try { return JSON.parse(window.localStorage.getItem(CART_KEY) || "[]") as CartLine[]; } catch { return []; } }

function paletteTitle(product: Product, palette: string, foil: string) {
  const f = family(product);
  if (f === "HEARTS") return `${FOIL_RU[foil] || "Silver"} · сердца`;
  if (f === "BABY REVEAL") return "Шар-сюрприз";
  return PALETTE_RU[palette] || product.name;
}

function siblingProducts(product: Product, products: Product[]) {
  const f = family(product);
  return products.filter(p => family(p) === f && p.slug !== product.slug).sort((a, b) => a.base_price_minor - b.base_price_minor).slice(0, 3);
}

export default function WinkProduct2026({ slug }: { slug: string }) {
  const [catalog, setCatalog] = useState<Catalog>({ products: FALLBACK, modifiers: [] });
  const product = catalog.products.find(p => p.slug === slug) || FALLBACK.find(p => p.slug === slug) || null;
  const [palette, setPalette] = useState("");
  const [foil, setFoil] = useState("S");
  const [number, setNumber] = useState("");
  const [inscription, setInscription] = useState("");
  const [reveal, setReveal] = useState<"girl" | "boy" | "">("");
  const [bows, setBows] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/api/catalog`).then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<Catalog>; }).then(data => { if (active && data.products?.length) setCatalog(data); }).catch(() => undefined);
    const timer = window.setTimeout(() => {
      try {
        const favorites = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]") as string[];
        setFavorite(favorites.includes(slug));
        const intent = JSON.parse(window.localStorage.getItem(DELIVERY_INTENT_KEY) || "null") as { date?: string; address?: string } | null;
        if (intent?.date) setDeliveryDate(intent.date);
        if (intent?.address) setDeliveryAddress(intent.address);
      } catch {}
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [slug]);

  const f = product ? family(product) : "";
  const ids = useMemo(() => product ? paletteIds(product) : [], [product]);
  const currentPalette = palette || ids.find(id => id === "PINK_CHROME") || ids.find(id => id === "MILK") || ids[0] || "MILK";
  const siblings = product ? siblingProducts(product, catalog.products) : [];

  if (!product) return <WinkPageFrame2026><main className="wp26-missing"><h1>Такого WINK сейчас нет.</h1><p>Не подставляем случайный товар вместо отсутствующего.</p><Link href="/shop">В каталог</Link></main><ProductStyles /></WinkPageFrame2026>;

  const digitCount = num(product.config, "digit_count");
  const validNumber = !yes(product.config, "number_required") || (/^\d+$/.test(number) && number.length === digitCount);
  const validMessage = !yes(product.config, "message_required") || (inscription.trim().length > 0 && inscription.length <= 40 && inscription.split(/\r?\n/).length <= 3);
  const validReveal = !yes(product.config, "reveal_result_required") || Boolean(reveal);
  const valid = validNumber && validMessage && validReveal;
  const bCode = bowCode(product);
  const bowModifier = catalog.modifiers.find(m => m.code === bCode) || null;
  const canBow = yes(product.config, "bows_eligible") && Boolean(bowModifier);
  const price = product.base_price_minor + (bows && bowModifier ? bowModifier.price_delta_minor : 0);

  function saveDeliveryIntent() {
    try { window.localStorage.setItem(DELIVERY_INTENT_KEY, JSON.stringify({ date: deliveryDate, address: deliveryAddress })); } catch {}
  }

  function toggleFavorite() {
    try {
      const list = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]") as string[];
      const next = list.includes(product.slug) ? list.filter(x => x !== product.slug) : [...list, product.slug];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      setFavorite(next.includes(product.slug));
    } catch {}
  }

  function addToCart() {
    if (!valid) return;
    const config: LineConfig = { addons: [] };
    if (f === "HEARTS") config.foilColor = foil;
    else if (f === "BABY REVEAL") config.palette = "MILK";
    else config.palette = currentPalette;
    if (yes(product.config, "number_required")) config.number = number;
    if (yes(product.config, "message_required")) config.inscription = inscription.trim();
    if (yes(product.config, "reveal_result_required")) config.revealResult = reveal as "girl" | "boy";
    if (bows && bowModifier) config.addons = [bowModifier.code];
    const line: CartLine = { lineId: `${product.slug}-${window.crypto.randomUUID()}`, productId: product.slug, name: product.name, subtitle: product.subtitle, qty: 1, unitPriceMinor: price, config };
    try { window.localStorage.setItem(CART_KEY, JSON.stringify([...cartRead(), line])); } catch {}
    saveDeliveryIntent();
    setAdded(true);
  }

  const displayTitle = paletteTitle(product, currentPalette, foil);
  const included = [
    num(product.config, "latex_count") ? `${num(product.config, "latex_count")} латексных шаров` : "",
    num(product.config, "heart_count") ? `${num(product.config, "heart_count")} фольгированных сердец` : "",
    digitCount ? `${digitCount} ${digitCount === 1 ? "цифра" : "цифры"}` : "",
    yes(product.config, "message_required") ? "прозрачный bubble с вашей надписью" : "",
    yes(product.config, "reveal_result_required") ? "шар-сюрприз с конфетти" : "",
    "ленты, грузики и транспортная упаковка",
  ].filter(Boolean);

  return <WinkPageFrame2026>
    <main className="wp26">
      <section className="wp26-product">
        <div className="wp26-gallery">
          <figure className="wp26-mainPhoto"><img src={productImage(product)} alt={`${displayTitle} — ${product.subtitle}`} /><button className={`wp26-favorite ${favorite ? "on" : ""}`} onClick={toggleFavorite} aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}>{favorite ? "♥" : "♡"}</button></figure>
          <div className="wp26-galleryGrid"><figure><img src={ROOM} alt="Композиция WINK в интерьере" /></figure><figure><img src={productImage(product)} alt="Композиция WINK рядом с человеком" /></figure></div>
        </div>

        <aside className="wp26-buy">
          <div className="wp26-eyebrow">{f}</div>
          <h1>{displayTitle}</h1>
          <p className="wp26-subtitle">{product.subtitle} · готовая композиция</p>
          <strong className="wp26-price">{money(price)}</strong>
          <p className="wp26-availability">Дату и стоимость доставки подтверждаем до оплаты.</p>

          {f === "HEARTS" ? <section className="wp26-option"><div className="wp26-optionHead"><b>Цвет сердца</b><span>{FOIL_RU[foil]}</span></div><div className="wp26-foil">{[["S", "Silver", "#C8CDD2"], ["G", "Gold", "#D1B47A"], ["R", "Red", "#8F2332"]].map(([code, label, color]) => <button key={code} className={foil === code ? "active" : ""} onClick={() => setFoil(code)}><i style={{ background: color }} /><span>{label}</span></button>)}</div></section> : f !== "BABY REVEAL" ? <section className="wp26-option"><div className="wp26-optionHead"><b>Палитра</b><span>{PALETTE_RU[currentPalette] || currentPalette}</span></div><div className="wp26-palettes">{ids.map(id => <button key={id} className={currentPalette === id ? "active" : ""} onClick={() => setPalette(id)} aria-label={PALETTE_RU[id] || id}><span>{(PALETTE_SWATCHES[id] || ["#eee"]).map(color => <i key={color} style={{ background: color }} />)}</span><small>{PALETTE_RU[id] || id}</small></button>)}</div><p className="wp26-micro">Фотографии каждой палитры подменим реальными после съёмки. Цвет не симулируем фильтрами.</p></section> : <section className="wp26-option"><div className="wp26-optionHead"><b>Палитра</b><span>Milk</span></div><p>Для reveal используем нейтральную Milk-базу.</p></section>}

          {siblings.length > 0 && <section className="wp26-option"><div className="wp26-optionHead"><b>Масштаб</b><span>Выберите готовый формат</span></div><div className="wp26-sizes"><span className="active"><b>Как сейчас</b><small>{product.subtitle}</small></span>{siblings.map((item, index) => <Link href={`/product/${item.slug}`} key={item.slug}><b>{index === siblings.length - 1 ? "Больше вау" : "Другой формат"}</b><small>{item.subtitle}</small></Link>)}</div></section>}

          {yes(product.config, "number_required") && <section className="wp26-option"><label>Какая {digitCount === 1 ? "цифра" : "цифры"} нужна?</label><input className="wp26-number" inputMode="numeric" maxLength={digitCount} value={number} onChange={e => setNumber(e.target.value.replace(/\D/g, "").slice(0, digitCount))} placeholder={digitCount === 1 ? "7" : "25"} /><p>Напишите возраст — соберём с нужной {digitCount === 1 ? "цифрой" : "парой цифр"}.</p></section>}

          {yes(product.config, "message_required") && <section className="wp26-option"><label>Что написать?</label><textarea value={inscription} onChange={e => setInscription(e.target.value)} maxLength={40} placeholder="Например: ты — мой любимый человек" /><p>{inscription.length}/40 · максимум 3 строки</p></section>}

          {yes(product.config, "reveal_result_required") && <section className="wp26-option"><div className="wp26-optionHead"><b>Секретный результат</b><span>увидит только команда</span></div><div className="wp26-segments"><button className={reveal === "girl" ? "active" : ""} onClick={() => setReveal("girl")}>Розовое конфетти</button><button className={reveal === "boy" ? "active" : ""} onClick={() => setReveal("boy")}>Голубое конфетти</button></div></section>}

          {canBow && bowModifier && <section className="wp26-option"><button className={`wp26-addon ${bows ? "active" : ""}`} onClick={() => setBows(v => !v)}><span><b>Добавить банты</b><small>Только для совместимых сетов</small></span><strong>+ {money(bowModifier.price_delta_minor)}</strong></button></section>}

          <section className="wp26-delivery"><h3>Куда и когда?</h3><div><input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} onBlur={saveDeliveryIntent} placeholder="Адрес доставки" /><input type="date" value={deliveryDate} onChange={e => { setDeliveryDate(e.target.value); }} onBlur={saveDeliveryIntent} /></div><p>Слот и цену покажем только после подключения реальной capacity/тарифов. Сейчас не обещаем время, которого нет в системе.</p></section>

          <button className="wp26-add" disabled={!valid} onClick={addToCart}><span>Добавить</span><strong>{money(price)}</strong></button>
          {!valid && <p className="wp26-error">Заполните обязательную персонализацию.</p>}
          {added && <div className="wp26-added"><b>Готово. Уже в корзине.</b><Link href="/checkout">Оформить →</Link></div>}
          <p className="wp26-help">Не уверены? <Link href="/#finder">Подберём 2–3 варианта по вашему бюджету.</Link></p>
        </aside>
      </section>

      <section className="wp26-details"><div><p>Что входит</p><h2>Мы уже подумали о техническом.</h2></div><ul>{included.map(item => <li key={item}>{item}</li>)}</ul></section>

      <section className="wp26-scale"><div><p>Масштаб</p><h2>Как выглядит в комнате.</h2><span>Показываем композицию в пространстве и рядом с человеком, чтобы размер не был сюрпризом.</span></div><div className="wp26-scaleGrid"><img src={ROOM} alt="WINK в спальне" /><img src={productImage(product)} alt="WINK рядом с человеком" /><img src={HERO} alt="WINK в жилом интерьере" /></div></section>

      <section className="wp26-more"><p>С этим настроением</p><h2>Ещё три — не двадцать.</h2><div>{catalog.products.filter(p => p.slug !== product.slug).slice(0, 3).map(p => <Link href={`/product/${p.slug}`} key={p.slug}><img src={productImage(p)} alt={p.subtitle} /><small>{p.name}</small><b>{p.subtitle}</b><strong>{money(p.base_price_minor)}</strong></Link>)}</div></section>

      <div className="wp26-mobileBar"><span>{money(price)}</span><button disabled={!valid} onClick={addToCart}>Добавить</button></div>
    </main>
    <ProductStyles />
  </WinkPageFrame2026>;
}

function ProductStyles() { return <style jsx global>{`
  .wp26{--milk:#F7F3EE;--white:#FFFDFC;--graphite:#242222;--blush:#E5C8CE;--taupe:#B7A9A2;--cocoa:#5A403E;--line:rgba(36,34,34,.13);background:var(--milk);color:var(--graphite)}.wp26 button,.wp26 input,.wp26 textarea{font:inherit}.wp26-product{max-width:1400px;margin:auto;padding:34px 0 110px;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(380px,.75fr);gap:44px}.wp26-gallery{display:flex;flex-direction:column;gap:10px}.wp26-mainPhoto{position:relative;margin:0;min-height:760px;background:#e5ddd7;overflow:hidden}.wp26-mainPhoto img,.wp26-galleryGrid img{width:100%;height:100%;object-fit:cover;filter:saturate(.83)}.wp26-favorite{position:absolute;right:18px;top:18px;width:48px;height:48px;border:0;border-radius:50%;background:rgba(255,253,252,.93);font-size:23px;cursor:pointer}.wp26-favorite.on{background:var(--blush)}.wp26-galleryGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.wp26-galleryGrid figure{height:420px;margin:0;overflow:hidden;background:#e6ddd6}.wp26-buy{position:sticky;top:96px;align-self:start;background:var(--white);padding:34px 30px;border:1px solid var(--line);max-height:calc(100vh - 118px);overflow:auto}.wp26-eyebrow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7a716c}.wp26-buy h1{font-size:clamp(40px,4vw,62px);letter-spacing:-.055em;line-height:.95;margin:12px 0}.wp26-subtitle{color:#746c68;margin:0 0 20px;line-height:1.5}.wp26-price{display:block;font-size:24px;margin-bottom:10px}.wp26-availability{font-size:12px;color:#756d68;padding-bottom:22px;border-bottom:1px solid var(--line)}.wp26-option{padding:22px 0;border-bottom:1px solid var(--line)}.wp26-option>label,.wp26-optionHead b{display:block;font-size:13px;font-weight:600}.wp26-optionHead{display:flex;justify-content:space-between;gap:15px;align-items:center;margin-bottom:13px}.wp26-optionHead span{font-size:11px;color:#746c68}.wp26-palettes{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.wp26-palettes button{border:1px solid var(--line);background:white;padding:6px;text-align:left;cursor:pointer}.wp26-palettes button.active{outline:2px solid var(--graphite);outline-offset:1px}.wp26-palettes button>span{display:flex;height:48px;overflow:hidden}.wp26-palettes i{flex:1}.wp26-palettes small{display:block;margin-top:6px;font-size:8px;line-height:1.2}.wp26-micro{font-size:9px!important;color:#8b817b!important;line-height:1.45!important}.wp26-foil{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.wp26-foil button{border:1px solid var(--line);background:white;padding:7px;cursor:pointer}.wp26-foil button.active{outline:2px solid var(--graphite)}.wp26-foil i{display:block;height:48px;margin-bottom:7px}.wp26-sizes{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.wp26-sizes>a,.wp26-sizes>span{border:1px solid var(--line);background:white;padding:12px;display:flex;flex-direction:column;gap:4px}.wp26-sizes .active{background:var(--graphite);color:white}.wp26-sizes b{font-size:11px}.wp26-sizes small{font-size:9px;opacity:.7}.wp26-number,.wp26-option textarea{width:100%;border:1px solid var(--line);background:white;padding:14px;margin-top:10px;outline:none}.wp26-number{font-size:30px;letter-spacing:.14em;text-align:center}.wp26-option textarea{min-height:90px;resize:vertical}.wp26-option>p{font-size:10px;color:#7c736e;line-height:1.5}.wp26-segments{display:grid;grid-template-columns:1fr 1fr;gap:7px}.wp26-segments button{border:1px solid var(--line);background:white;padding:13px;cursor:pointer}.wp26-segments button.active{background:var(--graphite);color:white}.wp26-addon{width:100%;display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line);background:white;padding:14px;cursor:pointer;text-align:left}.wp26-addon span{display:flex;flex-direction:column;gap:4px}.wp26-addon small{font-size:9px;color:#746c68}.wp26-addon.active{background:#f2e3e5;border-color:#b77a86}.wp26-delivery{padding:24px 0}.wp26-delivery h3{font-size:20px;margin:0 0 12px}.wp26-delivery>div{display:grid;grid-template-columns:1fr 150px;gap:7px}.wp26-delivery input{border:1px solid var(--line);background:white;padding:13px;min-width:0}.wp26-delivery p{font-size:9px;color:#7c736e;line-height:1.5}.wp26-add{width:100%;min-height:56px;border:0;background:var(--graphite);color:white;padding:0 18px;display:flex;justify-content:space-between;align-items:center;cursor:pointer}.wp26-add:disabled,.wp26-mobileBar button:disabled{opacity:.35;cursor:not-allowed}.wp26-error{font-size:11px;color:#9a3143}.wp26-added{margin-top:10px;background:#ebe3dc;padding:14px;display:flex;justify-content:space-between;gap:10px;font-size:12px}.wp26-added a{text-decoration:underline}.wp26-help{font-size:11px;color:#756c67;text-align:center;margin-top:17px}.wp26-help a{text-decoration:underline}.wp26-details,.wp26-scale,.wp26-more{max-width:1400px;margin:auto;padding:110px 0;border-top:1px solid var(--line)}.wp26-details{display:grid;grid-template-columns:1fr 1fr;gap:70px}.wp26-details p,.wp26-scale>div>p,.wp26-more>p{font-size:10px;text-transform:uppercase;letter-spacing:.14em}.wp26-details h2,.wp26-scale h2,.wp26-more h2{font-size:48px;letter-spacing:-.05em;line-height:1;margin:10px 0}.wp26-details ul{list-style:none;padding:0;margin:0}.wp26-details li{padding:15px 0;border-bottom:1px solid var(--line);font-size:14px}.wp26-scale>div:first-child{max-width:680px;margin-bottom:38px}.wp26-scale>div>span{color:#746c68;line-height:1.6}.wp26-scaleGrid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:10px}.wp26-scaleGrid img{width:100%;height:520px;object-fit:cover;filter:saturate(.82)}.wp26-more>div{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.wp26-more a{display:flex;flex-direction:column;gap:5px}.wp26-more img{width:100%;aspect-ratio:4/5;object-fit:cover;filter:saturate(.82);margin-bottom:8px}.wp26-more small{font-size:9px;color:#776e69}.wp26-more b{font-size:16px}.wp26-more strong{font-size:13px}.wp26-mobileBar{display:none}.wp26-missing{min-height:60vh;display:grid;place-items:center;align-content:center;text-align:center;padding:40px}.wp26-missing h1{font-size:48px;margin:0}.wp26-missing p{color:#746c68}.wp26-missing a{text-decoration:underline}
  @media(max-width:1450px){.wp26-product,.wp26-details,.wp26-scale,.wp26-more{margin-left:24px;margin-right:24px}}
  @media(max-width:900px){.wp26-product{display:block;margin:0;padding:0 0 90px}.wp26-mainPhoto{min-height:0;aspect-ratio:4/5}.wp26-galleryGrid{display:none}.wp26-buy{position:static;max-height:none;border:0;padding:28px 18px;background:var(--milk)}.wp26-buy h1{font-size:42px}.wp26-palettes{grid-template-columns:repeat(4,1fr)}.wp26-delivery>div{grid-template-columns:1fr}.wp26-add{display:none}.wp26-details,.wp26-scale,.wp26-more{margin:0;padding:72px 18px}.wp26-details{grid-template-columns:1fr;gap:25px}.wp26-details h2,.wp26-scale h2,.wp26-more h2{font-size:34px}.wp26-scaleGrid{grid-template-columns:1fr;overflow:hidden}.wp26-scaleGrid img{height:auto;aspect-ratio:4/5}.wp26-more>div{grid-template-columns:1fr 1fr;gap:8px}.wp26-more>div a:nth-child(3){display:none}.wp26-mobileBar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:95;background:rgba(255,253,252,.96);backdrop-filter:blur(18px);border-top:1px solid var(--line);padding:10px 14px;align-items:center;justify-content:space-between;gap:14px}.wp26-mobileBar span{font-weight:600}.wp26-mobileBar button{border:0;background:var(--graphite);color:white;min-height:50px;padding:0 26px;cursor:pointer}.wps26-footer{padding-bottom:110px!important}}
`}</style>; }
