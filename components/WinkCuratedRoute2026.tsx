"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WinkPageFrame2026 from "@/components/WinkPageFrame2026";

const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const HERO = "https://images.pexels.com/photos/30277077/pexels-photo-30277077.jpeg?auto=compress&cs=tinysrgb&w=1500";
const PINK = "https://images.pexels.com/photos/31840152/pexels-photo-31840152.jpeg?auto=compress&cs=tinysrgb&w=1500";
const NUMBER = "https://images.pexels.com/photos/31840097/pexels-photo-31840097.jpeg?auto=compress&cs=tinysrgb&w=1500";
const NIGHT = "https://images.pexels.com/photos/31840156/pexels-photo-31840156.jpeg?auto=compress&cs=tinysrgb&w=1500";

type Mode = "birthday" | "love" | "kids" | "wow" | "build";
type Config = Record<string, unknown>;
type Product = { id: string; slug: string; name: string; subtitle: string; base_price_minor: number; config: Config };
type Catalog = { products: Product[] };

const FALLBACK: Product[] = [
  ["air16", "AIR", "Воздушный сет · 16 шаров", 349000, { latex_count: 16 }], ["air30", "AIR", "Воздушный сет · 30 шаров", 559000, { latex_count: 30 }],
  ["birthday16-1", "BIRTHDAY", "16 шаров + 1 цифра", 439000, { latex_count: 16, digit_count: 1 }], ["birthday16-2", "BIRTHDAY", "16 шаров + 2 цифры", 519000, { latex_count: 16, digit_count: 2 }],
  ["birthday30-1", "BIRTHDAY", "30 шаров + 1 цифра", 659000, { latex_count: 30, digit_count: 1 }], ["birthday30-2", "BIRTHDAY", "30 шаров + 2 цифры", 729000, { latex_count: 30, digit_count: 2 }],
  ["love16", "LOVE", "16 шаров + 2 сердца", 429000, { latex_count: 16, heart_count: 2 }], ["love30", "LOVE", "30 шаров + 4 сердца", 689000, { latex_count: 30, heart_count: 4 }],
  ["hearts7", "HEARTS", "7 шаров в форме сердца", 279000, { heart_count: 7 }], ["hearts14", "HEARTS", "14 шаров в форме сердца", 479000, { heart_count: 14 }],
  ["message16", "MESSAGE", "16 шаров + прозрачный шар с надписью", 509000, { latex_count: 16 }], ["message30", "MESSAGE", "30 шаров + прозрачный шар с надписью", 729000, { latex_count: 30 }],
  ["baby-reveal-solo", "BABY REVEAL", "Шар-сюрприз", 339000, {}], ["baby-reveal16", "BABY REVEAL", "Шар-сюрприз + 16 шаров", 629000, { latex_count: 16 }],
].map(([slug, name, subtitle, price, config]) => ({ id: String(slug), slug: String(slug), name: String(name), subtitle: String(subtitle), base_price_minor: Number(price), config: config as Config }));

const LABEL: Record<string, string> = { AIR: "Шары", BIRTHDAY: "С цифрами", LOVE: "Шары + сердца", HEARTS: "Сердца", MESSAGE: "Личная надпись", "BABY REVEAL": "Baby reveal" };
function f(p: Product) { return p.name.toUpperCase(); }
function n(c: Config, key: string) { const value = c[key]; return typeof value === "number" ? value : Number(value || 0); }
function money(v: number) { return `${new Intl.NumberFormat("ru-RU").format(Math.round(v / 100))} ₽`; }
function image(p: Product) { if (f(p) === "BIRTHDAY") return NUMBER; if (["LOVE", "HEARTS"].includes(f(p))) return PINK; if (["MESSAGE", "BABY REVEAL"].includes(f(p))) return NIGHT; return HERO; }
function copy(mode: Mode) {
  if (mode === "birthday") return ["День рождения", "Красиво поздравить — без переписки на двадцать сообщений.", "Цифры, готовые сеты и личные надписи. Вы выбираете масштаб и настроение — остальное собираем мы."];
  if (mode === "love") return ["Любовь", "Для того самого «это всё мне?»", "Сердца, готовые сочетания и личные слова. Романтично, но без обязательного визуального сахара."];
  if (mode === "kids") return ["Детям", "Детский праздник, но красиво.", "Возраст, мягкая палитра и понятный масштаб. Без разноцветного party-shop и бесконечного выбора персонажей."];
  if (mode === "wow") return ["WOW", "Когда нужен большой жест.", "Большие реальные композиции и сценарий комнаты. Никакого отдельного ROOM-SKU, пока не утверждены рецептура, цена и capacity."];
  return ["Собрать свой", "Вы выбираете главное. Техническое — наше.", "Формат, масштаб и личная деталь. Только комбинации, которые реально существуют в производстве."];
}

