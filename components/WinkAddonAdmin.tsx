"use client";
import { useEffect, useState } from "react";
import { Addon } from "@/lib/wink-addons";
import { createClientId, money } from "@/lib/wink-shop";
// These are public product defaults; finance is requested separately, only for Owner.
import { ADDON_DEFAULTS } from "@/lib/wink-addon-defaults";
type Api = <T>(path: string, init?: RequestInit) => Promise<T>;
type Row = {
  operations_data?: Record<string, string | number | boolean>;
  product: Addon;
  revision: number;
  stock_quantity: number;
  minimum_stock: number;
  reserved_quantity: number;
};
type Data = {
  items: Row[];
  products: { slug: string; name: string; subtitle: string }[];
  recommendations: {
    main_slug: string;
    addon_ids: string[];
    revision: number;
  }[];
  checkout_enabled: boolean;
};
const listFields: { key: keyof Addon; label: string }[] = [
  { key: "collections", label: "Коллекции" },
  { key: "search_keywords", label: "Поисковые слова" },
  { key: "compatible_products", label: "Совместимые композиции · slug" },
  { key: "compatible_categories", label: "Категории · AIR, BIRTHDAY, LOVE…" },
  { key: "compatible_palettes", label: "Палитры · MILK, PINK_MILK…" },
  { key: "compatible_occasions", label: "Поводы" },
  { key: "compatible_audience", label: "Аудитории" },
];
export default function WinkAddonAdmin({
  api,
  role,
}: {
  api: Api;
  role: string;
}) {
  const [data, setData] = useState<Data | null>(null),
    [selected, setSelected] = useState<Row | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState(""),
    [main, setMain] = useState(""),
    [recs, setRecs] = useState<string[]>([]),
    [drag, setDrag] = useState<number | null>(null),
    [finance, setFinance] = useState<{
      cost_price_minor: number;
      variable_cost_minor: number;
      minimum_margin: number;
      supplier_data: Record<string, unknown>;
    } | null>(null),
    [history, setHistory] = useState<
      { created_at: string; cost_price_minor: number }[]
    >([]),
    [metrics, setMetrics] = useState<{
      summary: {
        paid_orders: number;
        attached_orders: number;
        addon_revenue_minor: number;
        addon_gross_profit_minor: number;
        missing_cost_snapshots: number;
      };
      pairs: {
        main_sku_snapshot: string;
        sku_snapshot: string;
        purchase_context: string;
        quantity: number;
      }[];
    } | null>(null);
  async function load() {
    const next = await api<Data>("/api/admin/addons");
    setData(next);
    return next;
  }
  useEffect(() => {
    let active = true;
    api<Data>("/api/admin/addons")
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active)
          setError(
            "Раздел дополнений ещё не подключён к API. Изменения не сохранялись.",
          );
      });
    return () => {
      active = false;
    };
  }, [api]);
  function select(row: Row) {
    setSelected(structuredClone(row));
    setFinance(null);
    setHistory([]);
    setError("");
    setNotice("");
  }
  function set<K extends keyof Addon>(key: K, value: Addon[K]) {
    setSelected((r) =>
      r ? { ...r, product: { ...r.product, [key]: value } } : r,
    );
  }
  async function save() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const product = selected.product;
      await api("/api/admin/addons", {
        method: "PUT",
        body: JSON.stringify({ ...selected, product }),
      });
      const next = await load();
      const saved = next.items.find(
        (r) => r.product.id === selected.product.id,
      );
      if (saved) select(saved);
      setNotice("Товар сохранён.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить.");
    } finally {
      setBusy(false);
    }
  }
  function move(from: number, to: number) {
    if (to < 0 || to >= recs.length) return;
    const next = [...recs];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setRecs(next);
  }
  async function saveRecs() {
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/addons/recommendations", {
        method: "PUT",
        body: JSON.stringify({
          main_slug: main,
          addon_ids: recs,
          revision:
            data?.recommendations.find((r) => r.main_slug === main)?.revision ||
            0,
        }),
      });
      await load();
      setNotice("Порядок рекомендаций сохранён.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить.");
    } finally {
      setBusy(false);
    }
  }
  async function openFinance() {
    if (!selected) return;
    try {
      const result = await api<{
        finance: typeof finance;
        history: typeof history;
      }>(`/api/admin/addons/${selected.product.id}/finance`);
      setFinance(
        result.finance || {
          cost_price_minor: 0,
          variable_cost_minor: 0,
          minimum_margin: 50,
          supplier_data: {},
        },
      );
      setHistory(result.history);
    } catch (e) {
      setError(String(e));
    }
  }
  async function saveFinance() {
    if (!selected || !finance) return;
    try {
      await api(`/api/admin/addons/${selected.product.id}/finance`, {
        method: "PUT",
        body: JSON.stringify(finance),
      });
      await openFinance();
      setNotice("Закупка сохранена в истории.");
    } catch (e) {
      setError(String(e));
    }
  }
  const p = selected?.product;
  return (
    <section className="wk-addon-admin">
      <div className="wk-admin-toolbar">
        <h2>Каталог → Дополнения</h2>
        <button
          onClick={() =>
            select({
              product: {
                ...ADDON_DEFAULTS,
                id: createClientId(),
                sku: "",
                slug: "",
                name: "",
              },
              revision: 0,
              stock_quantity: 0,
              minimum_stock: 0,
              reserved_quantity: 0,
            })
          }
        >
          Новый товар
        </button>
        <select
          aria-label="Фильтр дополнений"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Все типы</option>
          {[
            "SOFT_TOY",
            "CARD",
            "HANDMADE",
            "FLOWERS",
            "SWEETS",
            "SERVICE",
            "BUNDLE",
          ].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {role === "OWNER" && (
          <button
            onClick={() =>
              api<typeof metrics>("/api/admin/addons/metrics")
                .then(setMetrics)
                .catch((e) => setError(String(e)))
            }
          >
            Аналитика
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="wk-error">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {data && !data.checkout_enabled && (
        <p className="wk-admin-note">
          Каталог можно подготовить. Продажи дополнений включаются после
          подключения обработчиков заказа, резерва и оплаты.
        </p>
      )}
      {metrics && (
        <div className="wk-admin-metrics">
          <p>
            Attach Rate:{" "}
            {metrics.summary.paid_orders
              ? Math.round(
                  (100 * metrics.summary.attached_orders) /
                    metrics.summary.paid_orders,
                )
              : 0}
            % · Заказов с дополнениями: {metrics.summary.attached_orders}
          </p>
          <p>
            Выручка: {money(Number(metrics.summary.addon_revenue_minor))} ·
            Валовая прибыль:{" "}
            {money(Number(metrics.summary.addon_gross_profit_minor))}
          </p>
          {metrics.summary.missing_cost_snapshots > 0 && (
            <p>
              Для {metrics.summary.missing_cost_snapshots} позиций нет снимка
              себестоимости. Прибыль посчитана только по известным затратам.
            </p>
          )}
          <p>
            Средняя сумма дополнений:{" "}
            {money(
              metrics.summary.attached_orders
                ? Number(metrics.summary.addon_revenue_minor) /
                    metrics.summary.attached_orders
                : 0,
            )}
          </p>
          <table>
            <thead>
              <tr>
                <th>Основной SKU</th>
                <th>Дополнение</th>
                <th>Контекст</th>
                <th>Продано</th>
              </tr>
            </thead>
            <tbody>
              {metrics.pairs.map((r, i) => (
                <tr key={i}>
                  <td>{r.main_sku_snapshot || "Отдельно"}</td>
                  <td>{r.sku_snapshot}</td>
                  <td>{r.purchase_context}</td>
                  <td>{r.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="wk-admin-grid">
        <div className="wk-admin-list">
          {data?.items
            .filter(
              (r) =>
                !filter ||
                r.product.subtype === filter ||
                r.product.product_type === filter,
            )
            .map((row) => (
              <button
                key={row.product.id}
                className={
                  selected?.product.id === row.product.id ? "active" : ""
                }
                onClick={() => select(row)}
              >
                <strong>{row.product.name}</strong>
                <span>
                  {row.product.sku} · {row.product.status}
                </span>
                <span>
                  {row.product.price_minor
                    ? money(row.product.price_minor)
                    : "Цена не подтверждена"}{" "}
                  · Доступно {row.stock_quantity - row.reserved_quantity}
                </span>
                {row.product.stock_type === "TRACKED" &&
                  row.stock_quantity - row.reserved_quantity <=
                    row.minimum_stock && <small>Нужно заказать</small>}
              </button>
            ))}
        </div>
        {p && selected ? (
          <div className="wk-admin-editor">
            <h3>{p.name || "Новое дополнение"}</h3>
            <div className="wk-admin-fields">
              {(
                [
                  ["name", "Название"],
                  ["short_name", "Короткое название"],
                  ["sku", "SKU"],
                  ["slug", "Адрес страницы"],
                  ["subtype", "Подтип · SOFT_TOY, CARD, CANDLE…"],
                  ["category", "Категория"],
                  ["subcategory", "Подкатегория"],
                  ["color", "Цвет"],
                  ["material", "Материал"],
                  ["age_restriction", "Возраст"],
                  ["care_info", "Уход"],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    value={p[key]}
                    onChange={(e) => set(key, e.target.value)}
                  />
                </label>
              ))}
              <label>
                Тип
                <select
                  value={p.product_type}
                  onChange={(e) =>
                    set("product_type", e.target.value as Addon["product_type"])
                  }
                >
                  {["ADDON", "SERVICE", "BUNDLE"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Статус
                <select
                  value={p.status}
                  onChange={(e) =>
                    set("status", e.target.value as Addon["status"])
                  }
                >
                  {["DRAFT", "ACTIVE", "HIDDEN", "ARCHIVED"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Цена · ₽
                <input
                  type="number"
                  min="0"
                  value={p.price_minor === null ? "" : p.price_minor / 100}
                  onChange={(e) =>
                    set(
                      "price_minor",
                      e.target.value === ""
                        ? null
                        : Math.round(Number(e.target.value) * 100),
                    )
                  }
                />
              </label>
              <label>
                Размер · см
                <input
                  type="number"
                  min="0"
                  value={p.size_cm ?? ""}
                  onChange={(e) =>
                    set(
                      "size_cm",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                />
              </label>
              <label>
                Остаток
                <input
                  type="number"
                  min={selected.reserved_quantity}
                  value={selected.stock_quantity}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      stock_quantity: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Минимальный остаток
                <input
                  type="number"
                  min="0"
                  value={selected.minimum_stock}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      minimum_stock: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Склад
                <select
                  value={p.stock_type}
                  onChange={(e) =>
                    set("stock_type", e.target.value as Addon["stock_type"])
                  }
                >
                  <option value="TRACKED">Со склада</option>
                  <option value="MADE_TO_ORDER">Под заказ</option>
                </select>
              </label>
              <label>
                Изготовление · дней
                <input
                  type="number"
                  min="0"
                  value={p.production_days}
                  onChange={(e) =>
                    set("production_days", Number(e.target.value))
                  }
                />
              </label>
              <label>
                Доставка
                <select
                  value={p.delivery_class}
                  onChange={(e) =>
                    set(
                      "delivery_class",
                      e.target.value as Addon["delivery_class"],
                    )
                  }
                >
                  {["STANDARD", "LARGE", "OVERSIZED"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Доплата за персонализацию · ₽
                <input
                  type="number"
                  min="0"
                  value={p.personalization_price_minor / 100}
                  onChange={(e) =>
                    set(
                      "personalization_price_minor",
                      Math.round(Number(e.target.value) * 100),
                    )
                  }
                />
              </label>
            </div>
            <label>
              Короткое описание
              <textarea
                value={p.short_description}
                onChange={(e) => set("short_description", e.target.value)}
              />
            </label>
            <label>
              Полное описание
              <textarea
                value={p.full_description}
                onChange={(e) => set("full_description", e.target.value)}
              />
            </label>
            <div className="wk-admin-checks">
              {(
                [
                  ["show_in_catalog", "Показывать в подарках"],
                  ["allow_standalone", "Можно купить отдельно"],
                  ["allow_as_addon", "Можно добавить к композиции"],
                  ["allow_in_bundles", "Можно включать в наборы"],
                  ["personalization_enabled", "Персонализация"],
                  ["is_wink_original", "WINK ORIGINAL"],
                  ["bestseller", "Бестселлер"],
                  [
                    "non_returnable_to_stock",
                    "Не возвращать на склад после персонализации",
                  ],
                ] as const
              ).map(([k, label]) => (
                <label key={k}>
                  <input
                    type="checkbox"
                    checked={p[k]}
                    onChange={(e) => set(k, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="wk-admin-fields">
              {listFields.map(({ key, label }) => (
                <label key={key}>
                  {label}
                  <input
                    key={p.id + key}
                    defaultValue={(p[key] as string[]).join(", ")}
                    onBlur={(e) =>
                      set(
                        key,
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </label>
              ))}
            </div>
            <details>
              <summary>Фотографии</summary>
              {p.images.map((image, i) => (
                <div className="wk-admin-fields" key={i}>
                  <label>
                    Ссылка на фото
                    <input
                      type="url"
                      value={image.url}
                      onChange={(e) =>
                        set(
                          "images",
                          p.images.map((x, j) =>
                            j === i ? { ...x, url: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Описание фотографии
                    <input
                      value={image.alt}
                      onChange={(e) =>
                        set(
                          "images",
                          p.images.map((x, j) =>
                            j === i ? { ...x, alt: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Роль
                    <select
                      value={image.role}
                      onChange={(e) =>
                        set(
                          "images",
                          p.images.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  role: e.target.value as typeof image.role,
                                }
                              : x,
                          ),
                        )
                      }
                    >
                      {[
                        "MAIN",
                        "LIFESTYLE",
                        "WITH_BALLOONS",
                        "HUMAN",
                        "DETAIL",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={() =>
                      set(
                        "images",
                        p.images.filter((_, j) => i !== j),
                      )
                    }
                  >
                    Удалить фото
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  set("images", [
                    ...p.images,
                    {
                      url: "",
                      alt: "",
                      role: p.images.length ? "DETAIL" : "MAIN",
                    },
                  ])
                }
              >
                Добавить фото
              </button>
            </details>
            {p.personalization_enabled && (
              <details open>
                <summary>Поля персонализации</summary>
                {p.personalization_fields.map((f, i) => (
                  <div className="wk-admin-fields" key={i}>
                    <label>
                      Ключ
                      <input
                        value={f.key}
                        onChange={(e) =>
                          set(
                            "personalization_fields",
                            p.personalization_fields.map((x, j) =>
                              j === i ? { ...x, key: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Подпись
                      <input
                        value={f.label}
                        onChange={(e) =>
                          set(
                            "personalization_fields",
                            p.personalization_fields.map((x, j) =>
                              j === i ? { ...x, label: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Максимум символов
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={f.max_length}
                        onChange={(e) =>
                          set(
                            "personalization_fields",
                            p.personalization_fields.map((x, j) =>
                              j === i
                                ? { ...x, max_length: Number(e.target.value) }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Допустимые варианты · через запятую
                      <input
                        key={p.id + "options" + i}
                        defaultValue={(f.options || []).join(", ")}
                        onBlur={(e) =>
                          set(
                            "personalization_fields",
                            p.personalization_fields.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    options: e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={f.required}
                        onChange={(e) =>
                          set(
                            "personalization_fields",
                            p.personalization_fields.map((x, j) =>
                              j === i
                                ? { ...x, required: e.target.checked }
                                : x,
                            ),
                          )
                        }
                      />
                      Обязательное
                    </label>
                    <button
                      onClick={() =>
                        set(
                          "personalization_fields",
                          p.personalization_fields.filter((_, j) => i !== j),
                        )
                      }
                    >
                      Убрать поле
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    set("personalization_fields", [
                      ...p.personalization_fields,
                      {
                        key: "field_" + (p.personalization_fields.length + 1),
                        label: "",
                        required: false,
                        max_length: 12,
                      },
                    ])
                  }
                >
                  Добавить поле
                </button>
              </details>
            )}
            {p.product_type === "BUNDLE" && (
              <details open>
                <summary>Состав набора</summary>
                {p.components.map((c, i) => (
                  <div className="wk-admin-fields" key={i}>
                    <label>
                      Товар
                      <select
                        value={c.product_id}
                        onChange={(e) =>
                          set(
                            "components",
                            p.components.map((x, j) =>
                              i === j
                                ? { ...x, product_id: e.target.value }
                                : x,
                            ),
                          )
                        }
                      >
                        <option value="">Выберите товар</option>
                        {data?.items
                          .filter(
                            (r) =>
                              r.product.allow_in_bundles &&
                              r.product.product_type !== "BUNDLE",
                          )
                          .map((r) => (
                            <option key={r.product.id} value={r.product.id}>
                              {r.product.sku} · {r.product.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Количество
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={c.quantity}
                        onChange={(e) =>
                          set(
                            "components",
                            p.components.map((x, j) =>
                              i === j
                                ? { ...x, quantity: Number(e.target.value) }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <button
                      onClick={() =>
                        set(
                          "components",
                          p.components.filter((_, j) => i !== j),
                        )
                      }
                    >
                      Убрать из набора
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    set("components", [
                      ...p.components,
                      { product_id: "", quantity: 1 },
                    ])
                  }
                >
                  Добавить в набор
                </button>
                <p>
                  Остаток рассчитывается из компонентов. Если компонент требует
                  имя или текст, добавьте в набор одноимённое поле
                  персонализации.
                </p>
              </details>
            )}
            <details>
              <summary>Поставщик, логистика и документы</summary>
              <div className="wk-admin-fields">
                {[
                  ["weight", "Вес"],
                  ["manufacturer", "Производитель"],
                  ["supplier", "Поставщик"],
                  ["supplier_sku", "Артикул поставщика"],
                  ["country", "Страна"],
                  ["storage_volume", "Объём хранения"],
                  ["lead_time", "Срок поставки"],
                  ["minimum_order_quantity", "Минимальная партия"],
                  ["safety_documents", "Документы безопасности · ссылки"],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      value={String(selected.operations_data?.[key] || "")}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          operations_data: {
                            ...selected.operations_data,
                            [key]: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              {[
                ["can_be_vacuum_packed", "Допускается вакуумная упаковка"],
                [
                  "requires_restoration_after_shipping",
                  "Нужно восстановление после перевозки",
                ],
              ].map(([key, label]) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={Boolean(selected.operations_data?.[key])}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        operations_data: {
                          ...selected.operations_data,
                          [key]: e.target.checked,
                        },
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </details>
            <button
              className="wk-button"
              disabled={busy}
              onClick={() => void save()}
            >
              {busy ? "Сохраняем…" : "Сохранить товар"}
            </button>
            {role === "OWNER" && (
              <details
                onToggle={(e) => {
                  if (e.currentTarget.open) void openFinance();
                }}
              >
                <summary>Закупка и экономика · Owner</summary>
                {finance && (
                  <>
                    <div className="wk-admin-fields">
                      <label>
                        Закупка · ₽
                        <input
                          type="number"
                          value={finance.cost_price_minor / 100}
                          onChange={(e) =>
                            setFinance({
                              ...finance,
                              cost_price_minor: Math.round(
                                Number(e.target.value) * 100,
                              ),
                            })
                          }
                        />
                      </label>
                      <label>
                        Переменные затраты · ₽
                        <input
                          type="number"
                          value={finance.variable_cost_minor / 100}
                          onChange={(e) =>
                            setFinance({
                              ...finance,
                              variable_cost_minor: Math.round(
                                Number(e.target.value) * 100,
                              ),
                            })
                          }
                        />
                      </label>
                      <label>
                        Порог маржи · %
                        <input
                          type="number"
                          value={finance.minimum_margin}
                          onChange={(e) =>
                            setFinance({
                              ...finance,
                              minimum_margin: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    </div>
                    {p.price_minor && (
                      <p>
                        {(
                          ((p.price_minor -
                            finance.cost_price_minor -
                            finance.variable_cost_minor) /
                            p.price_minor) *
                          100
                        ).toFixed(1)}
                        % — валовая маржа
                        {((p.price_minor -
                          finance.cost_price_minor -
                          finance.variable_cost_minor) /
                          p.price_minor) *
                          100 <
                        finance.minimum_margin
                          ? " · Ниже заданного порога"
                          : ""}
                      </p>
                    )}
                    <label>
                      Поставщик
                      <input
                        value={String(finance.supplier_data.supplier || "")}
                        onChange={(e) =>
                          setFinance({
                            ...finance,
                            supplier_data: {
                              ...finance.supplier_data,
                              supplier: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                    <label>
                      SKU поставщика
                      <input
                        value={String(finance.supplier_data.supplier_sku || "")}
                        onChange={(e) =>
                          setFinance({
                            ...finance,
                            supplier_data: {
                              ...finance.supplier_data,
                              supplier_sku: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                    <button onClick={() => void saveFinance()}>
                      Сохранить закупку
                    </button>
                    <ul>
                      {history.map((h, i) => (
                        <li key={i}>
                          {new Date(h.created_at).toLocaleDateString("ru-RU")} ·{" "}
                          {money(h.cost_price_minor)}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </details>
            )}
          </div>
        ) : (
          <p>Выберите товар или создайте новый.</p>
        )}
      </div>
      <section className="wk-admin-recs">
        <h3>Рекомендации к композиции</h3>
        <select
          value={main}
          onChange={(e) => {
            setMain(e.target.value);
            setRecs(
              data?.recommendations.find((r) => r.main_slug === e.target.value)
                ?.addon_ids || [],
            );
          }}
        >
          <option value="">Выберите композицию</option>
          {data?.products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name} · {p.subtitle}
            </option>
          ))}
        </select>
        {main && (
          <>
            <p>
              Перетащите строки или используйте стрелки. Первые три — основной
              показ; остальные заменяют недоступные позиции. Сохранённый пустой
              список отключает рекомендации для этой композиции.
            </p>
            <ol>
              {recs.map((id, i) => (
                <li
                  key={id}
                  draggable
                  onDragStart={() => setDrag(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (drag !== null) move(drag, i);
                    setDrag(null);
                  }}
                >
                  {data?.items.find((r) => r.product.id === id)?.product.name ||
                    id}
                  <button
                    aria-label="Выше"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                  >
                    ↑
                  </button>
                  <button
                    aria-label="Ниже"
                    onClick={() => move(i, i + 1)}
                    disabled={i === recs.length - 1}
                  >
                    ↓
                  </button>
                  <button onClick={() => setRecs(recs.filter((v) => v !== id))}>
                    Убрать
                  </button>
                </li>
              ))}
            </ol>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) setRecs([...recs, e.target.value]);
              }}
            >
              <option value="">Добавить рекомендацию</option>
              {data?.items
                .filter((r) => !recs.includes(r.product.id))
                .map((r) => (
                  <option key={r.product.id} value={r.product.id}>
                    {r.product.name}
                  </option>
                ))}
            </select>
            <button
              className="wk-button"
              disabled={busy}
              onClick={() => void saveRecs()}
            >
              Сохранить рекомендации
            </button>
          </>
        )}
      </section>
    </section>
  );
}
