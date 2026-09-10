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
            <option value="">Все композиции</option>
            {Object.entries(FAMILY_NAMES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="wk-field">
          Палитра
          <select
            value={palette}
            onChange={(e) => update("palette", e.target.value)}
          >
            <option value="">Все сочетания</option>
            {Object.entries(PALETTES).map(([value, p]) => (
              <option key={value} value={value}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="wk-field">
          Бюджет на подарок
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
          Желаемая дата
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
          <p className="wk-eyebrow">WINK · готовые решения · Кемерово</p>
          <h1>Красивое уже отобрано.</h1>
          <p>
            Сначала выберите повод или формат. В карточке — точный состав, цена,
            палитры и персонализация. Не хочется сравнивать — быстрый подбор
            оставит до двух вариантов.
          </p>
          <div className="wk-chips">
            {[
              ["", "Все"],
              ["BIRTHDAY", "День рождения"],
              ["HEARTS", "Сердца"],
              ["AIR", "Воздушные сеты"],
              ["MESSAGE", "С надписью"],
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
            Фильтры{filterCount ? ` · ${filterCount}` : ""}
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
          <span aria-live="polite">{products.length} решений</span>
          <label>
            Порядок{" "}
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="selection">Подборка WINK</option>
              <option value="asc">Сначала дешевле</option>
              <option value="desc">Сначала дороже</option>
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
              Желаемая дата: {date.split("-").reverse().join(".")}. Возможность
              и стоимость доставки согласуем до оплаты.
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
              <h2>Не будем притягивать неподходящий вариант.</h2>
              <p>
                С этим сочетанием условий готового решения пока нет. Уберите один
                фильтр — или ответьте на четыре вопроса, и WINK сузит выбор за вас.
              </p>
              <button
                className="wk-button"
                onClick={() => router.replace(path, { scroll: false })}
              >
                Сбросить фильтры
              </button>
              <Link className="wk-button secondary" href="/#finder">
                Подобрать 2 варианта
              </Link>
            </div>
          )}
          <p className="wk-image-note">
            Изображения показывают визуальный характер коллекции, а не обещают
            точную копию. Состав, количество и доступные оттенки фиксируем в
            карточке. Доставка оплачивается отдельно.
          </p>
          {status === "reference" && (
            <p className="wk-status-note">
              Показываем базовые цены. Актуальную стоимость и доступность
              подтвердим при оформлении.
            </p>
          )}
        </section>
        <ShopDialog
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          title="Что важно для подарка"
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
