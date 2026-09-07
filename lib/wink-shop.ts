import { WINK_DEMO } from "./wink-mode";
import {
  WINK_COMPOSITIONS,
  WINK_PALETTES,
  bowsAddonFor,
  findComposition,
  validatePersonalization,
} from "./wink-domain";

export const API_URL =
  "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
export const CART_KEY = WINK_DEMO ? "wink-demo-v1-cart" : "wink-v4-cart";
export const FAVORITES_KEY = "wink-favorites";
export const DELIVERY_KEY = WINK_DEMO
  ? "wink-demo-delivery-intent"
  : "wink-delivery-intent";
export const SHOP_EVENT = "wink-shop-change";
export const CONTACT_URL = "https://t.me/mytango1337";
// getRandomValues also supports non-HTTPS local previews; these IDs are not tracking tokens.
export function createClientId(cryptoApi: Crypto = globalThis.crypto) {
  if (typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export type Variant = {
  id: string;
  sku: string;
  palette_id: string | null;
  price_delta_minor: number;
  config: Record<string, unknown>;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  base_price_minor: number;
  bestseller?: boolean;
  config: Record<string, unknown>;
  variants: Variant[];
};
export type Modifier = {
  code: string;
  name: string;
  price_delta_minor: number;
};
export type Catalog = { products: Product[]; modifiers: Modifier[] };
export type LineConfig = {
  palette?: string;
  foilColor?: string;
  number?: string;
  inscription?: string;
  revealResult?: "girl" | "boy";
  addons: string[];
};
export type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  subtitle: string;
  qty: number;
  unitPriceMinor: number;
  config: LineConfig;
  addon?: {
    id: string;
    sku: string;
    kind: "ADDON" | "SERVICE" | "BUNDLE";
    purchase_context: "STANDALONE" | "ADDON" | "BUNDLE";
    parent_product_id?: string;
    personalization: Record<string, string>;
    components: {
      product_id: string;
      quantity: number;
      name: string;
      sku: string;
    }[];
    delivery_class: "STANDARD" | "LARGE" | "OVERSIZED";
    production_days: number;
  };
};

export const PALETTES: Record<string, { name: string; colors: string[] }> = {
  MILK: { name: "Молочный", colors: ["#f6f0e8", "#e7dbcb", "#fffdf9"] },
  PINK_MILK: {
    name: "Розовый + молочный",
    colors: ["#dfb7c1", "#f6f0e8", "#fffdf9"],
  },
  PINK_CHROME: {
    name: "Розовый + серебро",
    colors: ["#dfb7c1", "#bac0c6", "#f6f0e8"],
  },
  BLACK_GOLD: {
    name: "Чёрный + золото",
    colors: ["#302c2d", "#c8ab71", "#f6f0e8"],
  },
  NUDE_GOLD: {
    name: "Айвори + золото",
    colors: ["#e7dbcb", "#c8ab71", "#fffdf9"],
  },
  BLACK_CHROME: {
    name: "Чёрный + серебро",
    colors: ["#302c2d", "#bac0c6", "#f6f0e8"],
  },
  FROST: {
    name: "Голубой + серебро",
    colors: ["#c8dce4", "#bac0c6", "#f6f0e8"],
  },
  CHERRY_MILK: {
    name: "Вишня + молочный",
    colors: ["#872d41", "#dfb7c1", "#f6f0e8"],
  },
};
export const FOIL_NAMES: Record<string, string> = {
  S: "Серебряный",
  G: "Золотой",
  R: "Красный",
};
export const FAMILY_NAMES: Record<string, string> = {
  AIR: "Воздушный сет",
  BIRTHDAY: "С днём рождения",
  LOVE: "С любовью",
  HEARTS: "От всего сердца",
  MESSAGE: "Ваши слова",
  "BABY REVEAL": "Маленький секрет",
};
export const FALLBACK_CATALOG: Catalog = {
  products: WINK_COMPOSITIONS.map((p) => ({
    id: p.slug,
    slug: p.slug,
    name: p.family,
    subtitle:
      p.family === "AIR"
        ? `${p.latexCount} шаров в двух фонтанах`
        : p.family === "HEARTS"
          ? `${p.heartCount} фольгированных сердец`
          : p.family === "BABY REVEAL"
            ? `Шар-сюрприз${p.latexCount ? ` + ${p.latexCount} шаров` : ""}`
            : p.composition,
    description: p.composition,
    base_price_minor: p.directPriceMinor,
    config: {
      production_id: p.productionId,
      latex_count: p.latexCount,
      digit_count: p.digitCount,
      heart_count: p.heartCount,
      number_required: p.digitCount > 0,
      message_required: p.bubbleCount > 0,
      reveal_result_required: p.revealCount > 0,
      bows_eligible: Boolean(bowsAddonFor(p)),
    },
    variants: [],
  })),
  modifiers: [
    { code: "BOWS_16", name: "8 бантов", price_delta_minor: 50000 },
    { code: "BOWS_30", name: "14 бантов", price_delta_minor: 80000 },
  ],
};

export function money(minor: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(minor / 100);
}
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}
export const IMAGES = {
  air: asset("/images/wink-air.webp"),
  birthday: asset("/images/wink-birthday.webp"),
  hearts: asset("/images/wink-hearts.webp"),
};
// These original illustrations convey the collection's mood, not an exact SKU or completed customer order.
export function productImage(p: { name: string }) {
  return p.name === "BIRTHDAY"
    ? IMAGES.birthday
    : ["LOVE", "HEARTS"].includes(p.name)
      ? IMAGES.hearts
      : IMAGES.air;
}
export function paletteIds(p: Product) {
  if (p.name === "BABY REVEAL") return ["MILK"];
  const ids = [
    ...new Set(
      p.variants
        .map((v) => v.palette_id)
        .filter((id): id is string => Boolean(id && PALETTES[id])),
    ),
  ];
  return ids.length ? ids : [...WINK_PALETTES];
}
export function productHref(slug: string, palette?: string) {
  return `/product/${encodeURIComponent(slug)}/${palette ? `?palette=${encodeURIComponent(palette)}` : ""}`;
}
export function bowModifier(p: Product, catalog: Catalog) {
  const composition = findComposition(p.slug);
  const addon = composition && bowsAddonFor(composition);
  return addon
    ? catalog.modifiers.find((m) => m.code === addon.code)
    : undefined;
}

