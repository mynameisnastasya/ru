"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WinkPageFrame2026 from "@/components/WinkPageFrame2026";

const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const FAVORITES_KEY = "wink-favorites";
const HERO = "https://images.pexels.com/photos/30277077/pexels-photo-30277077.jpeg?auto=compress&cs=tinysrgb&w=1400";
const PINK = "https://images.pexels.com/photos/31840152/pexels-photo-31840152.jpeg?auto=compress&cs=tinysrgb&w=1400";
const NUMBER = "https://images.pexels.com/photos/31840097/pexels-photo-31840097.jpeg?auto=compress&cs=tinysrgb&w=1400";
const NIGHT = "https://images.pexels.com/photos/31840156/pexels-photo-31840156.jpeg?auto=compress&cs=tinysrgb&w=1400";

type Product = { id: string; slug: string; name: string; subtitle: string; base_price_minor: number };
type Catalog = { products: Product[] };

const FALLBACK: Product[] = [
  { id: "air16", slug: "air16", name: "AIR", subtitle: "16 шаров", base_price_minor: 349000 },
  { id: "birthday16-2", slug: "birthday16-2", name: "BIRTHDAY", subtitle: "16 шаров + 2 цифры", base_price_minor: 519000 },
  { id: "love16", slug: "love16", name: "LOVE", subtitle: "16 шаров + 2 сердца", base_price_minor: 429000 },
  { id: "hearts14", slug: "hearts14", name: "HEARTS", subtitle: "14 сердец", base_price_minor: 479000 },
  { id: "message16", slug: "message16", name: "MESSAGE", subtitle: "16 шаров + личная надпись", base_price_minor: 509000 },
  { id: "baby-reveal16", slug: "baby-reveal16", name: "BABY REVEAL", subtitle: "Шар-сюрприз + 16 шаров", base_price_minor: 629000 },
];

function money(value: number) { return `${new Intl.NumberFormat("ru-RU").format(Math.round(value / 100))} ₽`; }
function imageFor(product: Product) {
  if (product.name === "BIRTHDAY") return NUMBER;
  if (["LOVE", "HEARTS"].includes(product.name)) return PINK;
  if (["MESSAGE", "BABY REVEAL"].includes(product.name)) return NIGHT;
  return HERO;
}
function readFavorites() {
  try { return JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]") as string[]; }
  catch { return []; }
}

