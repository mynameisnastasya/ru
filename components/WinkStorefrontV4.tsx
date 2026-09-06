"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const CART_KEY = "wink-v4-cart";
const IDEM_KEY = "wink-v4-idempotency";

const HERO = "https://images.pexels.com/photos/30277077/pexels-photo-30277077.jpeg?auto=compress&cs=tinysrgb&w=1800";
const MOMENT = "https://images.pexels.com/photos/30277237/pexels-photo-30277237.jpeg?auto=compress&cs=tinysrgb&w=1400";
const NIGHT = "https://images.pexels.com/photos/31840156/pexels-photo-31840156.jpeg?auto=compress&cs=tinysrgb&w=1400";

const FALLBACK_SWATCHES: Record<string, string[]> = {
  MILK: ["#f7f4ed", "#e8dfcf", "#fffdf8"],
  PINK_MILK: ["#f4efe8", "#e9cdd2", "#fff9f8"],
  PINK_CHROME: ["#e9cdd2", "#f7f3ef", "#c8cdd2"],
  BLACK_GOLD: ["#171615", "#e8dfcf", "#d1b47a"],
  NUDE_GOLD: ["#e8dfcf", "#f7f3ef", "#d1b47a"],
  BLACK_CHROME: ["#171615", "#f7f3ef", "#c8cdd2"],
  FROST: ["#d7e4eb", "#f7f3ef", "#c8cdd2"],
  CHERRY_MILK: ["#8f2332", "#e9cdd2", "#f7f3ef"],
};

const PALETTE_RU: Record<string, string> = {
  MILK: "Молочный",
  PINK_MILK: "Розовый молочный",
  PINK_CHROME: "Розовый с серебром",
  BLACK_GOLD: "Чёрный с золотом",
  NUDE_GOLD: "Айвори с золотом",
  BLACK_CHROME: "Чёрный с серебром",
  FROST: "Голубой с серебром",
  CHERRY_MILK: "Вишня с розовым",
};

const PALETTE_NAME: Record<string, string> = {
  MILK: "Milk",
  PINK_MILK: "Pink Milk",
  PINK_CHROME: "Pink Chrome",
  BLACK_GOLD: "Black Gold",
  NUDE_GOLD: "Nude Gold",
  BLACK_CHROME: "Black Chrome",
  FROST: "Frost",
  CHERRY_MILK: "Cherry Milk",
};

const FAMILY_RU: Record<string, string> = {
  AIR: "Воздушный сет",
  BIRTHDAY: "Сет с цифрами",
  LOVE: "Сет с сердцами",
  HEARTS: "Только сердца",
  MESSAGE: "Личная надпись",
  "BABY REVEAL": "Шар-сюрприз",
};

const FAMILY_ORDER = ["AIR", "BIRTHDAY", "LOVE", "HEARTS", "MESSAGE", "BABY REVEAL"];

type Variant = {
  id: string;
  sku: string;
  price_delta_minor: number;
  lead_time_minutes: number;
  capacity_minutes: number;
  palette_id: string | null;
  palette_name: string | null;
  palette_ru: string | null;
  config: Record<string, any>;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  base_price_minor: number;
  bestseller?: boolean;
  config: Record<string, any>;
  variants: Variant[];
};

type Palette = { id: string; slug: string; name: string; ru_label?: string | null; swatches: string[]; sort: number };
type Modifier = { code: string; name: string; price_delta_minor: number; validation_rules: Record<string, any>; group_code?: string };
type Catalog = { version: string; tagline: string; products: Product[]; palettes: Palette[]; modifiers: Modifier[] };

type LineConfig = {
  palette?: string;
  foilColor?: string;
  number?: string;
  inscription?: string;
  revealResult?: "girl" | "boy";
  addons: string[];
};

type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  subtitle: string;
  image?: string;
  qty: number;
  unitPriceMinor: number;
  config: LineConfig;
};

type Occasion = "Birthday" | "Love" | "Baby" | "Just because";
type Budget = "до 5 000 ₽" | "5–8 000 ₽" | "8–12 000 ₽" | "12 000 ₽+";
type Recipient = "Она" | "Он" | "Ребёнок" | "Мама" | "Подруга" | "Пара";

type ProductDraft = {
  product: Product;
  palette: string;
  foilColor: string;
  number: string;
  inscription: string;
  revealResult: "girl" | "boy" | "";
  bows: boolean;
};

const FALLBACK_PRODUCTS: Product[] = [
  ["air16", "AIR", "Воздушный сет · 16 шаров", 349000, { production_id: "AIR16", latex_count: 16, digit_count: 0, bows_eligible: true }],
  ["air30", "AIR", "Воздушный сет · 30 шаров", 559000, { production_id: "AIR30", latex_count: 30, digit_count: 0, bows_eligible: true }],
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
  ["baby-reveal-solo", "BABY REVEAL", "Шар-сюрприз", 339000, { production_id: "REV0", reveal_count: 1, reveal_result_required: true }],
  ["baby-reveal16", "BABY REVEAL", "Шар-сюрприз + 16 шаров", 629000, { production_id: "REV16", latex_count: 16, reveal_count: 1, reveal_result_required: true }],
].map(([slug, name, subtitle, price, config]) => ({ id: String(slug), slug: String(slug), name: String(name), subtitle: String(subtitle), description: "", base_price_minor: Number(price), config: config as Record<string, any>, variants: [] }));

const FALLBACK_PALETTES: Palette[] = Object.keys(PALETTE_NAME).map((slug, index) => ({ id: slug, slug, name: PALETTE_NAME[slug], ru_label: PALETTE_RU[slug], swatches: FALLBACK_SWATCHES[slug], sort: (index + 1) * 10 }));

