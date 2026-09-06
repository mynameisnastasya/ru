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

export default function WinkFavorites2026() {
  const [products, setProducts] = useState<Product[]>(FALLBACK);
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

  const selected = useMemo(() => products.filter((product) => favorites.includes(product.slug)), [products, favorites]);

  function remove(slug: string) {
    setFavorites((current) => {
      const next = current.filter((item) => item !== slug);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  return <WinkPageFrame2026>
    <main className="wfav26"><section className="wfav26-head"><p>Сохранённое</p><h1>Избранное</h1><span>Сохраняется на этом устройстве без регистрации. Никакого фальшивого аккаунта ради одной кнопки-сердечка.</span></section>
      <section className="wfav26-body">{selected.length ? <div className="wfav26-grid">{selected.map((product) => <article key={product.slug}><button onClick={() => remove(product.slug)} aria-label="Убрать из избранного">×</button><Link href={`/product/${product.slug}`}><div><img src={imageFor(product)} alt={product.subtitle}/></div><small>{product.name}</small><h2>{product.subtitle}</h2><strong>{money(product.base_price_minor)}</strong></Link></article>)}</div> : <div className="wfav26-empty"><h2>Пока пусто.</h2><p>Найдите 2–3 варианта, которые нравятся, и сохраните сердечком. WINK не требует регистрации ради избранного.</p><div><Link href="/search">Найти подарок</Link><Link href="/shop">Открыть каталог</Link></div></div>}</section>
    </main>
    <style jsx global>{`
      .wfav26{--milk:#f7f3ee;--white:#fffdfc;--ink:#242222;--line:rgba(36,34,34,.13);min-height:70vh;background:var(--milk);color:var(--ink)}.wfav26-head{padding:110px max(64px,calc((100vw - 1400px)/2)) 55px;background:var(--white)}.wfav26-head>p{font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:#817873;margin:0 0 16px}.wfav26-head h1{font:400 clamp(56px,6vw,88px)/.95 "Instrument Serif",Georgia,serif;letter-spacing:-.055em;margin:0}.wfav26-head>span{display:block;max-width:650px;color:#756d68;line-height:1.6;margin-top:22px}.wfav26-body{padding:65px max(64px,calc((100vw - 1400px)/2)) 120px}.wfav26-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:38px 12px}.wfav26-grid article{position:relative}.wfav26-grid article>button{position:absolute;z-index:3;right:10px;top:10px;width:38px;height:38px;border:0;border-radius:50%;background:rgba(255,253,252,.94);font-size:22px;cursor:pointer}.wfav26-grid a{color:inherit;text-decoration:none}.wfav26-grid a>div{aspect-ratio:4/5;overflow:hidden;background:#e8dfd9}.wfav26-grid img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.82);transition:transform .4s}.wfav26-grid article:hover img{transform:scale(1.02)}.wfav26-grid small{display:block;font-size:10px;color:#817873;margin:13px 0 4px}.wfav26-grid h2{font-size:18px;margin:0 0 8px}.wfav26-grid strong{font-size:14px}.wfav26-empty{max-width:720px;padding:48px;background:var(--white);border:1px solid var(--line)}.wfav26-empty h2{font:400 40px/1 "Instrument Serif",Georgia,serif;margin:0 0 14px}.wfav26-empty p{color:#756d68;line-height:1.6}.wfav26-empty div{display:flex;gap:18px;margin-top:24px}.wfav26-empty a{color:inherit;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:3px;font-size:12px}@media(max-width:850px){.wfav26-head,.wfav26-body{padding:64px 18px}.wfav26-grid{grid-template-columns:1fr 1fr;gap:28px 8px}.wfav26-empty{padding:30px 20px}}
    `}</style>
  </WinkPageFrame2026>;
}
