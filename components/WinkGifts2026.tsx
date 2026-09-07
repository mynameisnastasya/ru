"use client";
import Link from "next/link";
import { useState } from "react";
import { useWinkAddons } from "@/lib/use-wink-addons";
import { AddonCards } from "./WinkAddons";
import WinkPageFrame2026 from "./WinkPageFrame2026";
import { CONTACT_URL } from "@/lib/wink-shop";
export default function WinkGifts2026() {
  const { catalog, loading } = useWinkAddons();
  const [filter, setFilter] = useState("");
  const items = catalog.items.filter(
    (a) =>
      a.status === "ACTIVE" &&
      a.show_in_catalog &&
      (!filter ||
        a.compatible_audience.includes(filter) ||
        a.compatible_occasions.includes(filter)),
  );
  return (
    <WinkPageFrame2026>
      <main>
        <section className="wk-catalog-head">
          <p className="wk-eyebrow">WINK / Подарки</p>
          <h1>Дополнить подарок.</h1>
          <p>Маленькие вещи, которые остаются с вами после праздника.</p>
          <div className="wk-chips">
            {[
              ["", "Все"],
              ["her", "Для неё"],
              ["child", "Для ребёнка"],
              ["baby", "Welcome baby"],
              ["big_gesture", "Большой жест"],
            ].map(([v, l]) => (
              <button
                key={v}
                aria-pressed={filter === v}
                onClick={() => setFilter(v)}
              >
                {l}
              </button>
            ))}
          </div>
        </section>
        <section className="wk-section">
          {loading ? (
            <p aria-live="polite">Подбираем личные детали…</p>
          ) : items.length && catalog.checkout_enabled ? (
            <AddonCards catalog={catalog} items={items} standalone />
          ) : (
            <div className="wk-gifts-empty">
              <p className="wk-eyebrow">Пусть будет по-вашему</p>
              <h2>Начнём с самого личного.</h2>
              <p>
                Надпись на шаре, любимая палитра, акцент из бантов. Уже можно
                выбрать то, что сделает поздравление вашим.
              </p>
              <div className="wk-actions">
                <Link href="/shop?format=MESSAGE" className="wk-button">
                  Выбрать композицию
                </Link>
                <a
                  href={CONTACT_URL}
                  className="wk-button secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Обсудить дополнения
                </a>
              </div>
            </div>
          )}
        </section>
      </main>
    </WinkPageFrame2026>
  );
}