const money = (minor: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(minor / 100))} ₽`;
const localDate = (offset = 0) => { const d = new Date(); d.setDate(d.getDate() + offset); const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 10); };
const family = (p: Product) => p.name.toUpperCase();
const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function fallbackVariants(product: Product): Variant[] {
  if (family(product) === "HEARTS") return [
    { id: "S", sku: `${product.config.production_id}__HEART_S`, price_delta_minor: 0, lead_time_minutes: 0, capacity_minutes: 0, palette_id: null, palette_name: null, palette_ru: null, config: { foil_color: "S", foil_label: "Silver", heart_count: product.config.heart_count } },
    { id: "G", sku: `${product.config.production_id}__HEART_G`, price_delta_minor: 0, lead_time_minutes: 0, capacity_minutes: 0, palette_id: null, palette_name: null, palette_ru: null, config: { foil_color: "G", foil_label: "Gold", heart_count: product.config.heart_count } },
    { id: "R", sku: `${product.config.production_id}__HEART_R`, price_delta_minor: 0, lead_time_minutes: 0, capacity_minutes: 0, palette_id: null, palette_name: null, palette_ru: null, config: { foil_color: "R", foil_label: "Red", heart_count: product.config.heart_count } },
  ];
  if (family(product) === "BABY REVEAL") return [{ id: "MILK", sku: `${product.config.production_id}__MILK`, price_delta_minor: 0, lead_time_minutes: 0, capacity_minutes: 0, palette_id: "MILK", palette_name: "Milk", palette_ru: "Молочный", config: { palette_id: "MILK", palette_name: "Milk", palette_ru: "Молочный" } }];
  return FALLBACK_PALETTES.map((p) => ({ id: `${product.slug}-${p.slug}`, sku: `${product.config.production_id}__${p.slug}`, price_delta_minor: 0, lead_time_minutes: 0, capacity_minutes: 0, palette_id: p.slug, palette_name: p.name, palette_ru: p.ru_label || null, config: { palette_id: p.slug, palette_name: p.name, palette_ru: p.ru_label } }));
}

function productVariants(product: Product) { return product.variants.length ? product.variants : fallbackVariants(product); }
function preferredPalette(product: Product) {
  if (family(product) === "HEARTS") return "S";
  if (family(product) === "BABY REVEAL") return "MILK";
  const variants = productVariants(product);
  return variants.find((v) => v.palette_id === "PINK_CHROME")?.palette_id || variants.find((v) => v.palette_id === "MILK")?.palette_id || variants[0]?.palette_id || "MILK";
}
function bowCode(product: Product) { return Number(product.config.latex_count || 0) === 30 ? "BOWS_30" : "BOWS_16"; }
function bowPrice(product: Product, catalog: Catalog) { const code = bowCode(product); return catalog.modifiers.find((m) => m.code === code)?.price_delta_minor ?? (code === "BOWS_30" ? 60000 : 40000); }
function productPrice(product: Product, bows: boolean, catalog: Catalog) { return product.base_price_minor + (bows ? bowPrice(product, catalog) : 0); }

function budgetTarget(budget: Budget | null) {
  if (budget === "до 5 000 ₽") return 420000;
  if (budget === "5–8 000 ₽") return 650000;
  if (budget === "8–12 000 ₽") return 950000;
  if (budget === "12 000 ₽+") return 1300000;
  return 650000;
}
function occasionScore(p: Product, occasion: Occasion | null, recipient: Recipient | null) {
  const f = family(p); let score = 0;
  if (occasion === "Birthday") score += ({ BIRTHDAY: 40, MESSAGE: 28, AIR: 24, HEARTS: 12, LOVE: 10 } as Record<string, number>)[f] || 0;
  if (occasion === "Love") score += ({ HEARTS: 40, LOVE: 36, MESSAGE: 30, AIR: 18 } as Record<string, number>)[f] || 0;
  if (occasion === "Baby") score += ({ "BABY REVEAL": 40, MESSAGE: 32, AIR: 24 } as Record<string, number>)[f] || 0;
  if (occasion === "Just because") score += ({ AIR: 36, LOVE: 30, MESSAGE: 26, HEARTS: 24 } as Record<string, number>)[f] || 0;
  if (recipient === "Ребёнок" && f === "BIRTHDAY") score += 8;
  if (recipient === "Пара" && ["LOVE", "HEARTS"].includes(f)) score += 7;
  if (["Мама", "Подруга"].includes(recipient || "") && ["MESSAGE", "AIR"].includes(f)) score += 5;
  return score;
}

function Visual({ product, palette = "PINK_CHROME" }: { product: Product; palette?: string }) {
  const f = family(product); const colors = f === "HEARTS" ? (palette === "G" ? ["#d1b47a", "#ead9b4"] : palette === "R" ? ["#8f2332", "#c65362"] : ["#c8cdd2", "#f3f4f5"]) : FALLBACK_SWATCHES[palette] || FALLBACK_SWATCHES.MILK;
  const count = Math.min(17, Math.max(7, Number(product.config.latex_count || product.config.heart_count || 9)));
  return <div className={`wv4-visual ${f === "HEARTS" ? "hearts" : ""}`} aria-hidden="true">
    <span className="wv4-visual-label">{product.name}</span>
    <div className="wv4-orbs">{Array.from({ length: count }).map((_, i) => <i key={i} style={{ background: colors[i % colors.length], left: `${11 + ((i * 31) % 74)}%`, top: `${12 + ((i * 43) % 60)}%`, transform: `scale(${0.72 + (i % 4) * 0.1})` }} />)}</div>
    {Number(product.config.digit_count || 0) > 0 && <b className="wv4-number-shape">{Number(product.config.digit_count) === 2 ? "25" : "5"}</b>}
    {Number(product.config.reveal_count || 0) > 0 && <b className="wv4-reveal-shape">?</b>}
    {Number(product.config.bubble_count || 0) > 0 && <b className="wv4-bubble-shape">your<br/>words</b>}
  </div>;
}

export default function WinkStorefrontV4() {
  const [catalog, setCatalog] = useState<Catalog>({ version: "4.0", tagline: "Так выглядит внимание.", products: FALLBACK_PRODUCTS, palettes: FALLBACK_PALETTES, modifiers: [] });
  const [catalogLive, setCatalogLive] = useState(false);
  const [familyFilter, setFamilyFilter] = useState("ALL");
  const [paletteFilter, setPaletteFilter] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [giftForSomeone, setGiftForSomeone] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [noCall, setNoCall] = useState(true);
  const [giftMessage, setGiftMessage] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"today" | "tomorrow" | "date">("tomorrow");
  const [deliveryDate, setDeliveryDate] = useState(localDate(1));
  const [deliverySlot, setDeliverySlot] = useState("12:00–15:00");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderResult, setOrderResult] = useState<any>(null);
  const [finderStep, setFinderStep] = useState(0);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [finderPalette, setFinderPalette] = useState("PINK_CHROME");
  const [budget, setBudget] = useState<Budget | null>(null);
  const [builderFamily, setBuilderFamily] = useState("AIR");
  const [builderSize, setBuilderSize] = useState(16);
  const [builderDigits, setBuilderDigits] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/api/catalog`).then((r) => { if (!r.ok) throw new Error(); return r.json(); }).then((data: Catalog) => { if (Array.isArray(data.products) && data.products.length) { setCatalog(data); setCatalogLive(true); } }).catch(() => setCatalogLive(false));
    try { const saved = window.localStorage.getItem(CART_KEY); if (saved) setCart(JSON.parse(saved)); } catch {}
  }, []);
  useEffect(() => { try { window.localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { document.body.style.overflow = cartOpen || draft ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [cartOpen, draft]);

  const products = useMemo(() => catalog.products.filter((p) => p && p.slug), [catalog]);
  const filteredProducts = useMemo(() => {
    let list = products;
    if (familyFilter !== "ALL") list = list.filter((p) => family(p) === familyFilter);
    if (paletteFilter) list = list.filter((p) => family(p) === "HEARTS" || family(p) === "BABY REVEAL" || productVariants(p).some((v) => v.palette_id === paletteFilter));
    return showAll || familyFilter !== "ALL" ? list : list.slice(0, 8);
  }, [products, familyFilter, paletteFilter, showAll]);

  const recommendations = useMemo(() => {
    if (!occasion || !recipient || !budget) return [];
    const target = budgetTarget(budget);
    const ranked = products.map((p) => ({ p, score: occasionScore(p, occasion, recipient) - Math.abs(p.base_price_minor - target) / 100000 })).sort((a, b) => b.score - a.score).map((x) => x.p);
    const picks: Product[] = [];
    const ranges = [[0, 500000], [500000, 800000], [800000, Infinity]];
    for (const [min, max] of ranges) { const found = ranked.find((p) => p.base_price_minor >= min && p.base_price_minor < max && !picks.includes(p)); if (found) picks.push(found); }
    for (const p of ranked) { if (picks.length >= 3) break; if (!picks.includes(p)) picks.push(p); }
    return picks.slice(0, 3);
  }, [products, occasion, recipient, budget]);

  const builderProduct = useMemo(() => {
    const candidates = products.filter((p) => family(p) === builderFamily);
    if (builderFamily === "BIRTHDAY") return candidates.find((p) => Number(p.config.latex_count) === builderSize && Number(p.config.digit_count) === builderDigits) || null;
    if (["AIR", "LOVE", "MESSAGE"].includes(builderFamily)) return candidates.find((p) => Number(p.config.latex_count) === builderSize) || null;
    return candidates[0] || null;
  }, [products, builderFamily, builderSize, builderDigits]);

  const cartCount = cart.reduce((s, line) => s + line.qty, 0);
  const cartTotal = cart.reduce((s, line) => s + line.unitPriceMinor * line.qty, 0);

  function openProduct(product: Product, forcedPalette?: string) {
    const f = family(product); const initial = forcedPalette || preferredPalette(product);
    setDraft({ product, palette: f === "HEARTS" ? "" : initial, foilColor: f === "HEARTS" ? initial : "", number: "", inscription: "", revealResult: "", bows: false });
  }
  function draftValid(d: ProductDraft) {
    const pc = d.product.config;
    if (family(d.product) === "HEARTS" && !d.foilColor) return false;
    if (!["HEARTS", "BABY REVEAL"].includes(family(d.product)) && !d.palette) return false;
    if (pc.number_required && (!/^\d+$/.test(d.number) || d.number.length !== Number(pc.digit_count))) return false;
    if (pc.message_required && (!d.inscription.trim() || d.inscription.length > 40 || d.inscription.split(/\r?\n/).length > 3)) return false;
    if (pc.reveal_result_required && !d.revealResult) return false;
    return true;
  }
  function addDraft() {
    if (!draft || !draftValid(draft)) return;
    const p = draft.product;
    const addons = draft.bows ? [bowCode(p)] : [];
    const config: LineConfig = { addons };
    if (family(p) === "HEARTS") config.foilColor = draft.foilColor;
    else if (family(p) !== "BABY REVEAL") config.palette = draft.palette;
    else config.palette = "MILK";
    if (p.config.number_required) config.number = draft.number;
    if (p.config.message_required) config.inscription = draft.inscription.trim();
    if (p.config.reveal_result_required) config.revealResult = draft.revealResult as "girl" | "boy";
    setCart((current) => [...current, { lineId: `${p.slug}-${Date.now()}-${Math.random().toString(16).slice(2)}`, productId: p.slug, name: p.name, subtitle: p.subtitle, qty: 1, unitPriceMinor: productPrice(p, draft.bows, catalog), config }]);
    setDraft(null); setCheckoutStep(0); setOrderResult(null); setCartOpen(true);
  }
  function updateQty(lineId: string, delta: number) { setCart((current) => current.flatMap((line) => line.lineId !== lineId ? [line] : line.qty + delta > 0 ? [{ ...line, qty: Math.min(20, line.qty + delta) }] : [])); }

  function nextFinder(value?: any) {
    if (finderStep === 0) { setOccasion(value as Occasion); setFinderStep(1); }
    else if (finderStep === 1) { setRecipient(value as Recipient); setFinderStep(2); }
    else if (finderStep === 2) { setFinderPalette(String(value)); setFinderStep(3); }
    else if (finderStep === 3) { setBudget(value as Budget); setFinderStep(4); }
  }
  function resetFinder() { setFinderStep(0); setOccasion(null); setRecipient(null); setFinderPalette("PINK_CHROME"); setBudget(null); setTimeout(() => scrollToId("gift-finder"), 20); }

  function setDelivery(mode: "today" | "tomorrow" | "date") { setDeliveryMode(mode); if (mode === "today") setDeliveryDate(localDate(0)); if (mode === "tomorrow") setDeliveryDate(localDate(1)); }
  function giftStepValid() { return !giftForSomeone || (recipientName.trim().length > 1 && recipientPhone.replace(/\D/g, "").length >= 7); }
  function deliveryValid() { return address.trim().length >= 5 && Boolean(deliveryDate) && Boolean(deliverySlot); }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitError(""); setOrderResult(null);
    if (customerName.trim().length < 2 || customerPhone.replace(/\D/g, "").length < 7) { setSubmitError("Проверьте имя и телефон покупателя."); return; }
    setSubmitting(true);
    try {
      const payload = {
        customer: { name: customerName.trim(), phone: customerPhone.trim() },
        gift: { forSomeone: giftForSomeone, recipientName: giftForSomeone ? recipientName.trim() : "", recipientPhone: giftForSomeone ? recipientPhone.trim() : "", anonymous: giftForSomeone ? anonymous : false, senderName: giftForSomeone ? senderName.trim() : "", dontCall: giftForSomeone ? noCall : false, message: giftForSomeone ? giftMessage.trim() : "" },
        delivery: { date: deliveryDate, slot: deliverySlot, address: address.trim() },
        items: cart.map((line) => ({ productId: line.productId, qty: line.qty, config: line.config })),
        source: "wink-v4-github-pages",
        utm: Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].map((key) => [key.replace("utm_", ""), new URLSearchParams(window.location.search).get(key)])),
      };
      const fingerprint = JSON.stringify(payload);
      let idem = "";
      try { const stored = JSON.parse(window.localStorage.getItem(IDEM_KEY) || "null"); if (stored?.fingerprint === fingerprint) idem = stored.key; } catch {}
      if (!idem) idem = crypto.randomUUID();
      try { window.localStorage.setItem(IDEM_KEY, JSON.stringify({ fingerprint, key: idem })); } catch {}
      const response = await fetch(`${API_URL}/api/orders`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, idempotency_key: idem }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error?.message || "Не удалось создать заказ.");
      setOrderResult(data.order); setCart([]);
      try { window.localStorage.setItem("wink-last-order", JSON.stringify(data.order)); window.localStorage.removeItem(IDEM_KEY); } catch {}
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "Не удалось создать заказ."); }
    finally { setSubmitting(false); }
  }

  const firstPalettes = catalog.palettes.filter((p) => ["MILK", "PINK_MILK", "PINK_CHROME", "BLACK_GOLD"].includes(p.slug));
  const allPalettes = catalog.palettes.length ? catalog.palettes : FALLBACK_PALETTES;

  return <main className="wv4">
    <header className="wv4-header">
      <button className="wv4-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>WINK<span>.</span></button>
      <nav><button onClick={() => scrollToId("shop")}>Shop</button><button onClick={() => scrollToId("build")}>Build your gift</button><button onClick={() => { setOccasion("Birthday"); setFinderStep(1); scrollToId("gift-finder"); }}>Birthdays</button><button onClick={() => { setOccasion("Love"); setFinderStep(1); scrollToId("gift-finder"); }}>Love</button><button onClick={() => scrollToId("how")}>Delivery</button></nav>
      <button className="wv4-bag" onClick={() => { setCheckoutStep(0); setCartOpen(true); }}>Gift <i>{cartCount}</i></button>
    </header>

    <section className="wv4-hero">
      <img src={HERO} alt="WINK — красивое поздравление" />
      <div className="wv4-hero-shade" />
      <div className="wv4-hero-copy"><p>WINK · Кемерово</p><h1>Так выглядит <em>внимание.</em></h1><span>Красивые поздравления с личными деталями. Выбираете момент — мы собираем его в подарок.</span><div><button onClick={() => scrollToId("gift-finder")}>Найти подарок</button><button className="ghost" onClick={() => scrollToId("build")}>Собрать свой</button></div></div>
      <small className="wv4-live">{catalogLive ? "live catalog · 14 compositions" : "catalog fallback · reconnecting"}</small>
    </section>

    <section className="wv4-section wv4-finder" id="gift-finder">
      <div className="wv4-section-title"><p>WINK gift concierge</p><h2>Блядь, у неё завтра день рождения.<br/><em>Что подарить?</em></h2><span>Не заставляем вас разбираться в диаметрах и марках. Четыре ответа — три законченных варианта.</span></div>
      <div className="wv4-finder-card">
        <div className="wv4-progress">{[0,1,2,3].map((n) => <i className={finderStep >= n ? "on" : ""} key={n} />)}</div>
        {finderStep === 0 && <div className="wv4-question"><small>01 / 04</small><h3>Что празднуем?</h3><div className="wv4-options">{(["Birthday", "Love", "Baby", "Just because"] as Occasion[]).map((x) => <button key={x} onClick={() => nextFinder(x)}>{x}</button>)}</div></div>}
        {finderStep === 1 && <div className="wv4-question"><small>02 / 04</small><h3>Кому дарим?</h3><div className="wv4-options">{(["Она", "Он", "Ребёнок", "Мама", "Подруга", "Пара"] as Recipient[]).map((x) => <button key={x} onClick={() => nextFinder(x)}>{x}</button>)}</div><button className="wv4-back" onClick={() => setFinderStep(0)}>← назад</button></div>}
        {finderStep === 2 && <div className="wv4-question"><small>03 / 04</small><h3>Какой вайб?</h3><div className="wv4-palette-options">{firstPalettes.concat(allPalettes.filter((p) => !firstPalettes.includes(p)).slice(0,4)).map((p) => <button key={p.slug} onClick={() => nextFinder(p.slug)}><span>{(p.swatches?.length ? p.swatches : FALLBACK_SWATCHES[p.slug] || []).slice(0,3).map((c) => <i key={c} style={{ background: c }} />)}</span><b>{p.name}</b><small>{p.ru_label || PALETTE_RU[p.slug]}</small></button>)}</div><button className="wv4-back" onClick={() => setFinderStep(1)}>← назад</button></div>}
        {finderStep === 3 && <div className="wv4-question"><small>04 / 04</small><h3>Какой бюджет комфортен?</h3><div className="wv4-options">{(["до 5 000 ₽", "5–8 000 ₽", "8–12 000 ₽", "12 000 ₽+"] as Budget[]).map((x) => <button key={x} onClick={() => nextFinder(x)}>{x}</button>)}</div><button className="wv4-back" onClick={() => setFinderStep(2)}>← назад</button></div>}
        {finderStep === 4 && <div className="wv4-results"><div className="wv4-result-head"><div><small>{recipient} · {occasion} · {PALETTE_NAME[finderPalette]} · {budget}</small><h3>We found your gift.</h3></div><button onClick={resetFinder}>Начать заново</button></div><div className="wv4-result-grid">{recommendations.map((p, i) => <article key={p.slug}><Visual product={p} palette={family(p) === "HEARTS" ? "S" : finderPalette}/><div><span>{["Cute", "Perfect", "WOW"][i]}</span><h4>{p.name}</h4><p>{p.subtitle}</p><strong>{money(p.base_price_minor)}</strong><button onClick={() => openProduct(p, finderPalette)}>Выбрать →</button></div></article>)}</div></div>}
      </div>
    </section>

    <section className="wv4-section" id="shop">
      <div className="wv4-section-title split"><div><p>The WINK edit</p><h2>Шесть семейств.<br/><em>Четырнадцать составов.</em></h2></div><span>Цена одинакова внутри комплектации для разрешённых палитр. Доставка считается отдельно.</span></div>
      <div className="wv4-family-tabs"><button className={familyFilter === "ALL" ? "active" : ""} onClick={() => setFamilyFilter("ALL")}>All</button>{FAMILY_ORDER.map((f) => <button className={familyFilter === f ? "active" : ""} key={f} onClick={() => { setFamilyFilter(f); setShowAll(true); }}>{f}</button>)}</div>
      <div className="wv4-product-grid">{filteredProducts.map((p) => <article className="wv4-product" key={p.slug}><button className="wv4-product-visual" onClick={() => openProduct(p)}><Visual product={p} palette={preferredPalette(p)}/><span className="wv4-arrow">↗</span></button><button className="wv4-product-meta" onClick={() => openProduct(p)}><div><small>{FAMILY_RU[family(p)]}</small><h3>{p.name}</h3><p>{p.subtitle}</p></div><strong>{money(p.base_price_minor)}</strong></button></article>)}</div>
      {familyFilter === "ALL" && products.length > 8 && <button className="wv4-showall" onClick={() => setShowAll((v) => !v)}>{showAll ? "Показать только edit" : `Показать все ${products.length} композиций`} →</button>}
    </section>

    <section className="wv4-section wv4-moods">
      <div className="wv4-section-title"><p>Choose your mood</p><h2>Не цвет.<br/><em>Настроение.</em></h2></div>
      <div className="wv4-mood-grid">{allPalettes.map((p) => <button className={paletteFilter === p.slug ? "active" : ""} key={p.slug} onClick={() => { setPaletteFilter(paletteFilter === p.slug ? null : p.slug); scrollToId("shop"); }}><span>{(p.swatches?.length ? p.swatches : FALLBACK_SWATCHES[p.slug] || []).slice(0,3).map((c) => <i key={c} style={{ background: c }} />)}</span><b>{p.name}</b><small>{p.ru_label || PALETTE_RU[p.slug]}</small></button>)}</div>
    </section>

    <section className="wv4-builder" id="build">
      <div className="wv4-builder-image"><img src={MOMENT} alt="Момент WINK"/><div><small>Build only what we can actually make</small><b>Made by you.<br/>Finished by WINK.</b></div></div>
      <div className="wv4-builder-panel"><p>Build your gift</p><h2>Собери подарок,<br/><em>а не случайный набор SKU.</em></h2>
        <label><span>01 / Family</span><div className="wv4-segments">{["AIR", "BIRTHDAY", "LOVE", "MESSAGE"].map((f) => <button className={builderFamily === f ? "active" : ""} onClick={() => setBuilderFamily(f)} type="button" key={f}>{f}</button>)}</div></label>
        <label><span>02 / Scale</span><div className="wv4-segments"><button className={builderSize === 16 ? "active" : ""} onClick={() => setBuilderSize(16)} type="button">16 шаров</button><button className={builderSize === 30 ? "active" : ""} onClick={() => setBuilderSize(30)} type="button">30 шаров</button></div></label>
        {builderFamily === "BIRTHDAY" && <label><span>03 / Digits</span><div className="wv4-segments"><button className={builderDigits === 1 ? "active" : ""} onClick={() => setBuilderDigits(1)} type="button">1 цифра</button><button className={builderDigits === 2 ? "active" : ""} onClick={() => setBuilderDigits(2)} type="button">2 цифры</button></div></label>}
        <div className="wv4-build-resolve"><span>WINK resolves this to</span>{builderProduct ? <><b>{builderProduct.config.production_id} · {builderProduct.name}</b><small>{builderProduct.subtitle}</small><strong>{money(builderProduct.base_price_minor)}</strong><button onClick={() => openProduct(builderProduct)}>Выбрать палитру и детали →</button></> : <small>Такой комбинации сейчас нет в производственной системе.</small>}</div>
      </div>
    </section>

    <section className="wv4-editorial"><div><p>WINK / ROOM</p><h2>Room is a <em>scenario.</em><br/>Not a fake SKU.</h2><span>Для оформления комнаты сначала выбирается конкретная базовая композиция, затем отдельно подтверждаются дополнительные элементы и монтаж. Никакой магической цены «от 13 900» за непонятно что.</span><button onClick={() => { setFamilyFilter("BIRTHDAY"); setShowAll(true); scrollToId("shop"); }}>Начать с BIRTHDAY →</button></div><img src={NIGHT} alt="Вечерний WINK moment"/></section>

    <section className="wv4-section wv4-how" id="how"><div className="wv4-section-title"><p>How it works</p><h2>Choose → Personalize →<br/><em>We deliver the moment.</em></h2></div><div className="wv4-steps"><article><span>01</span><h3>Choose</h3><p>14 готовых производственных составов вместо бесконечного каталога.</p></article><article><span>02</span><h3>Personalize</h3><p>Палитра, точные цифры, короткая надпись и разрешённые банты сохраняются внутри позиции.</p></article><article><span>03</span><h3>Deliver</h3><p>Получатель, покупатель, сюрприз и доставка оформляются отдельно. Доставка оплачивается отдельно.</p></article></div><div className="wv4-faq"><details><summary>Можно сюрпризом?</summary><p>Да. В checkout есть анонимный отправитель и «не звонить получателю заранее».</p></details><details><summary>Как выбрать цифры?</summary><p>В BIRTHDAY — отдельным полем. Один знак для комплектации с одной цифрой, два знака для комплектации с двумя.</p></details><details><summary>Что с MESSAGE?</summary><p>Надпись входит в состав: до 40 знаков с пробелами, максимум три строки. До сборки проверяем написание.</p></details><details><summary>Что с BABY REVEAL?</summary><p>Снаружи всё нейтрально. Секретный результат передаётся отдельно и не показывается в публичном трекинге.</p></details></div></section>

    <footer className="wv4-footer"><b>WINK<span>.</span></b><p>Так выглядит внимание.</p><div><button onClick={() => scrollToId("shop")}>Shop</button><button onClick={() => scrollToId("build")}>Build your gift</button><button onClick={() => scrollToId("how")}>Delivery & FAQ</button></div><small>Кемерово · 2026</small></footer>
    <button className="wv4-mobile-gift" onClick={() => setCartOpen(true)}>Gift <span>{cartCount}</span> · {money(cartTotal)}</button>

    {draft && <div className="wv4-layer" role="dialog" aria-modal="true"><button className="wv4-backdrop" aria-label="Закрыть" onClick={() => setDraft(null)}/><aside className="wv4-drawer"><div className="wv4-drawer-head"><div><small>{FAMILY_RU[family(draft.product)]}</small><h2>{draft.product.name}</h2><p>{draft.product.subtitle}</p></div><button onClick={() => setDraft(null)}>×</button></div><Visual product={draft.product} palette={family(draft.product) === "HEARTS" ? draft.foilColor : draft.palette}/>
      {family(draft.product) === "HEARTS" ? <div className="wv4-config"><label>Choose hearts</label><div className="wv4-foil"><button className={draft.foilColor === "S" ? "active" : ""} onClick={() => setDraft({ ...draft, foilColor: "S" })}><i style={{background:"#c8cdd2"}}/>Silver</button><button className={draft.foilColor === "G" ? "active" : ""} onClick={() => setDraft({ ...draft, foilColor: "G" })}><i style={{background:"#d1b47a"}}/>Gold</button><button className={draft.foilColor === "R" ? "active" : ""} onClick={() => setDraft({ ...draft, foilColor: "R" })}><i style={{background:"#8f2332"}}/>Red</button></div></div> : family(draft.product) !== "BABY REVEAL" ? <div className="wv4-config"><label>Choose your palette</label><div className="wv4-config-palettes">{productVariants(draft.product).filter((v) => v.palette_id).map((v) => <button className={draft.palette === v.palette_id ? "active" : ""} onClick={() => setDraft({ ...draft, palette: v.palette_id || "" })} key={v.sku}><span>{(FALLBACK_SWATCHES[v.palette_id || ""] || ["#eee"]).map((c) => <i style={{background:c}} key={c}/>)}</span><small>{v.palette_name || PALETTE_NAME[v.palette_id || ""]}</small></button>)}</div></div> : <div className="wv4-secret"><b>Milk outside. Secret inside.</b><p>Внешняя композиция нейтральная. Результат нужен только производству.</p></div>}
      {draft.product.config.number_required && <div className="wv4-config"><label>Your number <small>{draft.product.config.digit_count === 1 ? "один знак" : "два знака"}</small></label><input className="wv4-number-input" inputMode="numeric" value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value.replace(/\D/g, "").slice(0, Number(draft.product.config.digit_count)) })} placeholder={draft.product.config.digit_count === 2 ? "25" : "5"}/>{draft.number.length !== Number(draft.product.config.digit_count) && <em className="wv4-error">Нужно выбрать ровно {draft.product.config.digit_count} {draft.product.config.digit_count === 1 ? "цифру" : "цифры"}.</em>}</div>}
      {draft.product.config.message_required && <div className="wv4-config"><label>Your words <small>{draft.inscription.length}/40 · максимум 3 строки</small></label><textarea rows={3} value={draft.inscription} maxLength={40} onChange={(e) => setDraft({ ...draft, inscription: e.target.value.split(/\r?\n/).slice(0,3).join("\n") })} placeholder="Ане\n25"/></div>}
      {draft.product.config.reveal_result_required && <div className="wv4-config"><label>Secret result <small>не показываем получателю</small></label><div className="wv4-segments"><button className={draft.revealResult === "girl" ? "active" : ""} onClick={() => setDraft({ ...draft, revealResult: "girl" })}>Розовый внутри</button><button className={draft.revealResult === "boy" ? "active" : ""} onClick={() => setDraft({ ...draft, revealResult: "boy" })}>Голубой внутри</button></div></div>}
      {draft.product.config.bows_eligible && <div className="wv4-config"><label>Make it personal</label><button className={`wv4-addon ${draft.bows ? "active" : ""}`} onClick={() => setDraft({ ...draft, bows: !draft.bows })}><span>{Number(draft.product.config.latex_count) === 30 ? "14 лёгких бантов" : "8 лёгких бантов"}</span><b>+{money(bowPrice(draft.product, catalog))}</b></button><small className="wv4-planned">PHOTOS и BUNNY пока не продаём: сначала образец, тест и подтверждённая цена.</small></div>}
      <button className="wv4-add" disabled={!draftValid(draft)} onClick={addDraft}><span>Add to gift</span><strong>{money(productPrice(draft.product, draft.bows, catalog))}</strong></button>
    </aside></div>}

    {cartOpen && <div className="wv4-layer" role="dialog" aria-modal="true"><button className="wv4-backdrop" aria-label="Закрыть" onClick={() => setCartOpen(false)}/><aside className="wv4-drawer checkout"><div className="wv4-drawer-head"><div><small>Your gift</small><h2>{orderResult ? "Заявка создана" : cartCount ? `${cartCount} поз.` : "Пока пусто"}</h2></div><button onClick={() => setCartOpen(false)}>×</button></div>
      {orderResult ? <div className="wv4-success"><span>WINK · #{orderResult.number}</span><h3>Мы получили заявку.</h3><p>Сумма проверена backend: <b>{orderResult.total}</b>. Сейчас заказ ждёт оплаты; эквайринг подключается отдельно, поэтому сайт не притворяется, что деньги уже списаны.</p><a href={`${window.location.pathname.startsWith("/ru") ? "/ru" : ""}/order/?token=${encodeURIComponent(orderResult.public_token)}`}>Отследить заказ →</a><button onClick={() => { setOrderResult(null); setCheckoutStep(0); setCartOpen(false); }}>Вернуться на витрину</button></div> : cart.length === 0 ? <div className="wv4-empty"><p>Сюда попадёт именно подарок с выбранной палитрой и персональными деталями.</p><button onClick={() => { setCartOpen(false); scrollToId("shop"); }}>Выбрать подарок</button></div> : <>
        <div className="wv4-check-progress">{["Gift", "Recipient", "Delivery", "Review"].map((x, i) => <button key={x} className={checkoutStep === i ? "active" : ""} onClick={() => { if (i === 0 || (i === 1) || (i === 2 && giftStepValid()) || (i === 3 && giftStepValid() && deliveryValid())) setCheckoutStep(i); }}>{x}</button>)}</div>
        {checkoutStep === 0 && <div className="wv4-check-panel"><div className="wv4-cart-lines">{cart.map((line) => <article key={line.lineId}><div><b>{line.name}</b><small>{line.subtitle}</small><small>{[line.config.palette ? PALETTE_NAME[line.config.palette] || line.config.palette : "", line.config.foilColor ? ({S:"Silver",G:"Gold",R:"Red"} as any)[line.config.foilColor] : "", line.config.number ? `цифры ${line.config.number}` : "", line.config.inscription ? `«${line.config.inscription.replace(/\n/g, " / ") }»` : "", line.config.addons.length ? "BOWS" : ""].filter(Boolean).join(" · ")}</small><div><button onClick={() => updateQty(line.lineId, -1)}>−</button><span>{line.qty}</span><button onClick={() => updateQty(line.lineId, 1)}>+</button></div></div><strong>{money(line.unitPriceMinor * line.qty)}</strong></article>)}</div><div className="wv4-total"><span>Товары</span><strong>{money(cartTotal)}</strong></div><p className="wv4-note">Доставка отдельно и подтверждается до оплаты.</p><button className="wv4-next" onClick={() => setCheckoutStep(1)}>Оформить подарок →</button></div>}
        {checkoutStep === 1 && <div className="wv4-check-panel wv4-form"><label className="wv4-check-question"><b>Is this a gift?</b><div className="wv4-segments"><button type="button" className={giftForSomeone ? "active" : ""} onClick={() => setGiftForSomeone(true)}>Да, другому человеку</button><button type="button" className={!giftForSomeone ? "active" : ""} onClick={() => setGiftForSomeone(false)}>Нет, мне</button></div></label>{giftForSomeone && <><div className="wv4-two"><label>Recipient name<input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Имя"/></label><label>Recipient phone<input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} inputMode="tel" placeholder="+7 ..."/></label></div><label>Who is it from?<input disabled={anonymous} value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Ваше имя"/></label><label className="wv4-checkline"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)}/> Keep me anonymous</label><label className="wv4-checkline"><input type="checkbox" checked={noCall} onChange={(e) => setNoCall(e.target.checked)}/> Не звонить получателю заранее</label><label>Message<textarea rows={3} value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="Текст на открытке / пожелание"/></label></>}<button className="wv4-next" disabled={!giftStepValid()} onClick={() => setCheckoutStep(2)}>К доставке →</button></div>}
        {checkoutStep === 2 && <div className="wv4-check-panel wv4-form"><label className="wv4-check-question"><b>When should we arrive?</b><div className="wv4-segments"><button type="button" className={deliveryMode === "today" ? "active" : ""} onClick={() => setDelivery("today")}>Сегодня — запрос</button><button type="button" className={deliveryMode === "tomorrow" ? "active" : ""} onClick={() => setDelivery("tomorrow")}>Завтра</button><button type="button" className={deliveryMode === "date" ? "active" : ""} onClick={() => setDelivery("date")}>Дата</button></div></label>{deliveryMode === "date" && <label>Date<input type="date" min={localDate(0)} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}/></label>}<label>Preferred slot<select value={deliverySlot} onChange={(e) => setDeliverySlot(e.target.value)}><option>09:00–12:00</option><option>12:00–15:00</option><option>15:00–18:00</option><option>18:00–21:00</option><option>Точное время — запрос</option></select></label><label>Delivery address<input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Улица, дом, квартира / отель"/></label><p className="wv4-note">Это предпочтительный слот, а не ложное обещание availability: точная доступность и стоимость доставки подтверждаются до оплаты.</p><button className="wv4-next" disabled={!deliveryValid()} onClick={() => setCheckoutStep(3)}>Проверить заказ →</button></div>}
        {checkoutStep === 3 && <form className="wv4-check-panel wv4-form" onSubmit={submitOrder}><div className="wv4-review"><span>Gift</span><b>{cartCount} поз. · {money(cartTotal)}</b><button type="button" onClick={() => setCheckoutStep(0)}>Edit</button></div><div className="wv4-review"><span>Recipient</span><b>{giftForSomeone ? `${recipientName}${anonymous ? " · anonymous" : ""}` : "For me"}</b><button type="button" onClick={() => setCheckoutStep(1)}>Edit</button></div><div className="wv4-review"><span>Delivery</span><b>{deliveryMode === "today" ? "Сегодня — запрос" : deliveryDate} · {deliverySlot}</b><button type="button" onClick={() => setCheckoutStep(2)}>Edit</button></div><div className="wv4-two"><label>Your name<input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Имя покупателя"/></label><label>Your phone<input required inputMode="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+7 ..."/></label></div><div className="wv4-total"><span>Товары, доставка отдельно</span><strong>{money(cartTotal)}</strong></div>{submitError && <div className="wv4-submit-error">{submitError}</div>}<button className="wv4-next" type="submit" disabled={submitting}>{submitting ? "Проверяем цену и создаём…" : "Создать заявку"}</button><p className="wv4-note">Финальную сумму каждого товара считает сервер заново. Значения из браузера не считаются источником цены.</p></form>}
      </>}</aside></div>}

    <style jsx global>{`
      .wv4{--paper:#f7f3ef;--ink:#171615;--wine:#781f31;--pink:#e9cdd2;--line:rgba(23,22,21,.13);--muted:#716b67;background:var(--paper);color:var(--ink);min-height:100vh;font-family:Arial,Helvetica,sans-serif}.wv4 *{box-sizing:border-box}.wv4 button,.wv4 input,.wv4 textarea,.wv4 select{font:inherit}.wv4 button{cursor:pointer}.wv4-header{height:72px;position:sticky;top:0;z-index:60;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 5vw;background:rgba(247,243,239,.9);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}.wv4-logo{border:0;background:none;justify-self:start;font:500 30px Georgia,serif;letter-spacing:.08em}.wv4-logo span,.wv4-footer b span{color:var(--wine)}.wv4-header nav{display:flex;gap:22px}.wv4-header nav button{border:0;background:none;font-size:12px}.wv4-bag{justify-self:end;border:0;background:var(--ink);color:white;border-radius:999px;padding:10px 14px}.wv4-bag i{display:inline-grid;place-items:center;min-width:19px;height:19px;border-radius:50%;background:white;color:var(--ink);font-style:normal;margin-left:7px;font-size:10px}.wv4-hero{height:calc(100svh - 72px);min-height:620px;position:relative;overflow:hidden;background:#4d3a38}.wv4-hero>img{width:100%;height:100%;object-fit:cover;filter:saturate(.83)}.wv4-hero-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(20,14,14,.68),rgba(20,14,14,.18) 60%,rgba(20,14,14,.05))}.wv4-hero-copy{position:absolute;left:7vw;bottom:12vh;max-width:720px;color:white}.wv4-hero-copy>p,.wv4-section-title>p,.wv4-builder-panel>p,.wv4-editorial p{font-size:11px;text-transform:uppercase;letter-spacing:.18em;margin:0 0 16px}.wv4-hero-copy h1{font:400 clamp(54px,8vw,118px)/.86 Georgia,serif;letter-spacing:-.055em;margin:0}.wv4 em{font-weight:400;color:var(--wine)}.wv4-hero-copy em{color:#f2cfd4}.wv4-hero-copy>span{display:block;font-size:16px;line-height:1.5;max-width:560px;margin:28px 0}.wv4-hero-copy>div{display:flex;gap:10px}.wv4-hero-copy button{border:0;border-radius:999px;padding:14px 22px;background:white;color:var(--ink)}.wv4-hero-copy button.ghost{background:transparent;color:white;border:1px solid rgba(255,255,255,.55)}.wv4-live{position:absolute;right:28px;bottom:24px;color:rgba(255,255,255,.65);font-size:10px;letter-spacing:.08em}.wv4-section{padding:110px 6vw}.wv4-section-title{max-width:780px;margin-bottom:46px}.wv4-section-title.split{max-width:none;display:flex;justify-content:space-between;align-items:end;gap:30px}.wv4-section-title.split>span{max-width:430px}.wv4-section-title h2{font:400 clamp(42px,5vw,74px)/.98 Georgia,serif;letter-spacing:-.04em;margin:0 0 20px}.wv4-section-title>span,.wv4-section-title.split>span{font-size:14px;line-height:1.6;color:var(--muted)}.wv4-finder{background:#fffdf9}.wv4-finder-card{max-width:1160px;margin:auto;border:1px solid var(--line);border-radius:26px;padding:28px;background:var(--paper);min-height:430px}.wv4-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.wv4-progress i{height:2px;background:#d8d1cb}.wv4-progress i.on{background:var(--wine)}.wv4-question{padding:52px 18px 18px}.wv4-question>small{font-size:10px;letter-spacing:.12em;color:var(--muted)}.wv4-question h3,.wv4-results h3{font:400 42px Georgia,serif;margin:12px 0 32px}.wv4-options{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.wv4-options button,.wv4-segments button{border:1px solid var(--line);background:#fffaf5;border-radius:14px;padding:18px 12px}.wv4-options button:hover,.wv4-segments button:hover,.wv4-segments button.active{background:var(--ink);color:white}.wv4-back{border:0;background:none;margin-top:22px;color:var(--muted)}.wv4-palette-options{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.wv4-palette-options button{border:1px solid var(--line);border-radius:16px;background:white;padding:14px;text-align:left}.wv4-palette-options button>span{display:flex;height:84px;overflow:hidden;border-radius:10px}.wv4-palette-options button>span i{flex:1}.wv4-palette-options b{display:block;margin:12px 0 3px}.wv4-palette-options small{color:var(--muted)}.wv4-result-head{display:flex;justify-content:space-between;align-items:start;padding:26px 10px 24px}.wv4-result-head h3{margin:8px 0}.wv4-result-head>button{border:0;background:none}.wv4-result-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.wv4-result-grid article{background:white;border:1px solid var(--line);border-radius:18px;overflow:hidden}.wv4-result-grid article>div:last-child{padding:18px}.wv4-result-grid span{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:var(--wine)}.wv4-result-grid h4{font:400 26px Georgia,serif;margin:8px 0}.wv4-result-grid p{font-size:12px;color:var(--muted);min-height:32px}.wv4-result-grid strong{display:block;margin:14px 0}.wv4-result-grid article button{width:100%;border:0;border-radius:999px;background:var(--ink);color:white;padding:12px}.wv4-visual{height:300px;position:relative;overflow:hidden;background:linear-gradient(145deg,#f4ebe5,#e7d7d3)}.wv4-visual-label{position:absolute;z-index:4;left:16px;top:14px;font:11px Arial,sans-serif;letter-spacing:.14em}.wv4-orbs{position:absolute;inset:20px}.wv4-orbs i{position:absolute;width:68px;height:86px;border-radius:50% 50% 48% 48%;box-shadow:inset -8px -10px 15px rgba(0,0,0,.07),inset 10px 8px 12px rgba(255,255,255,.23)}.wv4-orbs i:after{content:"";position:absolute;bottom:-4px;left:31px;border:4px solid transparent;border-top-color:currentColor}.wv4-number-shape{position:absolute;right:11%;top:21%;font:500 92px/1 Georgia,serif;color:#c4c9cd;text-shadow:0 5px 18px rgba(0,0,0,.16);z-index:3}.wv4-reveal-shape{position:absolute;width:145px;height:170px;border-radius:50%;right:16%;top:21%;display:grid;place-items:center;background:#f2eee4;font:500 70px Georgia;color:var(--wine);box-shadow:0 18px 40px rgba(0,0,0,.13)}.wv4-bubble-shape{position:absolute;width:140px;height:160px;border-radius:50%;right:17%;top:23%;display:grid;place-items:center;text-align:center;border:2px solid rgba(255,255,255,.7);background:rgba(255,255,255,.2);font:italic 17px Georgia;color:#453c39;backdrop-filter:blur(3px)}.wv4-family-tabs{display:flex;gap:8px;overflow:auto;padding-bottom:18px}.wv4-family-tabs button{white-space:nowrap;border:1px solid var(--line);border-radius:999px;background:transparent;padding:10px 15px}.wv4-family-tabs button.active{background:var(--ink);color:white}.wv4-product-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:30px 14px}.wv4-product{min-width:0}.wv4-product-visual{display:block;width:100%;border:0;padding:0;position:relative;overflow:hidden;border-radius:3px}.wv4-product-visual .wv4-visual{height:420px}.wv4-arrow{position:absolute;right:12px;bottom:12px;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:white}.wv4-product-meta{display:flex;width:100%;justify-content:space-between;gap:18px;border:0;background:none;text-align:left;padding:14px 2px}.wv4-product-meta small{color:var(--muted);font-size:10px}.wv4-product-meta h3{font:400 25px Georgia,serif;margin:4px 0}.wv4-product-meta p{font-size:12px;color:var(--muted);margin:0}.wv4-product-meta strong{white-space:nowrap;font-size:13px}.wv4-showall{display:block;margin:38px auto 0;border:1px solid var(--line);border-radius:999px;background:transparent;padding:13px 20px}.wv4-moods{background:#1a1918;color:white}.wv4-moods em{color:#e9cdd2}.wv4-moods .wv4-section-title>p{color:#d4cec9}.wv4-mood-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.wv4-mood-grid button{border:1px solid rgba(255,255,255,.17);border-radius:16px;background:#232221;color:white;text-align:left;padding:12px}.wv4-mood-grid button.active{outline:2px solid #e9cdd2}.wv4-mood-grid button>span{height:120px;display:flex;border-radius:10px;overflow:hidden}.wv4-mood-grid i{flex:1}.wv4-mood-grid b{display:block;margin:12px 0 3px}.wv4-mood-grid small{color:#aaa39e}.wv4-builder{min-height:830px;display:grid;grid-template-columns:1.06fr .94fr;background:#fffdf9}.wv4-builder-image{position:relative;overflow:hidden}.wv4-builder-image img{width:100%;height:100%;object-fit:cover;filter:saturate(.78)}.wv4-builder-image>div{position:absolute;left:34px;bottom:34px;background:rgba(247,243,239,.93);padding:22px 25px;max-width:330px}.wv4-builder-image small{display:block;margin-bottom:10px;color:var(--muted)}.wv4-builder-image b{font:400 30px Georgia,serif}.wv4-builder-panel{padding:80px 7vw}.wv4-builder-panel h2{font:400 50px/1 Georgia,serif;margin:0 0 40px}.wv4-builder-panel label{display:block;border-top:1px solid var(--line);padding:22px 0}.wv4-builder-panel label>span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.14em;margin-bottom:12px}.wv4-segments{display:flex;gap:8px;flex-wrap:wrap}.wv4-segments button{padding:11px 14px}.wv4-build-resolve{margin-top:24px;border-radius:16px;background:var(--paper);padding:22px;display:flex;flex-direction:column;gap:6px}.wv4-build-resolve>span{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}.wv4-build-resolve>b{font:400 26px Georgia}.wv4-build-resolve strong{font-size:20px;margin-top:8px}.wv4-build-resolve button{margin-top:10px;border:0;border-radius:999px;background:var(--ink);color:white;padding:13px}.wv4-editorial{min-height:690px;display:grid;grid-template-columns:1fr 1fr;background:#efe8e2}.wv4-editorial>div{padding:90px 7vw;display:flex;flex-direction:column;justify-content:center}.wv4-editorial h2{font:400 58px/1 Georgia;margin:0 0 24px}.wv4-editorial>div>span{max-width:540px;line-height:1.7;color:var(--muted)}.wv4-editorial button{align-self:start;margin-top:28px;border:0;border-bottom:1px solid var(--ink);background:none;padding:5px 0}.wv4-editorial img{width:100%;height:100%;object-fit:cover}.wv4-how{background:white}.wv4-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.wv4-steps article{border-top:1px solid var(--line);padding:26px 4px 40px}.wv4-steps article>span{font-size:10px;color:var(--wine)}.wv4-steps h3{font:400 32px Georgia;margin:15px 0}.wv4-steps p{color:var(--muted);line-height:1.6;font-size:13px}.wv4-faq{display:grid;grid-template-columns:1fr 1fr;gap:8px}.wv4-faq details{border:1px solid var(--line);border-radius:12px;padding:18px}.wv4-faq summary{cursor:pointer;font-weight:600}.wv4-faq p{color:var(--muted);font-size:13px;line-height:1.55}.wv4-footer{padding:70px 6vw;background:var(--paper);display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:30px;align-items:end;border-top:1px solid var(--line)}.wv4-footer>b{font:400 42px Georgia;letter-spacing:.08em}.wv4-footer p{margin:0;color:var(--wine);font:italic 22px Georgia}.wv4-footer div{display:flex;gap:14px;flex-wrap:wrap}.wv4-footer button{border:0;background:none;padding:0}.wv4-footer small{color:var(--muted)}.wv4-mobile-gift{display:none}.wv4-layer{position:fixed;inset:0;z-index:100}.wv4-backdrop{position:absolute;inset:0;border:0;background:rgba(17,15,14,.46);backdrop-filter:blur(5px)}.wv4-drawer{position:absolute;right:0;top:0;bottom:0;width:min(610px,100%);background:#fffdf9;padding:24px 26px 32px;overflow:auto;box-shadow:-20px 0 60px rgba(0,0,0,.12)}.wv4-drawer.checkout{width:min(650px,100%)}.wv4-drawer-head{display:flex;justify-content:space-between;gap:20px;margin-bottom:20px}.wv4-drawer-head small{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:var(--wine)}.wv4-drawer-head h2{font:400 42px Georgia;margin:5px 0}.wv4-drawer-head p{margin:0;color:var(--muted)}.wv4-drawer-head>button{border:0;background:none;font-size:30px;align-self:start}.wv4-drawer>.wv4-visual{height:330px;border-radius:14px;margin-bottom:24px}.wv4-config{padding:20px 0;border-top:1px solid var(--line)}.wv4-config>label{display:flex;justify-content:space-between;font-weight:600;margin-bottom:12px}.wv4-config>label small{font-weight:400;color:var(--muted)}.wv4-config-palettes{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.wv4-config-palettes button{border:1px solid var(--line);background:white;border-radius:10px;padding:7px}.wv4-config-palettes button.active{outline:2px solid var(--wine)}.wv4-config-palettes span{height:48px;display:flex;overflow:hidden;border-radius:6px}.wv4-config-palettes i{flex:1}.wv4-config-palettes small{display:block;margin-top:7px;font-size:9px}.wv4-foil{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.wv4-foil button{border:1px solid var(--line);background:white;border-radius:12px;padding:10px}.wv4-foil button.active{outline:2px solid var(--wine)}.wv4-foil i{display:block;height:50px;border-radius:8px;margin-bottom:8px}.wv4-number-input,.wv4-config textarea,.wv4-form input,.wv4-form textarea,.wv4-form select{width:100%;border:1px solid var(--line);border-radius:12px;background:white;padding:13px 14px;outline:none}.wv4-number-input{font:400 38px Georgia;text-align:center;letter-spacing:.18em}.wv4-error{display:block;color:#a1263c;font-size:11px;margin-top:8px}.wv4-secret{border-top:1px solid var(--line);padding:20px 0}.wv4-secret b{font:400 25px Georgia}.wv4-secret p{font-size:12px;color:var(--muted)}.wv4-addon{width:100%;display:flex;justify-content:space-between;border:1px solid var(--line);border-radius:12px;background:white;padding:14px}.wv4-addon.active{background:#f2e3e5;border-color:#b36573}.wv4-planned{display:block;color:var(--muted);font-size:10px;line-height:1.4;margin-top:10px}.wv4-add,.wv4-next{width:100%;border:0;border-radius:999px;background:var(--ink);color:white;padding:15px 18px;display:flex;justify-content:space-between}.wv4-add:disabled,.wv4-next:disabled{opacity:.35;cursor:not-allowed}.wv4-check-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:20px}.wv4-check-progress button{border:0;border-bottom:2px solid #ddd4cd;background:none;padding:10px 3px;font-size:10px;color:var(--muted)}.wv4-check-progress button.active{border-color:var(--wine);color:var(--ink)}.wv4-cart-lines article{display:flex;justify-content:space-between;gap:15px;padding:16px 0;border-bottom:1px solid var(--line)}.wv4-cart-lines article>div{display:flex;flex-direction:column;gap:3px}.wv4-cart-lines small{color:var(--muted);font-size:10px;white-space:pre-line}.wv4-cart-lines article>div>div{display:flex;align-items:center;gap:10px;margin-top:8px}.wv4-cart-lines article>div>div button{border:1px solid var(--line);background:white;border-radius:50%;width:28px;height:28px}.wv4-total{display:flex;justify-content:space-between;padding:22px 0;font-size:17px}.wv4-note{font-size:10px;color:var(--muted);line-height:1.5}.wv4-form{display:flex;flex-direction:column;gap:14px}.wv4-form label{font-size:11px;display:flex;flex-direction:column;gap:7px}.wv4-check-question>b{font:400 27px Georgia}.wv4-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.wv4-checkline{flex-direction:row!important;align-items:center}.wv4-checkline input{width:auto}.wv4-review{display:grid;grid-template-columns:90px 1fr auto;align-items:center;gap:8px;padding:14px;border:1px solid var(--line);border-radius:12px}.wv4-review span{font-size:10px;color:var(--muted)}.wv4-review b{font-size:12px}.wv4-review button{border:0;background:none;font-size:10px}.wv4-submit-error{background:#f7e2e5;color:#7b1d2e;border-radius:10px;padding:12px;font-size:12px}.wv4-empty,.wv4-success{padding:55px 10px;text-align:center}.wv4-empty p,.wv4-success p{color:var(--muted);line-height:1.6}.wv4-empty button,.wv4-success button,.wv4-success a{display:inline-block;border:0;border-radius:999px;background:var(--ink);color:white;padding:13px 18px;text-decoration:none;margin:5px}.wv4-success>span{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:var(--wine)}.wv4-success h3{font:400 42px Georgia;margin:15px}.wv4-success a{background:var(--wine)}
      @media(max-width:900px){.wv4-header{grid-template-columns:1fr auto;height:62px}.wv4-header nav{display:none}.wv4-hero{height:82svh;min-height:600px}.wv4-hero-copy{left:22px;right:22px;bottom:55px}.wv4-hero-copy h1{font-size:62px}.wv4-section{padding:78px 18px}.wv4-section-title.split{display:block}.wv4-options,.wv4-palette-options{grid-template-columns:1fr 1fr}.wv4-result-grid{grid-template-columns:1fr}.wv4-product-grid{grid-template-columns:1fr 1fr;gap:26px 8px}.wv4-product-visual .wv4-visual{height:300px}.wv4-mood-grid{grid-template-columns:1fr 1fr}.wv4-builder,.wv4-editorial{grid-template-columns:1fr}.wv4-builder-image{min-height:520px}.wv4-builder-panel{padding:60px 20px}.wv4-editorial img{height:480px}.wv4-steps{grid-template-columns:1fr}.wv4-faq{grid-template-columns:1fr}.wv4-footer{grid-template-columns:1fr 1fr}.wv4-mobile-gift{display:block;position:fixed;left:12px;right:12px;bottom:10px;z-index:70;border:0;border-radius:999px;background:var(--ink);color:white;padding:14px 18px;box-shadow:0 13px 35px rgba(0,0,0,.18)}.wv4-mobile-gift span{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:white;color:var(--ink);margin:0 4px}.wv4-live{display:none}}
      @media(max-width:560px){.wv4-hero-copy h1{font-size:54px}.wv4-hero-copy>span{font-size:14px}.wv4-hero-copy>div{flex-direction:column;align-items:start}.wv4-finder-card{padding:16px}.wv4-question{padding:36px 4px 4px}.wv4-question h3{font-size:34px}.wv4-palette-options{grid-template-columns:1fr 1fr}.wv4-palette-options button>span{height:64px}.wv4-result-head{display:block}.wv4-product-grid{grid-template-columns:1fr 1fr}.wv4-product-visual .wv4-visual{height:240px}.wv4-orbs i{width:56px;height:70px}.wv4-product-meta{display:block}.wv4-product-meta strong{display:block;margin-top:8px}.wv4-mood-grid button>span{height:90px}.wv4-builder-image{min-height:430px}.wv4-builder-panel h2,.wv4-editorial h2{font-size:42px}.wv4-config-palettes{grid-template-columns:1fr 1fr}.wv4-two{grid-template-columns:1fr}.wv4-drawer{padding:18px 16px 90px}.wv4-drawer-head h2{font-size:34px}.wv4-footer{grid-template-columns:1fr}.wv4-check-progress button{font-size:9px}.wv4-review{grid-template-columns:70px 1fr auto}}
    `}</style>
  </main>;
}
