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
          <p className="wk-eyebrow">WINK / Дополнения</p>
          <h1>Дополнение должно добавлять смысл, а не шум.</h1>
          <p>
            Личные детали, которые усиливают основной подарок, а не превращают
            его в случайный набор.
          </p>
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
            <p aria-live="polite">Смотрим, что действительно подходит…</p>
          ) : items.length && catalog.checkout_enabled ? (
            <AddonCards catalog={catalog} items={items} standalone />
          ) : (
            <div className="wk-gifts-empty">
              <p className="wk-eyebrow">Сначала смысл</p>
              <h2>Не добавляем ради добавления.</h2>
              <p>
                Надпись, палитра, бант или другой акцент имеет смысл только когда
                делает поздравление личнее. Начните с композиции — доступные
                дополнения покажем по месту.
              </p>
              <div className="wk-actions">
                <Link href="/shop" className="wk-button">
                  Выбрать основу
                </Link>
                <a
                  href={CONTACT_URL}
                  className="wk-button secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Обсудить деталь
                </a>
              </div>
            </div>
          )}
        </section>
      </main>
    </WinkPageFrame2026>
  );
}