export default function WinkCuratedRoute2026({ mode }: { mode: Mode }) {
  const [products, setProducts] = useState<Product[]>(FALLBACK);
  useEffect(() => { let active = true; fetch(`${API_URL}/api/catalog`).then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<Catalog>; }).then(data => { if (active && data.products?.length) setProducts(data.products); }).catch(() => undefined); return () => { active = false; }; }, []);
  if (mode === "build") return <Builder products={products} />;
  const filtered = products.filter(p => {
    const family = f(p);
    if (mode === "birthday") return ["BIRTHDAY", "AIR", "MESSAGE"].includes(family);
    if (mode === "love") return ["LOVE", "HEARTS", "MESSAGE", "AIR"].includes(family);
    if (mode === "kids") return ["BIRTHDAY", "AIR", "MESSAGE"].includes(family);
    return n(p.config, "latex_count") >= 30 || p.slug === "hearts14" || p.slug === "baby-reveal16";
  });
  const [eyebrow, title, description] = copy(mode);
  return <WinkPageFrame2026><main className="wcur26"><section className="wcur26-hero"><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span><div><Link href="/#finder">Подберите мне</Link><Link href="/shop">Весь каталог</Link></div></section><section className="wcur26-grid">{filtered.map(product => <Link href={`/product/${product.slug}`} key={product.slug} className="wcur26-card"><figure><img src={image(product)} alt={product.subtitle} /></figure><small>{LABEL[f(product)]}</small><h2>{product.subtitle}</h2><div><strong>{money(product.base_price_minor)}</strong><span>Дату подтвердим</span></div></Link>)}</section>{mode === "wow" && <section className="wcur26-editorial"><div><p>Оформление комнаты</p><h2>Проснуться внутри праздника.</h2><span>Комната — отдельная услуга. Вы выбираете стиль, а финальный состав, монтаж, время и цену подтверждаем после операционного расчёта.</span><Link href="/room">Смотреть оформление</Link></div><img src={HERO} alt="Оформление комнаты WINK" /></section>}<section className="wcur26-note"><p>Не уверены?</p><h2>Три варианта лучше тридцати.</h2><Link href="/#finder">Запустить подборщик →</Link></section></main><Styles /></WinkPageFrame2026>;
}

function Builder({ products }: { products: Product[] }) {
  const [family, setFamily] = useState("AIR");
  const [size, setSize] = useState(16);
  const [digits, setDigits] = useState(1);
  const selected = useMemo(() => products.find(p => {
    if (f(p) !== family) return false;
    if (family === "BIRTHDAY") return n(p.config, "latex_count") === size && n(p.config, "digit_count") === digits;
    if (["AIR", "LOVE", "MESSAGE"].includes(family)) return n(p.config, "latex_count") === size;
    if (family === "HEARTS") return n(p.config, "heart_count") === size;
    if (family === "BABY REVEAL") return size === 16 ? p.slug === "baby-reveal16" : p.slug === "baby-reveal-solo";
    return false;
  }) || null, [products, family, size, digits]);
  const formats = ["AIR", "BIRTHDAY", "LOVE", "MESSAGE", "HEARTS", "BABY REVEAL"];
  function changeFamily(value: string) { setFamily(value); setDigits(1); setSize(value === "HEARTS" ? 7 : value === "BABY REVEAL" ? 0 : 16); }
  return <WinkPageFrame2026><main className="wcur26"><section className="wcur26-hero"><p>Собрать свой</p><h1>Вы выбираете главное.<br/>Техническое — наше.</h1><span>Не свободный конструктор из 84 цветов, а короткий путь к одному из реальных WINK-составов.</span></section><section className="wcur26-builder"><div><small>01</small><h2>Формат</h2><div className="wcur26-options">{formats.map(value => <button key={value} className={family === value ? "active" : ""} onClick={() => changeFamily(value)}>{LABEL[value]}</button>)}</div></div><div><small>02</small><h2>Масштаб</h2><div className="wcur26-options">{family === "HEARTS" ? [7, 14].map(value => <button key={value} className={size === value ? "active" : ""} onClick={() => setSize(value)}>{value} сердец</button>) : family === "BABY REVEAL" ? <><button className={size === 0 ? "active" : ""} onClick={() => setSize(0)}>Только сюрприз</button><button className={size === 16 ? "active" : ""} onClick={() => setSize(16)}>Сюрприз + 16</button></> : [16, 30].map(value => <button key={value} className={size === value ? "active" : ""} onClick={() => setSize(value)}>{value} шаров</button>)}</div></div>{family === "BIRTHDAY" && <div><small>03</small><h2>Цифры</h2><div className="wcur26-options">{[1, 2].map(value => <button key={value} className={digits === value ? "active" : ""} onClick={() => setDigits(value)}>{value}</button>)}</div></div>}<div className="wcur26-result"><small>Ваш WINK</small>{selected ? <><h2>{selected.subtitle}</h2><strong>{money(selected.base_price_minor)}</strong><Link href={`/product/${selected.slug}`}>Настроить этот вариант</Link></> : <><h2>Такой комбинации нет.</h2><p>Именно здесь WINK берёт сложность на себя — непроизводимый сет не попадёт в заказ.</p></>}</div></section></main><Styles /></WinkPageFrame2026>;
}