export default function WinkSearch2026() {
  const [products, setProducts] = useState<Product[]>(FALLBACK);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/api/catalog`).then((response) => {
      if (!response.ok) throw new Error("catalog");
      return response.json() as Promise<Catalog>;
    }).then((data) => {
      if (active && Array.isArray(data.products) && data.products.length) setProducts(data.products);
    }).catch(() => undefined);
    const timer = window.setTimeout(() => setFavorites(readFavorites()), 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products.slice(0, 8);
    return products.filter((product) => {
      const searchable = `${product.name} ${product.subtitle}`.toLowerCase();
      if (searchable.includes(normalized)) return true;
      if (normalized.includes("циф")) return product.name === "BIRTHDAY";
      if (normalized.includes("серд")) return ["HEARTS", "LOVE"].includes(product.name);
      if (normalized.includes("девуш") || normalized.includes("роз")) return ["LOVE", "HEARTS", "MESSAGE", "BIRTHDAY"].includes(product.name);
      if (normalized.includes("реб")) return ["BIRTHDAY", "AIR", "MESSAGE", "BABY REVEAL"].includes(product.name);
      const amount = normalized.match(/(\d[\d\s]*)/);
      if (amount) {
        const rubles = Number(amount[1].replace(/\s/g, ""));
        if (rubles > 1000) return product.base_price_minor <= rubles * 100;
      }
      return false;
    }).slice(0, 12);
  }, [products, query]);

  function toggleFavorite(slug: string) {
    setFavorites((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  return <WinkPageFrame2026>
    <main className="wsearch26">
      <section className="wsearch26-hero"><p>Поиск WINK</p><h1>Что ищем?</h1><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например: девушке, цифры или до 5 000 ₽"/><div>{["Розовые сердца", "Цифры", "До 5 000 ₽", "Для девушки", "Детям"].map((chip) => <button key={chip} onClick={() => setQuery(chip)}>{chip}</button>)}</div></section>
      <section className="wsearch26-results"><div className="wsearch26-head"><div><p>{query ? "Результаты" : "Сейчас выбирают"}</p><h2>{results.length ? `${results.length} подходящих вариантов` : "Такого в матрице пока нет"}</h2></div><span>Поиск не заполняется случайными товарами: если совпадения нет, WINK так и говорит.</span></div>
        {results.length ? <div className="wsearch26-grid">{results.map((product) => <article key={product.slug}><button className={`wsearch26-heart ${favorites.includes(product.slug) ? "on" : ""}`} onClick={() => toggleFavorite(product.slug)} aria-label={favorites.includes(product.slug) ? "Убрать из избранного" : "Добавить в избранное"}>♡</button><Link href={`/product/${product.slug}`}><div className="wsearch26-media"><img src={imageFor(product)} alt={product.subtitle}/></div><small>{product.name}</small><h3>{product.subtitle}</h3><strong>{money(product.base_price_minor)}</strong></Link></article>)}</div> : <div className="wsearch26-empty"><h3>Не будем подсовывать что-нибудь похожее просто ради выдачи.</h3><p>Попробуйте другой запрос или откройте короткий каталог из реальных композиций.</p><div><Link href="/shop">Открыть каталог</Link><Link href="/#finder">Быстрый подбор</Link></div></div>}
      </section>
    </main>
    <style jsx global>{`
      .wsearch26{--milk:#f7f3ee;--white:#fffdfc;--ink:#242222;--blush:#e5c8ce;--line:rgba(36,34,34,.13);min-height:70vh;background:var(--milk);color:var(--ink)}.wsearch26-hero{padding:110px max(64px,calc((100vw - 1400px)/2)) 80px;background:var(--white)}.wsearch26-hero>p,.wsearch26-head p{font-size:10px;text-transform:uppercase;letter-spacing:.15em;margin:0 0 15px;color:#817873}.wsearch26-hero h1{font:400 clamp(54px,6vw,88px)/.95 "Instrument Serif",Georgia,serif;letter-spacing:-.055em;margin:0 0 30px}.wsearch26-hero input{display:block;width:min(100%,1000px);border:0;border-bottom:1px solid var(--ink);background:transparent;padding:16px 0;font-size:24px;outline:none}.wsearch26-hero>div{display:flex;flex-wrap:wrap;gap:7px;margin-top:22px}.wsearch26-hero button{border:1px solid var(--line);background:var(--milk);border-radius:999px;padding:10px 13px;cursor:pointer}.wsearch26-results{padding:90px max(64px,calc((100vw - 1400px)/2)) 120px}.wsearch26-head{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;margin-bottom:40px}.wsearch26-head h2{font:400 42px/1 "Instrument Serif",Georgia,serif;letter-spacing:-.04em;margin:0}.wsearch26-head>span{max-width:430px;color:#756d68;font-size:13px;line-height:1.55}.wsearch26-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:38px 12px}.wsearch26-grid article{position:relative}.wsearch26-grid a{color:inherit;text-decoration:none}.wsearch26-media{aspect-ratio:4/5;overflow:hidden;background:#e8dfd9}.wsearch26-media img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.82);transition:transform .4s}.wsearch26-grid article:hover img{transform:scale(1.02)}.wsearch26-grid small{display:block;font-size:10px;color:#817873;margin:13px 0 4px}.wsearch26-grid h3{font-size:18px;margin:0 0 8px}.wsearch26-grid strong{font-size:14px}.wsearch26-heart{position:absolute;right:10px;top:10px;z-index:3;width:38px;height:38px;border-radius:50%;border:0;background:rgba(255,253,252,.94);font-size:21px;cursor:pointer}.wsearch26-heart.on{background:var(--blush)}.wsearch26-empty{max-width:760px;background:var(--white);padding:48px}.wsearch26-empty h3{font:400 34px/1.05 "Instrument Serif",Georgia,serif;margin:0 0 14px}.wsearch26-empty p{color:#756d68;line-height:1.6}.wsearch26-empty div{display:flex;gap:18px;margin-top:25px}.wsearch26-empty a{color:inherit;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:3px;font-size:12px}
      @media(max-width:850px){.wsearch26-hero,.wsearch26-results{padding:64px 18px}.wsearch26-hero input{font-size:18px}.wsearch26-head{display:block}.wsearch26-head>span{display:block;margin-top:14px}.wsearch26-grid{grid-template-columns:1fr 1fr;gap:28px 8px}.wsearch26-empty{padding:30px 20px}}
    `}</style>
  </WinkPageFrame2026>;
}
