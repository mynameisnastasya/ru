"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  MILK: ["#F7F3EE", "#E9DFD0", "#FFFDFC"], PINK_MILK: ["#E5C8CE", "#F7F3EE", "#FFFDFC"],
  PINK_CHROME: ["#E5C8CE", "#C8CDD2", "#F7F3EE"], BLACK_GOLD: ["#242222", "#D1B47A", "#EEE1D0"],
  NUDE_GOLD: ["#E9DFD0", "#D1B47A", "#FFFDFC"], BLACK_CHROME: ["#242222", "#C8CDD2", "#F7F3EE"],
  FROST: ["#D7E4EB", "#C8CDD2", "#F7F3EE"], CHERRY_MILK: ["#8F2332", "#E5C8CE", "#F7F3EE"],
};
const PALETTE_RU: Record<string, string> = {
  MILK: "Молочный", PINK_MILK: "Розовый + milk", PINK_CHROME: "Розовый + chrome", BLACK_GOLD: "Чёрный + gold",
  NUDE_GOLD: "Айвори + gold", BLACK_CHROME: "Чёрный + chrome", FROST: "Голубой + chrome", CHERRY_MILK: "Вишня + blush",
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

export default function WinkProduct2026({ slug }: { slug: string }) {
  const [catalog, setCatalog] = useState<Catalog>({ products: FALLBACK, modifiers: [] });
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

  const product = catalog.products.find(p => p.slug === slug) || FALLBACK.find(p => p.slug === slug) || null;
  if (!product) return <WinkPageFrame2026><main className="wp26-missing"><h1>Такого WINK сейчас нет.</h1><p>Не подставляем случайный товар вместо отсутствующего.</p><Link href="/shop">В каталог</Link></main><Styles /></WinkPageFrame2026>;

  const current: Product = product;
  const f = family(current);
  const ids = paletteIds(current);
  const currentPalette = palette || ids.find(id => id === "PINK_CHROME") || ids.find(id => id === "MILK") || ids[0] || "MILK";
  const digitCount = num(current.config, "digit_count");
  const validNumber = !yes(current.config, "number_required") || (/^\d+$/.test(number) && number.length === digitCount);
  const validMessage = !yes(current.config, "message_required") || (inscription.trim().length > 0 && inscription.length <= 40 && inscription.split(/\r?\n/).length <= 3);
  const validReveal = !yes(current.config, "reveal_result_required") || Boolean(reveal);
  const valid = validNumber && validMessage && validReveal;
  const bowModifier = catalog.modifiers.find(m => m.code === bowCode(current)) || null;
  const canBow = yes(current.config, "bows_eligible") && Boolean(bowModifier);
  const price = current.base_price_minor + (bows && bowModifier ? bowModifier.price_delta_minor : 0);
  const displayTitle = f === "HEARTS" ? `${FOIL_RU[foil] || "Silver"} · сердца` : f === "BABY REVEAL" ? "Шар-сюрприз" : PALETTE_RU[currentPalette] || current.name;
  const siblings = catalog.products.filter(p => family(p) === f && p.slug !== current.slug).sort((a, b) => a.base_price_minor - b.base_price_minor).slice(0, 2);

  function saveDeliveryIntent() { try { window.localStorage.setItem(DELIVERY_INTENT_KEY, JSON.stringify({ date: deliveryDate, address: deliveryAddress })); } catch {} }
  function toggleFavorite() {
    try {
      const list = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]") as string[];
      const next = list.includes(current.slug) ? list.filter(x => x !== current.slug) : [...list, current.slug];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); setFavorite(next.includes(current.slug));
    } catch {}
  }
  function addToCart() {
    if (!valid) return;
    const config: LineConfig = { addons: [] };
    if (f === "HEARTS") config.foilColor = foil; else if (f === "BABY REVEAL") config.palette = "MILK"; else config.palette = currentPalette;
    if (yes(current.config, "number_required")) config.number = number;
    if (yes(current.config, "message_required")) config.inscription = inscription.trim();
    if (yes(current.config, "reveal_result_required")) config.revealResult = reveal as "girl" | "boy";
    if (bows && bowModifier) config.addons = [bowModifier.code];
    const line: CartLine = { lineId: `${current.slug}-${window.crypto.randomUUID()}`, productId: current.slug, name: current.name, subtitle: current.subtitle, qty: 1, unitPriceMinor: price, config };
    try { window.localStorage.setItem(CART_KEY, JSON.stringify([...cartRead(), line])); } catch {}
    saveDeliveryIntent(); setAdded(true);
  }

  const included = [
    num(current.config, "latex_count") ? `${num(current.config, "latex_count")} латексных шаров` : "",
    num(current.config, "heart_count") ? `${num(current.config, "heart_count")} фольгированных сердец` : "",
    digitCount ? `${digitCount} ${digitCount === 1 ? "цифра" : "цифры"}` : "",
    yes(current.config, "message_required") ? "прозрачный шар с вашей надписью" : "",
    yes(current.config, "reveal_result_required") ? "шар-сюрприз с конфетти" : "",
    "ленты, грузики и транспортная упаковка",
  ].filter(Boolean);

  return <WinkPageFrame2026><main className="wp26">
    <section className="wp26-product">
      <div className="wp26-gallery"><figure className="wp26-main"><img src={productImage(current)} alt={`${displayTitle} — ${current.subtitle}`} /><button className={favorite ? "on" : ""} onClick={toggleFavorite} aria-label="Избранное">{favorite ? "♥" : "♡"}</button></figure><div><img src={ROOM} alt="WINK в интерьере"/><img src={productImage(current)} alt="WINK рядом с человеком"/></div></div>
      <aside className="wp26-buy"><small>{f}</small><h1>{displayTitle}</h1><p>{current.subtitle} · готовая композиция</p><strong className="wp26-price">{money(price)}</strong><div className="wp26-status">Дату и стоимость доставки подтверждаем до оплаты.</div>

        {f === "HEARTS" ? <Option title="Цвет сердца" value={FOIL_RU[foil]}><div className="wp26-foil">{[["S","Silver","#C8CDD2"],["G","Gold","#D1B47A"],["R","Red","#8F2332"]].map(([code,label,color]) => <button key={code} className={foil === code ? "active" : ""} onClick={() => setFoil(code)}><i style={{background: color}}/><span>{label}</span></button>)}</div></Option> : f !== "BABY REVEAL" ? <Option title="Палитра" value={PALETTE_RU[currentPalette]}><div className="wp26-palettes">{ids.map(id => <button key={id} className={currentPalette === id ? "active" : ""} onClick={() => setPalette(id)}><span>{(PALETTE_SWATCHES[id] || ["#eee"]).map(c => <i key={c} style={{background:c}}/>)}</span><small>{PALETTE_RU[id] || id}</small></button>)}</div><p className="wp26-micro">Реальные фото каждой палитры заменят swatches после съёмки — оттенок не имитируем фильтрами.</p></Option> : <Option title="Палитра" value="Milk"><p>Для reveal используем нейтральную Milk-базу.</p></Option>}

        {siblings.length > 0 && <Option title="Масштаб" value="Готовые форматы"><div className="wp26-sizes"><span className="active"><b>Как сейчас</b><small>{current.subtitle}</small></span>{siblings.map(item => <Link href={`/product/${item.slug}`} key={item.slug}><b>Другой формат</b><small>{item.subtitle}</small></Link>)}</div></Option>}
        {yes(current.config,"number_required") && <Option title={digitCount === 1 ? "Какая цифра нужна?" : "Какие цифры нужны?"}><input className="wp26-number" inputMode="numeric" maxLength={digitCount} value={number} onChange={e => setNumber(e.target.value.replace(/\D/g,"").slice(0,digitCount))} placeholder={digitCount === 1 ? "7" : "25"}/><p>Напишите возраст — остальное соберём мы.</p></Option>}
        {yes(current.config,"message_required") && <Option title="Что написать?"><textarea value={inscription} onChange={e => setInscription(e.target.value)} maxLength={40} placeholder="Несколько слов от вас"/><p>{inscription.length}/40 · максимум 3 строки</p></Option>}
        {yes(current.config,"reveal_result_required") && <Option title="Секретный результат" value="только для команды"><div className="wp26-segments"><button className={reveal === "girl" ? "active" : ""} onClick={() => setReveal("girl")}>Розовое конфетти</button><button className={reveal === "boy" ? "active" : ""} onClick={() => setReveal("boy")}>Голубое конфетти</button></div></Option>}
        {canBow && bowModifier && <Option title="Добавить к композиции"><button className={`wp26-addon ${bows ? "active" : ""}`} onClick={() => setBows(v => !v)}><span><b>Банты</b><small>Только для совместимых сетов</small></span><strong>+ {money(bowModifier.price_delta_minor)}</strong></button></Option>}

        <section className="wp26-delivery"><h2>Куда и когда?</h2><input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} onBlur={saveDeliveryIntent} placeholder="Адрес доставки"/><input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} onBlur={saveDeliveryIntent}/><p>Слот и цену покажем после подключения реальных зон и capacity.</p></section>
        <button className="wp26-add" disabled={!valid} onClick={addToCart}><span>Добавить</span><b>{money(price)}</b></button>{!valid && <p className="wp26-error">Заполните обязательную персонализацию.</p>}{added && <div className="wp26-added"><b>Уже в корзине.</b><Link href="/checkout">Оформить →</Link></div>}<p className="wp26-help">Не уверены? <Link href="/#finder">Подберём 2–3 варианта.</Link></p>
      </aside>
    </section>

    <section className="wp26-included"><div><small>Что входит</small><h2>Мы уже подумали о техническом.</h2></div><ul>{included.map(item => <li key={item}>{item}</li>)}</ul></section>
    <section className="wp26-scale"><small>Масштаб</small><h2>Как выглядит в комнате.</h2><p>Показываем подарок в реальном пространстве и рядом с человеком — размер не должен стать неприятным сюрпризом.</p><div><img src={ROOM} alt="Композиция в спальне"/><img src={productImage(current)} alt="Композиция рядом с человеком"/></div></section>
    <div className="wp26-mobile"><span>{money(price)}</span><button disabled={!valid} onClick={addToCart}>Добавить</button></div>
  </main><Styles /></WinkPageFrame2026>;
}

