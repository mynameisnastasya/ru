/** Public ADD-ONS contract. Never add supplier or finance fields to this DTO. */
export type PurchaseContext = "STANDALONE" | "ADDON" | "BUNDLE";
export type AddonField = {
  key: string;
  label: string;
  required: boolean;
  max_length: number;
  options?: string[];
  type?: "text" | "date";
};
export type Addon = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  short_name: string;
  product_type: "ADDON" | "SERVICE" | "BUNDLE";
  subtype: string;
  category: string;
  subcategory: string;
  status: "ACTIVE" | "DRAFT" | "HIDDEN" | "ARCHIVED";
  short_description: string;
  full_description: string;
  images: {
    url: string;
    alt: string;
    role: "MAIN" | "LIFESTYLE" | "WITH_BALLOONS" | "HUMAN" | "DETAIL";
  }[];
  price_minor: number | null;
  old_price_minor: number | null;
  size_cm: number | null;
  color: string;
  material: string;
  care_info: string;
  age_restriction: string;
  show_in_catalog: boolean;
  allow_standalone: boolean;
  allow_as_addon: boolean;
  allow_in_bundles: boolean;
  collections: string[];
  is_wink_original: boolean;
  bestseller: boolean;
  search_keywords: string[];
  compatible_products: string[];
  compatible_categories: string[];
  compatible_occasions: string[];
  compatible_palettes: string[];
  compatible_audience: string[];
  compatible_budget_from: number | null;
  compatible_budget_to: number | null;
  stock_type: "TRACKED" | "MADE_TO_ORDER";
  stock_status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";
  available_quantity: number;
  production_days: number;
  delivery_class: "STANDARD" | "LARGE" | "OVERSIZED";
  personalization_enabled: boolean;
  personalization_fields: AddonField[];
  personalization_price_minor: number;
  non_returnable_to_stock: boolean;
  components: { product_id: string; quantity: number }[];
};
export type AddonCatalog = {
  version: 1;
  items: Addon[];
  recommendations: Record<string, string[]>;
  checkout_enabled: boolean;
};
export type RecommendationContext = {
  product_id?: string;
  category?: string;
  occasion?: string;
  palette?: string;
  audience?: string;
  budget_minor?: number;
};
export const EMPTY_ADDONS: AddonCatalog = {
  version: 1,
  items: [],
  recommendations: {},
  checkout_enabled: false,
};
export function compatible(a: Addon, c: RecommendationContext) {
  const rules: [string[], string | undefined][] = [
    [a.compatible_products, c.product_id],
    [a.compatible_categories, c.category],
    [a.compatible_occasions, c.occasion],
    [a.compatible_palettes, c.palette],
    [a.compatible_audience, c.audience],
  ];
  // Unknown context cannot satisfy a restrictive rule. Blank rules mean universal.
  return (
    rules.every(
      ([values, value]) =>
        !values.length || Boolean(value && values.includes(value)),
    ) &&
    (a.compatible_budget_from === null ||
      (c.budget_minor !== undefined &&
        c.budget_minor >= a.compatible_budget_from)) &&
    (a.compatible_budget_to === null ||
      (c.budget_minor !== undefined &&
        c.budget_minor <= a.compatible_budget_to))
  );
}
export function availableQuantity(
  a: Addon,
  catalog: readonly Addon[],
  visited = new Set<string>(),
): number {
  if (
    a.status !== "ACTIVE" ||
    !Number.isSafeInteger(a.price_minor) ||
    (a.price_minor ?? 0) <= 0 ||
    visited.has(a.id)
  )
    return 0;
  if (a.product_type === "BUNDLE") {
    if (!a.components.length) return 0;
    const ids = new Set(visited).add(a.id);
    return Math.min(
      ...a.components.map((c) => {
        const p = catalog.find((p) => p.id === c.product_id);
        return p &&
          p.allow_in_bundles &&
          Number.isInteger(c.quantity) &&
          c.quantity > 0
          ? Math.floor(availableQuantity(p, catalog, ids) / c.quantity)
          : 0;
      }),
    );
  }
  if (a.stock_type === "MADE_TO_ORDER") return 20;
  if (a.stock_status === "OUT_OF_STOCK") return 0;
  return Math.max(0, Math.floor(a.available_quantity));
}
export function recommendationScore(a: Addon, c: RecommendationContext) {
  return (
    (c.palette && a.compatible_palettes.includes(c.palette) ? 30 : 0) +
    (c.occasion && a.compatible_occasions.includes(c.occasion) ? 25 : 0) +
    (c.category && a.compatible_categories.includes(c.category) ? 20 : 0) +
    (c.audience && a.compatible_audience.includes(c.audience) ? 10 : 0) +
    (c.budget_minor !== undefined &&
    (a.compatible_budget_from !== null || a.compatible_budget_to !== null)
      ? 10
      : 0) +
    (a.bestseller ? 5 : 0)
  );
}
export function recommendations(
  catalog: AddonCatalog,
  c: RecommendationContext,
  excluded: string[] = [],
  limit: 2 | 3 = 3,
) {
  const eligible = catalog.items.filter(
    (a) =>
      a.allow_as_addon &&
      availableQuantity(a, catalog.items) > 0 &&
      !excluded.includes(a.id) &&
      compatible(a, c),
  );
  const manual = c.product_id
    ? catalog.recommendations[c.product_id]
    : undefined;
  const ranked = [...eligible].sort(
    (a, b) =>
      recommendationScore(b, c) - recommendationScore(a, c) ||
      a.sku.localeCompare(b.sku),
  );
  if (!manual) return ranked.slice(0, limit);
  if (!manual.length) return []; // explicit empty list disables automatic recommendations
  const selected = manual
    .map((id) => eligible.find((a) => a.id === id))
    .filter((a): a is Addon => Boolean(a));
  // Fill only holes left by unavailable/incompatible assigned products, not deliberate short lists.
  return [...selected, ...ranked.filter((a) => !manual.includes(a.id))].slice(
    0,
    Math.min(limit, manual.length),
  );
}
export function personalization(a: Addon, input: Record<string, string> = {}) {
  const snapshot: Record<string, string> = {};
  if (!a.personalization_enabled) {
    if (Object.keys(input).length)
      throw new Error("Для этого товара персонализация недоступна.");
    return { snapshot, surcharge: 0 };
  }
  if (
    Object.keys(input).some(
      (k) => !a.personalization_fields.some((f) => f.key === k),
    )
  )
    throw new Error("Проверьте поля персонализации.");
  for (const f of a.personalization_fields) {
    const value = String(input[f.key] || "").trim();
    if (f.required && !value) throw new Error(`Заполните поле «${f.label}».`);
    if (Array.from(value).length > f.max_length)
      throw new Error(`«${f.label}»: не больше ${f.max_length} символов.`);
    if (value && f.options?.length && !f.options.includes(value))
      throw new Error(`Выберите доступный вариант: ${f.label}.`);
    if (
      value &&
      f.type === "date" &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(Date.parse(value)) ||
        new Date(value).toISOString().slice(0, 10) !== value)
    )
      throw new Error(`Проверьте дату: ${f.label}.`);
    if (value) snapshot[f.key] = value;
  }
  return {
    snapshot,
    surcharge: Object.keys(snapshot).length ? a.personalization_price_minor : 0,
  };
}
export function addonPrice(a: Addon, input: Record<string, string> = {}) {
  if (!Number.isSafeInteger(a.price_minor) || (a.price_minor ?? 0) <= 0)
    throw new Error("Цена ещё не подтверждена.");
  return a.price_minor! + personalization(a, input).surcharge;
}
export function deliveryRequirements(
  items: { product_id: string; personalization?: Record<string, string> }[],
  catalog: Addon[],
) {
  const expanded: Addon[] = [];
  function add(id: string, visited = new Set<string>()) {
    if (visited.has(id)) throw new Error("Проверьте состав набора.");
    const p = catalog.find((a) => a.id === id);
    if (!p) return;
    expanded.push(p);
    if (p.product_type === "BUNDLE")
      p.components.forEach((c) => add(c.product_id, new Set(visited).add(id)));
  }
  items.forEach((i) => add(i.product_id));
  return {
    days: Math.max(0, ...expanded.map((a) => a.production_days)),
    delivery_class: expanded.some((a) => a.delivery_class === "OVERSIZED")
      ? "OVERSIZED"
      : expanded.some((a) => a.delivery_class === "LARGE")
        ? "LARGE"
        : "STANDARD",
  };
}
export const STOCK_LABELS = {
  IN_STOCK: "В наличии",
  LOW_STOCK: "Осталось мало",
  OUT_OF_STOCK: "Нет в наличии",
  PREORDER: "Под заказ",
};
export function stockLabel(a: Addon, catalog: Addon[]) {
  const quantity = availableQuantity(a, catalog);
  if (!quantity) return STOCK_LABELS.OUT_OF_STOCK;
  const requirements = deliveryRequirements([{ product_id: a.id }], catalog);
  if (requirements.days > 0) return `Под заказ · ${requirements.days} дн.`;
  return a.product_type === "BUNDLE"
    ? a.components.some(
        (part) =>
          catalog.find((p) => p.id === part.product_id)?.stock_status ===
          "LOW_STOCK",
      )
      ? STOCK_LABELS.LOW_STOCK
      : STOCK_LABELS.IN_STOCK
    : STOCK_LABELS[a.stock_status];
}
export function searchAddons(items: Addon[], query: string) {
  const normalize = (s: string) => s.toLowerCase().replace(/ё/g, "е");
  const terms = normalize(query).trim().split(/\s+/);
  return items.filter(
    (a) =>
      a.show_in_catalog &&
      a.status === "ACTIVE" &&
      terms.every((t) =>
        normalize(
          [
            a.name,
            a.short_name,
            a.short_description,
            ...a.search_keywords,
          ].join(" "),
        ).includes(t),
      ),
  );
}
