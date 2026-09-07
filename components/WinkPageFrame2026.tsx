"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { CONTACT_URL, SHOP_EVENT, money, readCart } from "@/lib/wink-shop";
import { ShopDialog, ShopIcon } from "./WinkShopUI";
import WinkOrderShortcut from "./WinkOrderShortcut";
import { WINK_DEMO } from "@/lib/wink-mode";

export default function WinkPageFrame2026({
  children,
}: {
  children: ReactNode;
}) {
  const path = usePathname().replace(/\/$/, "") || "/";
  const [menu, setMenu] = useState(false);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const sync = () => {
      try {
        setTotal(
          readCart().reduce(
            (sum, line) => sum + line.qty * line.unitPriceMinor,
            0,
          ),
        );
        setCount(readCart().reduce((sum, line) => sum + line.qty, 0));
      } catch {
        setCount(0);
      }
    };
    sync();
    window.addEventListener(SHOP_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHOP_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const navigation = [
    ["/shop", "Композиции"],
    ["/occasion/birthday", "День рождения"],
    ["/room", "Для комнаты"],
    ["/gifts", "Подарки"],
    ["/delivery", "Доставка"],
  ];
  return (
    <div className="wk-shell wps26">
      {WINK_DEMO && (
        <div className="wk-announcement" role="note">
          ДЕМО · Заказы не отправляются, оплаты нет.
          <span>Дополнения, цены на них и остатки — тестовые.</span>
        </div>
      )}
      <a className="wk-skip" href="#main-content">
        Перейти к содержимому
      </a>
      <div className="wk-announcement">
        Красивые поздравления с доставкой по Кемерову{" "}
        <span>Собираем с заботой о вашем моменте</span>
      </div>
      <header className="wk-header">
        <Link href="/" className="wk-wordmark" aria-label="WINK — главная">
          WINK<span>;</span>
        </Link>
        <nav aria-label="Основная навигация">
          {navigation.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="wk-header-tools">
          <Link className="wk-icon-button" href="/search" aria-label="Поиск">
            <ShopIcon name="search" />
          </Link>
          <Link
            className="wk-icon-button wk-desktop-heart"
            href="/favorites"
            aria-label="Избранное"
          >
            <ShopIcon name="heart" />
          </Link>
          <Link
            className="wk-icon-button wk-bag"
            href="/checkout"
            aria-label={`Корзина, товаров: ${count}`}
          >
            <ShopIcon name="bag" />
            {count > 0 && <span>{count}</span>}
          </Link>
          <button
            className="wk-icon-button wk-menu-toggle"
            onClick={() => setMenu(true)}
            aria-label="Открыть меню"
            aria-expanded={menu}
          >
            <ShopIcon name="menu" />
          </button>
        </div>
      </header>
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <footer className="wk-footer">
        <div>
          <Link href="/" className="wk-wordmark">
            WINK<span>;</span>
          </Link>
          <p>
            Когда хочется
            <br />
            сделать красиво.
          </p>
          <span>Шары и поздравления · Кемерово</span>
        </div>
        <div>
          <h2>Выбрать</h2>
          <Link href="/shop">Все композиции</Link>
          <Link href="/for-her">Для неё</Link>
          <Link href="/for-him">Для него</Link>
          <Link href="/kids">Детям</Link>
          <Link href="/build">Собрать свой набор</Link>
        </div>
        <div>
          <h2>Остаёмся рядом</h2>
          <Link href="/delivery">Доставка и оплата</Link>
          <Link href="/faq">Вопросы и ответы</Link>
          <Link href="/about">О WINK</Link>
          <Link href="/account">Важные даты</Link>
          <WinkOrderShortcut />
          <Link href="/corporate">Для компаний</Link>
        </div>
        <div className="wk-footer-contact">
          <h2>Поможем выбрать</h2>
          <p>Напишите, кого поздравляем и когда. Подскажем, с чего начать.</p>
          <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
            Написать в Telegram <ShopIcon name="arrow" />
          </a>
        </div>
        <div className="wk-footer-bottom">
          <span>WINK · С любовью к деталям</span>
          <Link href="/favorites">Сохранённые композиции</Link>
        </div>
      </footer>
      {!path.replace(/\/$/, "").endsWith("/checkout") && (
        <nav className="wk-bottom-nav" aria-label="Мобильная навигация">
          {[
            ["/", "Главная", "home"],
            ["/shop", "Каталог", "search"],
            ["/favorites", "Избранное", "heart"],
            ["/checkout", count ? money(total) : "Корзина", "bag"],
          ].map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
            >
              <ShopIcon name={icon as "home" | "search" | "heart" | "bag"} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      )}
      <ShopDialog open={menu} onClose={() => setMenu(false)} title="WINK">
        <nav className="wk-mobile-links">
          {[
            ...navigation,
            ["/for-her", "Для неё"],
            ["/for-him", "Для него"],
            ["/kids", "Детям"],
            ["/build", "Собрать свой"],
            ["/account", "Важные даты"],
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setMenu(false)}>
              {label}
              <ShopIcon name="arrow" />
            </Link>
          ))}
        </nav>
        <a
          className="wk-button"
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Помочь с выбором
        </a>
      </ShopDialog>
    </div>
  );
}
