"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import WinkPageFrame2026 from "./WinkPageFrame2026";
import { ProductCard } from "./WinkShopUI";
import { useWinkCatalog } from "@/lib/use-wink-catalog";
import { SHOP_EVENT, readFavorites } from "@/lib/wink-shop";
export default function WinkFavorites2026() {
  const { catalog } = useWinkCatalog();
  const [favorites, setFavorites] = useState<string[] | null>(null);
  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    sync();
    window.addEventListener(SHOP_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHOP_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const products = catalog.products.filter((p) => favorites?.includes(p.slug));
  return (
    <WinkPageFrame2026>
      <main>
        <section className="wk-catalog-head">
          <p className="wk-eyebrow">Сохранено для вас</p>
          <h1>К этому хочется вернуться.</h1>
          <p>
            Ваш короткий список. Палитру и личные детали можно выбрать в
            карточке.
          </p>
        </section>
        <section className="wk-section wk-catalog-grid">
          {favorites === null ? (
            <p>Открываем избранное…</p>
          ) : products.length ? (
            <>
              <div className="wk-grid">
                {products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
              <p className="wk-image-note">
                Визуализации передают настроение. Точный состав указан в
                карточке набора.
              </p>
            </>
          ) : (
            <div className="wk-empty">
              <h2>Пока чистый лист.</h2>
              <p>Нажмите сердечко у композиции — она появится здесь.</p>
              <Link className="wk-button" href="/shop">
                Выбрать красивое
              </Link>
            </div>
          )}
        </section>
      </main>
    </WinkPageFrame2026>
  );
}