function Option({title,value,children}:{title:string;value?:string;children:React.ReactNode}) { return <section className="wp26-option"><header><b>{title}</b>{value && <span>{value}</span>}</header>{children}</section>; }

function Styles(){return <style jsx global>{`
.wp26{--milk:#F7F3EE;--white:#FFFDFC;--graphite:#242222;--blush:#E5C8CE;--line:rgba(36,34,34,.13);background:var(--milk);color:var(--graphite)}.wp26 button,.wp26 input,.wp26 textarea{font:inherit}.wp26-product{max-width:1400px;margin:auto;padding:34px 0 105px;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(390px,.72fr);gap:42px}.wp26-gallery{display:flex;flex-direction:column;gap:10px}.wp26-gallery figure{margin:0}.wp26-main{height:760px;position:relative;overflow:hidden;background:#e5ddd7}.wp26-main img,.wp26-gallery>div img,.wp26-scale img{width:100%;height:100%;object-fit:cover;filter:saturate(.83)}.wp26-main>button{position:absolute;right:18px;top:18px;border:0;background:rgba(255,253,252,.94);width:48px;height:48px;border-radius:50%;font-size:23px;cursor:pointer}.wp26-main>button.on{background:var(--blush)}.wp26-gallery>div{display:grid;grid-template-columns:1fr 1fr;gap:10px;height:410px}.wp26-buy{position:sticky;top:94px;align-self:start;max-height:calc(100vh - 112px);overflow:auto;background:var(--white);border:1px solid var(--line);padding:30px}.wp26-buy>small{font-size:9px;letter-spacing:.14em;color:#817771}.wp26-buy h1{font-size:clamp(40px,4vw,60px);letter-spacing:-.055em;line-height:.95;margin:12px 0}.wp26-buy>p{color:#746c68;line-height:1.5}.wp26-price{font-size:24px;display:block;margin:18px 0 8px}.wp26-status{font-size:11px;color:#746c68;padding-bottom:20px;border-bottom:1px solid var(--line)}.wp26-option{padding:20px 0;border-bottom:1px solid var(--line)}.wp26-option header{display:flex;justify-content:space-between;gap:14px;margin-bottom:12px}.wp26-option header b{font-size:12px}.wp26-option header span,.wp26-option p{font-size:10px;color:#786f6a}.wp26-palettes{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.wp26-palettes button{border:1px solid var(--line);background:white;padding:5px;text-align:left;cursor:pointer}.wp26-palettes button.active,.wp26-foil button.active{outline:2px solid var(--graphite)}.wp26-palettes button>span{display:flex;height:46px}.wp26-palettes i{flex:1}.wp26-palettes small{display:block;font-size:8px;margin-top:5px;line-height:1.2}.wp26-micro{line-height:1.4!important}.wp26-foil{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.wp26-foil button{border:1px solid var(--line);background:white;padding:6px;cursor:pointer}.wp26-foil i{display:block;height:46px;margin-bottom:6px}.wp26-sizes{display:grid;grid-template-columns:1fr 1fr;gap:7px}.wp26-sizes>a,.wp26-sizes>span{border:1px solid var(--line);padding:11px;display:flex;flex-direction:column;gap:3px}.wp26-sizes .active{background:var(--graphite);color:white}.wp26-sizes b{font-size:10px}.wp26-sizes small{font-size:8px;opacity:.72}.wp26-number,.wp26-option textarea,.wp26-delivery input{width:100%;border:1px solid var(--line);background:white;padding:13px;outline:none}.wp26-number{font-size:30px;letter-spacing:.15em;text-align:center}.wp26-option textarea{min-height:86px;resize:vertical}.wp26-segments{display:grid;grid-template-columns:1fr 1fr;gap:7px}.wp26-segments button{border:1px solid var(--line);background:white;padding:12px;cursor:pointer}.wp26-segments button.active{background:var(--graphite);color:white}.wp26-addon{width:100%;border:1px solid var(--line);background:white;padding:13px;display:flex;justify-content:space-between;text-align:left;cursor:pointer}.wp26-addon>span{display:flex;flex-direction:column;gap:3px}.wp26-addon small{font-size:8px;color:#786f6a}.wp26-addon.active{background:#f2e3e5}.wp26-delivery{padding:22px 0}.wp26-delivery h2{font-size:20px}.wp26-delivery input+input{margin-top:7px}.wp26-delivery p{font-size:9px;color:#786f6a}.wp26-add{width:100%;height:56px;border:0;background:var(--graphite);color:white;padding:0 17px;display:flex;justify-content:space-between;align-items:center;cursor:pointer}.wp26-add:disabled,.wp26-mobile button:disabled{opacity:.35}.wp26-error{color:#9a3143!important;font-size:10px!important}.wp26-added{margin-top:9px;background:#eee4dc;padding:12px;display:flex;justify-content:space-between;font-size:11px}.wp26-help{text-align:center;font-size:10px!important}.wp26-help a{text-decoration:underline}.wp26-included,.wp26-scale{max-width:1400px;margin:auto;padding:100px 0;border-top:1px solid var(--line)}.wp26-included{display:grid;grid-template-columns:1fr 1fr;gap:70px}.wp26-included small,.wp26-scale>small{font-size:9px;text-transform:uppercase;letter-spacing:.14em}.wp26-included h2,.wp26-scale h2{font-size:48px;letter-spacing:-.05em;line-height:1;margin:10px 0}.wp26-included ul{list-style:none;margin:0;padding:0}.wp26-included li{padding:14px 0;border-bottom:1px solid var(--line);font-size:13px}.wp26-scale>p{max-width:650px;color:#746c68;line-height:1.6}.wp26-scale>div{display:grid;grid-template-columns:1.3fr 1fr;gap:10px;margin-top:30px}.wp26-scale img{height:560px}.wp26-mobile{display:none}.wp26-missing{min-height:60vh;display:grid;place-items:center;align-content:center;text-align:center;padding:40px}.wp26-missing h1{font-size:48px;margin:0}
@media(max-width:1450px){.wp26-product,.wp26-included,.wp26-scale{margin-left:24px;margin-right:24px}}
@media(max-width:900px){.wp26-product{display:block;margin:0;padding:0 0 75px}.wp26-main{height:auto;aspect-ratio:4/5}.wp26-gallery>div{display:none}.wp26-buy{position:static;max-height:none;border:0;padding:28px 18px;background:var(--milk)}.wp26-buy h1{font-size:42px}.wp26-add{display:none}.wp26-included,.wp26-scale{margin:0;padding:70px 18px}.wp26-included{grid-template-columns:1fr;gap:25px}.wp26-included h2,.wp26-scale h2{font-size:34px}.wp26-scale>div{grid-template-columns:1fr}.wp26-scale img{height:auto;aspect-ratio:4/5}.wp26-mobile{display:flex;position:fixed;left:0;right:0;bottom:66px;z-index:96;background:rgba(255,253,252,.97);border-top:1px solid var(--line);padding:10px 14px;align-items:center;justify-content:space-between}.wp26-mobile button{border:0;background:var(--graphite);color:white;min-height:48px;padding:0 25px}.wps26-footer{padding-bottom:150px!important}}
`}</style>}
