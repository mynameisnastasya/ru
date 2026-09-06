"use client";

import Link from "next/link";
import { useEffect } from "react";
import WinkOrderShortcut from "@/components/WinkOrderShortcut";
import WinkStorefrontV4 from "@/components/WinkStorefrontV4";

function openGiftBag() {
  document.querySelector<HTMLButtonElement>(".wv4-bag")?.click();
}

export default function WinkRootShell() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("bag") !== "1") return;

    const timer = window.setTimeout(() => {
      openGiftBag();
      const cleanUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, "", cleanUrl);
    }, 120);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        .wv4-header{display:none!important}
        .wv4{padding-top:96px}
        .wink-root-shell{position:fixed;inset:0 0 auto 0;z-index:90;height:68px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 26px;border-bottom:1px solid rgba(23,22,21,.10);background:rgba(248,245,240,.95);backdrop-filter:blur(18px);color:#171615;font-family:Inter,Arial,sans-serif}
        .wink-root-shell a,.wink-root-shell button{color:inherit;text-decoration:none;font:inherit}
        .wink-root-shell__nav{display:flex;align-items:center;gap:18px;font-size:11px;letter-spacing:.015em}
        .wink-root-shell__nav a{opacity:.72;transition:opacity .2s ease}
        .wink-root-shell__nav a:hover{opacity:1}
        .wink-root-shell__brand{font-family:"Instrument Serif",Georgia,serif;font-size:33px;line-height:1;letter-spacing:-.045em}
        .wink-root-shell__brand span{font-family:Inter,Arial,sans-serif;font-size:20px}
        .wink-root-shell__right{display:flex;align-items:center;justify-content:flex-end;gap:16px;font-size:11px}
        .wink-root-shell__bag{border:1px solid rgba(23,22,21,.24);border-radius:999px;background:transparent;padding:9px 13px;cursor:pointer;font-size:11px;letter-spacing:.01em}
        .wink-brand-promise{position:fixed;inset:68px 0 auto 0;z-index:89;height:28px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid rgba(23,22,21,.08);background:#171615;color:#f8f5f0;font:500 9px/1 Inter,Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase}
        .wink-brand-promise span{opacity:.92}
        @media(max-width:900px){
          .wink-root-shell{height:60px;padding:0 14px;grid-template-columns:1fr auto 1fr}.wv4{padding-top:86px}
          .wink-brand-promise{top:60px;height:26px;font-size:8px;letter-spacing:.09em}
          .wink-root-shell__nav{gap:10px}.wink-root-shell__nav a:nth-child(n+3){display:none}
          .wink-root-shell__right a{display:none}.wink-root-shell__brand{font-size:28px}.wink-root-shell__bag{padding:8px 10px}
        }
      `}</style>
      <header className="wink-root-shell" aria-label="Навигация WINK">
        <nav className="wink-root-shell__nav">
          <Link href="/shop">Каталог</Link>
          <Link href="/occasion/birthday">День рождения</Link>
          <Link href="/occasion/love">Любовь</Link>
          <Link href="/kids">Дети</Link>
        </nav>
        <Link href="/" className="wink-root-shell__brand" aria-label="WINK — главная">WINK<span>.</span></Link>
        <div className="wink-root-shell__right">
          <Link href="/wow">WOW</Link>
          <Link href="/build">Собрать свой</Link>
          <button className="wink-root-shell__bag" type="button" onClick={openGiftBag}>Корзина</button>
        </div>
      </header>
      <div className="wink-brand-promise"><span>WINK — когда надо красиво поздравить</span></div>
      <WinkStorefrontV4 />
      <WinkOrderShortcut />
    </>
  );
}
