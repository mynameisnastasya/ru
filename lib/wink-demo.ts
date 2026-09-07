import { ADDON_DEFAULTS } from "./wink-addon-defaults";
import type { Addon, AddonCatalog } from "./wink-addons";
import { FALLBACK_CATALOG } from "./wink-shop";

function sample(
  id: string,
  name: string,
  price: number,
  extra: Partial<Addon> = {},
): Addon {
  return {
    ...ADDON_DEFAULTS,
    id: `demo-${id}`,
    sku: `DEMO-${id.toUpperCase()}`,
    slug: `demo-${id}`,
    name,
    short_name: name,
    status: "ACTIVE",
    show_in_catalog: true,
    allow_standalone: true,
    price_minor: price,
    available_quantity: 10,
    stock_status: "IN_STOCK",
    short_description:
      "Тестовый товар. Цена и наличие условные; фото будет добавлено позже.",
    search_keywords: [name],
    ...extra,
  };
}

// Synthetic fixtures only: never seed these into the production database.
export const DEMO_ADDONS: AddonCatalog = {
  version: 1,
  checkout_enabled: true,
  recommendations: Object.fromEntries(
    FALLBACK_CATALOG.products.map((p) => [
      p.slug,
      ["demo-bear", "demo-card", "demo-bunny"],
    ]),
  ),
  items: [
    sample("bear", "MINI BEAR MILK", 149000, {
      subtype: "SOFT_TOY",
      size_cm: 28,
      color: "milk",
      bestseller: true,
      search_keywords: ["мишка", "медведь", "bear"],
    }),
    sample("card", "Персональная открытка", 30000, {
      subtype: "CARD",
      personalization_enabled: true,
      personalization_fields: [
        { key: "text", label: "Ваши слова", required: true, max_length: 120 },
      ],
    }),
    sample("bunny", "MINI BUNNY CREAM", 169000, {
      subtype: "SOFT_TOY",
      size_cm: 30,
      color: "cream",
      search_keywords: ["зайчик", "заяц", "bunny"],
    }),
    sample("soft-touch", "SOFT TOUCH", 169000, {
      product_type: "BUNDLE",
      components: [
        { product_id: "demo-bear", quantity: 1 },
        { product_id: "demo-card", quantity: 1 },
      ],
      personalization_enabled: true,
      personalization_fields: [
        {
          key: "text",
          label: "Текст открытки в наборе",
          required: true,
          max_length: 120,
        },
      ],
    }),
    sample("handmade", "WINK HANDMADE", 299000, {
      subtype: "HANDMADE",
      stock_type: "MADE_TO_ORDER",
      stock_status: "PREORDER",
      production_days: 3,
      personalization_enabled: true,
      personalization_fields: [
        { key: "name", label: "Имя", required: true, max_length: 12 },
      ],
      personalization_price_minor: 60000,
    }),
    sample("big-hug", "BIG HUG BEAR", 599000, {
      subtype: "SOFT_TOY",
      delivery_class: "OVERSIZED",
      available_quantity: 1,
      stock_status: "LOW_STOCK",
    }),
  ],
};