export function priceFor(
  p: Product,
  config: LineConfig,
  catalog: Catalog,
): number {
  // v6: every approved palette/foil colour has the same price.
  const addon = bowModifier(p, catalog);
  return (
    p.base_price_minor +
    (addon && config.addons.includes(addon.code) ? addon.price_delta_minor : 0)
  );
}
export function displayPrice(p: Product, palette?: string) {
  const ids = paletteIds(p);
  const selected =
    p.name === "BABY REVEAL"
      ? "MILK"
      : palette && ids.includes(palette)
        ? palette
        : ids.includes("PINK_MILK")
          ? "PINK_MILK"
          : ids[0];
  return priceFor(
    p,
    { palette: selected, foilColor: "S", addons: [] },
    { products: [], modifiers: [] },
  );
}
export function personalizationErrors(
  p: Product,
  config: LineConfig,
): string[] {
  const composition = findComposition(p.slug);
  if (!composition)
    return ["Товар больше недоступен. Выберите композицию в каталоге."];
  const errors = validatePersonalization(composition, config).map((error) =>
    error.startsWith("number_")
      ? `Укажите ${composition.digitCount === 1 ? "одну цифру" : "две цифры"} для композиции.`
      : error === "inscription_required"
        ? "Добавьте текст надписи."
        : error === "inscription_too_long"
          ? "В надписи должно быть не больше 40 символов."
          : error === "inscription_too_many_lines"
            ? "В надписи должно быть не больше трёх строк."
            : "Выберите цвет конфетти.",
  );
  if (p.name === "HEARTS" && !FOIL_NAMES[config.foilColor || ""])
    errors.push("Выберите цвет сердец.");
  if (p.name !== "HEARTS" && !paletteIds(p).includes(config.palette || ""))
    errors.push("Выберите доступную палитру.");
  const addon = bowsAddonFor(composition);
  if (
    config.addons.some((code) => code !== addon?.code) ||
    new Set(config.addons).size !== config.addons.length
  )
    errors.push("Проверьте дополнения к композиции.");
  return errors;
}
export function configText(config: LineConfig) {
  return [
    PALETTES[config.palette || ""]?.name,
    FOIL_NAMES[config.foilColor || ""],
    config.number ? `Цифры: ${config.number}` : "",
    config.inscription ? `«${config.inscription}»` : "",
    config.revealResult ? "Цвет конфетти выбран" : "",
    config.addons.length ? "С бантами" : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
export function parseCart(raw: string | null): CartLine[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "[]");
  } catch {
    throw new Error(
      "Корзину не удалось прочитать. Начните новую корзину и выберите композицию ещё раз.",
    );
  }
  if (!Array.isArray(parsed))
    throw new Error(
      "Корзину не удалось прочитать. Откройте каталог и выберите композицию заново.",
    );
  if (
    !parsed.every(
      (line) =>
        line &&
        typeof line.lineId === "string" &&
        typeof line.productId === "string" &&
        typeof line.subtitle === "string" &&
        typeof line.name === "string" &&
        Number.isInteger(line.qty) &&
        line.qty >= 1 &&
        line.qty <= 20 &&
        Number.isSafeInteger(line.unitPriceMinor) &&
        line.unitPriceMinor > 0 &&
        line.config &&
        Array.isArray(line.config.addons) &&
        line.config.addons.every((a: unknown) => typeof a === "string") &&
        ["palette", "foilColor", "number", "inscription", "revealResult"].every(
          (k) =>
            line.config[k] === undefined || typeof line.config[k] === "string",
        ),
    )
  )
    throw new Error(
      "В корзине есть повреждённые данные. Соберите заказ заново из каталога.",
    );
  if (new Set(parsed.map((line) => line.lineId)).size !== parsed.length)
    throw new Error("Проверьте состав корзины: позиции повторяются.");
  for (const line of parsed) {
    const a = line.addon;
    if (
      a !== undefined &&
      (!a ||
        typeof a.id !== "string" ||
        typeof a.sku !== "string" ||
        !["ADDON", "SERVICE", "BUNDLE"].includes(a.kind) ||
        !["STANDALONE", "ADDON", "BUNDLE"].includes(a.purchase_context) ||
        !a.personalization ||
        typeof a.personalization !== "object" ||
        Array.isArray(a.personalization) ||
        !Object.values(a.personalization).every((v) => typeof v === "string") ||
        !Array.isArray(a.components) ||
        !a.components.every(
          (c: {
            product_id: unknown;
            quantity: number;
            name: unknown;
            sku: unknown;
          }) =>
            c &&
            typeof c.product_id === "string" &&
            typeof c.name === "string" &&
            typeof c.sku === "string" &&
            Number.isInteger(c.quantity) &&
            c.quantity > 0,
        ) ||
        !Number.isInteger(a.production_days) ||
        a.production_days < 0 ||
        !["STANDARD", "LARGE", "OVERSIZED"].includes(a.delivery_class))
    )
      throw new Error("Проверьте дополнения в корзине.");
  }
  return parsed as CartLine[];
}
export function readCart() {
  return parseCart(window.localStorage.getItem(CART_KEY));
}
export function writeCart(lines: CartLine[]) {
  const raw = JSON.stringify(lines);
  parseCart(raw);
  window.localStorage.setItem(CART_KEY, raw);
  window.dispatchEvent(new Event(SHOP_EVENT));
}
export function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(FAVORITES_KEY) || "[]",
    );
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}
export function toggleFavorite(slug: string) {
  const old = readFavorites();
  const next = old.includes(slug)
    ? old.filter((s) => s !== slug)
    : [...old, slug];
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SHOP_EVENT));
  return next;
}
export function kemerovoDate(now = new Date(), days = 0) {
  const local = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Novokuznetsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const date = new Date(`${local}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function validDeliveryDate(value: string, now = new Date()) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value &&
    value >= kemerovoDate(now)
  );
}
export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^[78]\d{10}$/.test(digits)) return `+7${digits.slice(1)}`;
  if (/^9\d{9}$/.test(digits)) return `+7${digits}`;
  return null;
}
export function readDelivery(): {
  date?: string;
  address?: string;
  mode?: string;
} {
  try {
    const value = JSON.parse(window.localStorage.getItem(DELIVERY_KEY) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        ([key, v]) =>
          ["date", "address", "mode"].includes(key) && typeof v === "string",
      ),
    );
  } catch {
    return {};
  }
}
export function saveDelivery(value: {
  date?: string;
  address?: string;
  mode?: string;
}) {
  window.localStorage.setItem(
    DELIVERY_KEY,
    JSON.stringify({ ...readDelivery(), ...value }),
  );
}
export function isConfirmedOrder(
  order: unknown,
): order is { number: string; public_token: string; status?: string } {
  return Boolean(
    order &&
    typeof order === "object" &&
    "number" in order &&
    typeof order.number === "string" &&
    order.number.trim() &&
    "public_token" in order &&
    typeof order.public_token === "string" &&
    order.public_token.trim(),
  );
}
export function budgetMatches(price: number, budget: string) {
  return ["5000", "7000", "7500", "10000"].includes(budget)
    ? price <= Number(budget) * 100
    : true;
}

export function searchProducts(products: Product[], query: string) {
  const normalized = query.toLowerCase().replace(/ё/g, "е").trim();
  const amount = normalized.match(/до\s*(\d[\d\s]*)\s*(?:₽|руб\.?|р\.)?/);
  const limit = amount ? Number(amount[1].replace(/\s/g, "")) * 100 : Infinity;
  const terms = normalized
    .replace(amount?.[0] || /$^/, "")
    .split(/\s+/)
    .filter((s) => s && !["для", "с", "в", "на", "из"].includes(s));
  return products.filter((p) => {
    if (displayPrice(p) > limit) return false;
    const text = `${FAMILY_NAMES[p.name] || ""} ${p.name} ${p.subtitle}`
      .toLowerCase()
      .replace(/ё/g, "е");
    return terms.every(
      (term) =>
        text.includes(term) ||
        (/циф|возраст|рожд/.test(term) && p.name === "BIRTHDAY") ||
        (/серд|любов/.test(term) && ["HEARTS", "LOVE"].includes(p.name)) ||
        (/надпис|слов|текст/.test(term) && p.name === "MESSAGE") ||
        (/реб|дет/.test(term) &&
          ["BIRTHDAY", "AIR", "MESSAGE"].includes(p.name)) ||
        (/девуш|мам|подруг/.test(term) &&
          ["LOVE", "HEARTS", "MESSAGE", "BIRTHDAY"].includes(p.name)) ||
        (/малыш|гендер|секрет/.test(term) && p.name === "BABY REVEAL") ||
        (/розов/.test(term) &&
          p.name !== "HEARTS" &&
          paletteIds(p).some((id) => id.startsWith("PINK"))),
    );
  });
}

export function parseCatalog(value: unknown): Catalog {
  if (
    !value ||
    typeof value !== "object" ||
    !("products" in value) ||
    !Array.isArray(value.products) ||
    !value.products.length
  )
    throw new Error("catalog_unavailable");
  const products = value.products
    .filter(
      (p: Product) =>
        p &&
        typeof p.slug === "string" &&
        findComposition(p.slug) &&
        typeof p.name === "string" &&
        typeof p.subtitle === "string" &&
        Number.isSafeInteger(p.base_price_minor) &&
        p.base_price_minor > 0,
    )
    .map((p: Product) => {
      const reference = FALLBACK_CATALOG.products.find(
        (item) => item.slug === p.slug,
      )!;
      // Never silently replace the uploaded master with an old API price list.
      if (
        p.config?.price_version !== "WINK_PRICE_V6" &&
        p.base_price_minor !== reference.base_price_minor
      )
        throw new Error("catalog_price_version_mismatch");
      if (
        Array.isArray(p.variants) &&
        p.variants.some((v) => v && Number(v.price_delta_minor) !== 0)
      )
        throw new Error("catalog_palette_price_version_mismatch");
      return {
        ...reference,
        ...p,
        config: { ...reference.config, ...p.config },
        variants: Array.isArray(p.variants)
          ? p.variants
              .filter((v) => v && Number.isSafeInteger(v.price_delta_minor))
              .map((v) => ({ ...v, config: v.config || {} }))
          : [],
      };
    });
  if (!products.length) throw new Error("catalog_unavailable");
  const modifiers =
    "modifiers" in value && Array.isArray(value.modifiers)
      ? value.modifiers.filter(
          (m: Modifier) =>
            m &&
            typeof m.code === "string" &&
            Number.isSafeInteger(m.price_delta_minor) &&
            m.price_delta_minor >= 0,
        )
      : [];
  return { products, modifiers };
}