function Styles() { return <style jsx global>{`
  .wcur26{--milk:#F7F3EE;--white:#FFFDFC;--graphite:#242222;--blush:#E5C8CE;--cocoa:#5A403E;--line:rgba(36,34,34,.13);background:var(--milk);color:var(--graphite);min-height:70vh}.wcur26 button{font:inherit}.wcur26-hero{max-width:1400px;margin:auto;padding:100px 0 62px}.wcur26-hero>p,.wcur26-editorial p,.wcur26-note p{font-size:10px;text-transform:uppercase;letter-spacing:.15em}.wcur26-hero h1{font-size:clamp(50px,6vw,82px);letter-spacing:-.06em;line-height:.92;margin:14px 0 20px;max-width:1040px}.wcur26-hero>span{display:block;max-width:720px;color:#746c68;font-size:17px;line-height:1.65}.wcur26-hero>div{display:flex;gap:8px;margin-top:30px}.wcur26-hero>div a{padding:14px 17px;background:var(--graphite);color:white}.wcur26-hero>div a+ a{background:transparent;color:var(--graphite);border:1px solid var(--line)}.wcur26-grid{max-width:1400px;margin:0 auto 120px;display:grid;grid-template-columns:repeat(4,1fr);gap:42px 12px}.wcur26-card figure{margin:0 0 13px;aspect-ratio:4/5;overflow:hidden;background:#e6ddd7}.wcur26-card img{width:100%;height:100%;object-fit:cover;filter:saturate(.82);transition:.35s}.wcur26-card:hover img{transform:scale(1.015)}.wcur26-card small{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#7b726d}.wcur26-card h2{font-size:18px;font-weight:500;margin:5px 0 12px}.wcur26-card>div{display:flex;justify-content:space-between;gap:10px}.wcur26-card span{font-size:10px;color:#857b75}.wcur26-card strong{font-size:13px}.wcur26-editorial{display:grid;grid-template-columns:1fr 1fr;background:var(--white);min-height:650px}.wcur26-editorial>div{padding:90px max(50px,calc((100vw - 1400px)/2));display:flex;flex-direction:column;justify-content:center}.wcur26-editorial h2{font-size:50px;letter-spacing:-.05em;line-height:1;margin:12px 0 20px}.wcur26-editorial span{color:#746c68;line-height:1.65}.wcur26-editorial a{align-self:flex-start;margin-top:26px;border-bottom:1px solid currentColor}.wcur26-editorial img{width:100%;height:100%;object-fit:cover}.wcur26-note{max-width:1400px;margin:auto;padding:100px 0}.wcur26-note h2{font-size:48px;letter-spacing:-.05em;margin:10px 0 20px}.wcur26-note a{border-bottom:1px solid currentColor}.wcur26-builder{max-width:1100px;margin:0 auto 120px;background:var(--white);border:1px solid var(--line)}.wcur26-builder>div{padding:30px;border-bottom:1px solid var(--line)}.wcur26-builder small{font-size:9px;color:#817873}.wcur26-builder h2{font-size:30px;margin:10px 0 20px}.wcur26-options{display:flex;gap:7px;flex-wrap:wrap}.wcur26-options button{border:1px solid var(--line);background:var(--milk);padding:13px 16px;cursor:pointer}.wcur26-options button.active{background:var(--graphite);color:white}.wcur26-result{background:#ece2dc}.wcur26-result strong{display:block;font-size:22px;margin-bottom:20px}.wcur26-result a{display:inline-block;background:var(--graphite);color:white;padding:15px 18px}.wcur26-result p{color:#746c68}
  @media(max-width:1450px){.wcur26-hero,.wcur26-grid,.wcur26-note{margin-left:24px;margin-right:24px}}
  @media(max-width:900px){.wcur26-hero{margin:0;padding:62px 18px 38px}.wcur26-hero h1{font-size:45px}.wcur26-hero>div{flex-direction:column;align-items:stretch}.wcur26-hero>div a{text-align:center}.wcur26-grid{margin:0 18px 78px;grid-template-columns:1fr 1fr;gap:30px 8px}.wcur26-card h2{font-size:15px}.wcur26-card>div{display:block}.wcur26-card span{display:block;margin-top:5px}.wcur26-editorial{grid-template-columns:1fr}.wcur26-editorial>div{padding:65px 18px}.wcur26-editorial h2{font-size:36px}.wcur26-editorial img{height:460px}.wcur26-note{margin:0;padding:72px 18px}.wcur26-note h2{font-size:36px}.wcur26-builder{margin:0 18px 80px}.wcur26-builder>div{padding:24px 18px}.wcur26-builder h2{font-size:26px}}
`}</style>; }
