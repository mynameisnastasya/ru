"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import WinkHome2026 from "@/components/WinkHome2026";
import WinkOrderShortcut from "@/components/WinkOrderShortcut";
import WinkStorefrontV4 from "@/components/WinkStorefrontV4";

function openGiftBag() {
  document.querySelector<HTMLButtonElement>(".wv4-bag")?.click();
}

function NavIcon({ type }: { type: "search" | "heart" | "user" | "bag" | "menu" | "close" }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {type === "search" && <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>}
    {type === "heart" && <path d="M20.3 5.7a5 5 0 0 0-7.1 0L12 6.9l-1.2-1.2a5 5 0 1 0-7.1 7.1L12 21l8.3-8.2a5 5 0 0 0 0-7.1Z"/>}
    {type === "user" && <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>}
    {type === "bag" && <><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></>}
    {type === "menu" && <><path d="M4 8h16"/><path d="M4 16h16"/></>}
    {type === "close" && <><path d="m5 5 14 14"/><path d="M19 5 5 19"/></>}
  </svg>;
}

export default function WinkRootShell() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncScroll = () => setScrolled(window.scrollY > 24);
    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });

    const params = new URLSearchParams(window.location.search);
    let timer: number | undefined;
    if (params.get("bag") === "1") {
      timer = window.setTimeout(() => {
        openGiftBag();
        const cleanUrl = `${window.location.pathname}${window.location.hash}`;
        window.history.replaceState({}, "", cleanUrl);
      }, 180);
    }

    return () => {
      window.removeEventListener("scroll", syncScroll);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return <>
    <header className={`wink26-header ${scrolled ? "scrolled" : ""}`} aria-label="Навигация WINK">
      <Link href="/" className="wink26-logo" aria-label="WINK — главная">WINK</Link>
      <nav className="wink26-nav">
        <div className="wink26-megaWrap"><Link href="/shop">Каталог</Link><div className="wink26-mega"><div><small>По формату</small><Link href="/shop">Шары</Link><Link href="/shop">Цифры</Link><Link href="/occasion/love">Сердца</Link><Link href="/room">Комната</Link><Link href="/gifts">Подарки</Link></div><div><small>По поводу</small><Link href="/occasion/birthday">День рождения</Link><Link href="/occasion/love">Любовь</Link><Link href="/kids">Детский праздник</Link><Link href="/for-her">Для неё</Link><Link href="/for-him">Для него</Link></div><Link href="/shop" className="wink26-megaVisual"><span>Сейчас выбирают →</span></Link></div></div>
        <Link href="/occasion/birthday">Поводы</Link>
        <Link href="/gifts">Подарки</Link>
        <Link href="/room">Оформление</Link>
        <Link href="/about">О нас</Link>
      </nav>
      <div className="wink26-tools">
        <Link href="/search" aria-label="Поиск"><NavIcon type="search"/></Link>
        <Link href="/favorites" aria-label="Избранное"><NavIcon type="heart"/></Link>
        <Link href="/account" aria-label="Личный кабинет"><NavIcon type="user"/></Link>
        <button onClick={openGiftBag} aria-label="Корзина"><NavIcon type="bag"/></button>
        <button className="wink26-menuButton" onClick={() => setMenuOpen(true)} aria-label="Открыть меню"><NavIcon type="menu"/></button>
      </div>
    </header>

    {menuOpen && <div className="wink26-mobileMenu" role="dialog" aria-label="Меню WINK">
      <div className="wink26-mobileTop"><Link href="/" onClick={() => setMenuOpen(false)}>WINK</Link><button onClick={() => setMenuOpen(false)} aria-label="Закрыть меню"><NavIcon type="close"/></button></div>
      <nav><Link href="/shop" onClick={() => setMenuOpen(false)}>Каталог</Link><Link href="/for-her" onClick={() => setMenuOpen(false)}>Для неё</Link><Link href="/for-him" onClick={() => setMenuOpen(false)}>Для него</Link><Link href="/kids" onClick={() => setMenuOpen(false)}>Детям</Link><Link href="/room" onClick={() => setMenuOpen(false)}>Оформление комнаты</Link><Link href="/gifts" onClick={() => setMenuOpen(false)}>Подарки</Link></nav>
      <div className="wink26-mobileMeta"><Link href="/delivery" onClick={() => setMenuOpen(false)}>Доставка и оплата</Link><Link href="/faq" onClick={() => setMenuOpen(false)}>FAQ</Link><span>Instagram · Telegram</span></div>
    </div>}

    <WinkHome2026 />

    <div className="wink-commerce-engine" aria-hidden="true"><WinkStorefrontV4 /></div>
    <WinkOrderShortcut />

    <style jsx global>{`
      .wink26-header{position:fixed;z-index:95;left:0;right:0;top:0;height:74px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 max(28px,calc((100vw - 1400px)/2));color:white;border-bottom:1px solid rgba(255,255,255,.18);background:linear-gradient(rgba(20,17,16,.18),transparent);transition:background .25s ease,color .25s ease,border-color .25s ease,backdrop-filter .25s ease;font-family:Inter,Arial,sans-serif}.wink26-header.scrolled{background:rgba(247,243,238,.94);color:#242222;border-color:rgba(36,34,34,.11);backdrop-filter:blur(18px)}.wink26-header a{color:inherit;text-decoration:none}.wink26-logo{font:400 34px/1 "Instrument Serif",Georgia,serif;letter-spacing:-.035em;justify-self:start}.wink26-nav{display:flex;height:74px;align-items:center;gap:28px;font-size:12px}.wink26-nav>a,.wink26-megaWrap>a{opacity:.9}.wink26-tools{justify-self:end;display:flex;align-items:center;gap:14px}.wink26-tools>a,.wink26-tools>button{border:0;background:transparent;color:inherit;width:28px;height:34px;padding:5px;display:grid;place-items:center;cursor:pointer}.wink26-tools svg,.wink26-mobileTop svg{width:20px;height:20px}.wink26-menuButton{display:none!important}.wink26-megaWrap{height:74px;display:flex;align-items:center}.wink26-mega{visibility:hidden;opacity:0;pointer-events:none;position:fixed;left:50%;top:70px;transform:translateX(-50%) translateY(-5px);width:min(960px,calc(100vw - 80px));background:#fffdfc;color:#242222;border:1px solid rgba(36,34,34,.12);padding:34px;display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:46px;box-shadow:0 24px 70px rgba(33,27,25,.12);transition:.18s ease}.wink26-megaWrap:hover .wink26-mega,.wink26-mega:focus-within{visibility:visible;opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}.wink26-mega>div{display:flex;flex-direction:column;gap:10px}.wink26-mega small{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:#8a7f79;margin-bottom:8px}.wink26-mega a{font-size:14px}.wink26-megaVisual{min-height:230px;position:relative;background:url("https://images.pexels.com/photos/31840152/pexels-photo-31840152.jpeg?auto=compress&cs=tinysrgb&w=900") center/cover}.wink26-megaVisual:after{content:"";position:absolute;inset:45% 0 0;background:linear-gradient(transparent,rgba(25,20,19,.65))}.wink26-megaVisual span{position:absolute;z-index:2;left:18px;bottom:16px;color:white;font-size:12px}.wink26-mobileMenu{position:fixed;z-index:120;inset:0;background:#f7f3ee;color:#242222;padding:18px;display:flex;flex-direction:column;font-family:Inter,Arial,sans-serif}.wink26-mobileTop{height:44px;display:flex;align-items:center;justify-content:space-between}.wink26-mobileTop>a{font:400 31px/1 "Instrument Serif",Georgia,serif;color:inherit;text-decoration:none}.wink26-mobileTop button{border:0;background:transparent;padding:8px}.wink26-mobileMenu>nav{display:flex;flex-direction:column;margin-top:46px}.wink26-mobileMenu>nav a{color:inherit;text-decoration:none;font-size:30px;letter-spacing:-.035em;padding:11px 0;border-bottom:1px solid rgba(36,34,34,.12)}.wink26-mobileMeta{margin-top:auto;display:flex;flex-direction:column;gap:12px;font-size:13px;padding-bottom:20px}.wink26-mobileMeta a{color:inherit;text-decoration:none}.wink26-mobileMeta span{color:#7e746f}.wink-commerce-engine>.wv4{min-height:0!important;padding:0!important;background:transparent!important}.wink-commerce-engine>.wv4>:not(.wv4-layer):not(style){display:none!important}.wink-commerce-engine .wv4-mobile-gift{display:none!important}
      @media(max-width:980px){.wink26-header{height:62px;padding:0 16px;grid-template-columns:1fr auto;color:white}.wink26-header.scrolled{color:#242222}.wink26-nav{display:none}.wink26-logo{font-size:30px}.wink26-tools>a:nth-child(2),.wink26-tools>a:nth-child(3){display:none}.wink26-menuButton{display:grid!important}.wink26-tools{gap:8px}.wink26-tools>a,.wink26-tools>button{width:28px}.wink26-header .wink26-tools>a:first-child{display:grid}}
    `}</style>
  </>;
}
