"use client";
import { useState } from "react";
import Link from "next/link";
import WinkPageFrame2026 from "./WinkPageFrame2026";
import { ProductCard } from "./WinkShopUI";
import { useWinkCatalog } from "@/lib/use-wink-catalog";
import { searchProducts } from "@/lib/wink-shop";
import { useWinkAddons } from "@/lib/use-wink-addons";
import { searchAddons } from "@/lib/wink-addons";
import { AddonCards } from "./WinkAddons";
export default function WinkSearch2026() {
  const { catalog } = useWinkCatalog();
  const { catalog: addons } = useWinkAddons();
  const [query, setQuery] = useState("");
  const giftResults = addons.checkout_enabled
    ? searchAddons(addons.items, query)
    : [];
  const results = searchProducts(catalog.products, query);
  return (
    <WinkPageFrame2026>
      <main>
        <section className="wk-catalog-head">
          <p className="wk-eyebrow">Поиск WINK</p>
          <h1>Что вам по душе?</h1>
          <label className="wk-field wk-search-field">
            <span className="wk-sr-only">Найти композицию</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Например: сердца, цифры или до 5 000 ₽"
            />
          </label>
          <div className="wk-chips">
            {["Сердца", "Цифры", "До 5 000 ₽", "С надписью", "Детям"].map(
              (text) => (
                <button key={text} onClick={() => setQuery(text)}>
                  {text}
                </button>
              ),
            )}
          </div>
        </section>
        <section className="wk-section wk-catalog-grid">
          <p className="wk-search-count" aria-live="polite">
            {query.trim()
              ? "Найдено вариантов: "
              : "Посмотрите эти композиции: "}
            {results.length + giftResults.length}
          </p>
          {results.length ? (
            <>
              <div className="wk-grid">
                {results.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
              <p className="wk-image-note">
                Визуализации передают настроение. Точный состав указан в
                карточке набора.
              </p>
            </>
          ) : !giftResults.length ? (
            <div className="wk-empty">
              <h2>Попробуем другие слова?</h2>
              <p>
                Можно искать по составу, поводу или цене. Например, «сердца до 5
                000».
              </p>
              <button className="wk-button" onClick={() => setQuery("")}>
                Сбросить поиск
              </button>
              <Link className="wk-button secondary" href="/#finder">
                Помочь с выбором
              </Link>
            </div>
          ) : null}
          {giftResults.length > 0 && (
            <AddonCards items={giftResults} catalog={addons} standalone />
          )}
        </section>
      </main>
    </WinkPageFrame2026>
  );
}
