"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import WinkPageFrame2026 from "./WinkPageFrame2026";
import { ProductCard, ShopDialog } from "./WinkShopUI";
import {
  FAMILY_NAMES,
  PALETTES,
  budgetMatches,
  displayPrice,
  kemerovoDate,
  paletteIds,
  saveDelivery,
  validDeliveryDate,
} from "@/lib/wink-shop";
import { useWinkCatalog } from "@/lib/use-wink-catalog";

export default function WinkCatalog2026() {
  const { catalog, status } = useWinkCatalog();
  const query = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateError, setDateError] = useState("");
  const format = query.get("format") || "";
  const palette = PALETTES[query.get("palette") || ""]
    ? query.get("palette")!
    : "";
  const budget = query.get("budget") || "";
  const recipient = query.get("recipient") || "";
  const sort = query.get("sort") || "selection";
  const date = query.get("date") || "";
  useEffect(() => {
    if (date && validDeliveryDate(date)) {
      try {
        saveDelivery({ date });
      } catch {}
    }
  }, [date]);
  function update(key: string, value: string) {
    const next = new URLSearchParams(query.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(path + (next.size ? "?" + next.toString() : ""), {
      scroll: false,
    });
  }
  function chooseDate(value: string) {
    setDateError("");
    if (value && !validDeliveryDate(value)) {
      setDateError("Выберите сегодняшнюю или будущую дату.");
      return;
    }
    update("date", value);
    try {
      saveDelivery({ date: value });
    } catch {
      setDateError(
        "Не удалось сохранить дату. Её можно указать при оформлении.",
      );
    }
  }
  const products = useMemo(
    () =>
      catalog.products
        .filter(
          (p) =>
            (!format || p.name === format) &&
            budgetMatches(displayPrice(p, palette), budget) &&
            (!palette ||
              (p.name !== "HEARTS" && paletteIds(p).includes(palette))) &&
            (recipient === "him" || recipient === "kids"
              ? ["AIR", "BIRTHDAY", "MESSAGE"].includes(p.name)
              : true),
        )
        .sort((a, b) =>
          sort === "asc"
            ? displayPrice(a, palette) - displayPrice(b, palette)
            : sort === "desc"
              ? displayPrice(b, palette) - displayPrice(a, palette)
              : 0,
        ),
    [catalog.products, format, palette, budget, recipient, sort],
  );
  const filterCount = [format, palette, budget, date, recipient].filter(
    Boolean,
  ).length;
  function fields() {
    return (
      <>
        <label className="wk-field">
          Формат
          <select
            value={format}
            onChange={(e) => update("format", e.target.value)}
          >
            <option value="">Все решения</option>
            {Object.entries(FAMILY_NAMES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="wk-field">
          Настроение
          <select
            value={palette}
            onChange={(e) => update("palette", e.target.value)}
          >
            <option value="">Любая палитра</option>
            {Object.entries(PALETTES).map(([value, p]) => (
              <option key={value} value={value}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="wk-field">
          Бюджет
          <select
            value={budget}
            onChange={(e) => update("budget", e.target.value)}
          >
            <option value="">Любой</option>
            <option value="5000">До 5 000 ₽</option>
            <option value="7500">До 7 500 ₽</option>
          </select>
        </label>
        <label className="wk-field">
          Если дата уже известна
          <input
            type="date"
            min={kemerovoDate()}
            value={date}
            onChange={(e) => chooseDate(e.target.value)}
          />
        </label>
      </>
    );
  }
  return (
    <WinkPageFrame2026>
      <main>
        <section className="wk-catalog-head">
          <p className="wk-eyebrow">Готовые решения · Кемерово</p>
          <h1>Мы уже выбрали красивое.</h1>
          <p>
            Короткая матрица WINK вместо бесконечного каталога: понятный
            визуальный результат, фиксированная цена и персонализация там, где
            она действительно нужна. Не хотите сравнивать — пройдите WINK MATCH.
          </p>
          <div className="wk-chips">
            {[
              ["", "Все решения"],
              ["BIRTHDAY", "День рождения"],
              ["LOVE", "С любовью"],
              ["AIR", "Просто порадовать"],
              ["MESSAGE", "Личные слова"],
            ].map(([value, label]) => (
              <button
                key={label}
                aria-pressed={format === value}
                className={format === value ? "active" : ""}
                onClick={() => update("format", value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
        <section className="wk-catalog-controls" aria-label="Фильтры каталога">
          {fields()}
          <button
            className="wk-button secondary wk-catalog-filter-toggle"
            onClick={() => setFiltersOpen(true)}
          >
            Уточнить выбор{filterCount ? ` · ${filterCount}` : ""}
          </button>
          {filterCount > 0 && (
            <button
              className="wk-text-button"
              onClick={() => {
                router.replace(path, { scroll: false });
                setDateError("");
                try {
                  saveDelivery({ date: "", mode: "" });
                } catch {}
              }}
            >
              Сбросить
            </button>
          )}
        </section>
        <div className="wk-catalog-toolbar">
          <span aria-live="polite">Найдено: {products.length}</span>
          <label>
            Порядок{" "}
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="selection">Выбор WINK</option>
              <option value="asc">Сначала доступнее</option>
              <option value="desc">Сначала масштабнее</option>
            </select>
          </label>
        </div>
        <section className="wk-section wk-catalog-grid">
          {dateError && (
            <p className="wk-error" role="alert">
              {dateError}
            </p>
          )}
          {date && (
            <p className="wk-status-note">
              Запомнили желаемую дату: {date.split("-").reverse().join(".")}.
              Возможность и стоимость доставки подтвердим до оплаты.
            </p>
          )}
          <div className="wk-grid">
            {products.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                palette={palette || undefined}
              />
            ))}
          </div>
          {!products.length && (
            <div className="wk-empty">
              <h2>Не будем заставлять вас искать бесконечно.</h2>
              <p>
                Под этот набор условий готового решения нет. Сбросьте один
                фильтр — или дайте WINK четыре ответа, и мы покажем ближайшие
                варианты.
              </p>
              <button
                className="wk-button"
                onClick={() => router.replace(path, { scroll: false })}
              >
                Показать все решения
              </button>
              <Link className="wk-button secondary" href="/#finder">
                Подобрать за 4 ответа
              </Link>
            </div>
          )}
          <p className="wk-image-note">
            Изображения показывают визуальное направление коллекции. Точный
            состав, цена и доступная персонализация зафиксированы в карточке
            решения. Доставка считается отдельно.
          </p>
          {status === "reference" && (
            <p className="wk-status-note">
              Сейчас показываем базовую витрину. Актуальную стоимость и
              доступность подтвердим перед оформлением.
            </p>
          )}
        </section>
        <ShopDialog
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          title="Что важно для вашего поздравления"
        >
          {fields()}
          <button className="wk-button" onClick={() => setFiltersOpen(false)}>
            Показать решения · {products.length}
          </button>
        </ShopDialog>
      </main>
    </WinkPageFrame2026>
  );
}
