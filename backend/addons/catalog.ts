import type { Addon, AddonCatalog } from "../../lib/wink-addons";
import { ADDON_DEFAULTS } from "../../lib/wink-addon-defaults";
export { ADDON_DEFAULTS };
// Structural interface accepts a checked-out pg client; no pool.query inside transactions.
export interface DB {
  query<T = Record<string, unknown>>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: T[]; rowCount?: number | null }>;
}
export type Staff = {
  id: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "PRODUCTION" | "PICKER";
};
export function requireCatalogRole(staff: Staff) {
  if (!["OWNER", "ADMIN", "MANAGER"].includes(staff.role))
    throw new Error("forbidden");
}
export function requireFinanceRole(staff: Staff) {
  if (staff.role !== "OWNER") throw new Error("forbidden");
}
const publicKeys = Object.keys(ADDON_DEFAULTS).filter(
  (k) =>
    ![
      "price_minor",
      "status",
      "product_type",
      "components",
      "available_quantity",
      "stock_status",
      "stock_type",
    ].includes(k),
);
export function publicAddon(row: Record<string, unknown>): Addon {
  const data = (row.public_data || {}) as Record<string, unknown>;
  const safe = Object.fromEntries(
    publicKeys.filter((k) => k in data).map((k) => [k, data[k]]),
  );
  const available = Number(row.available_quantity || 0),
    minimum = Number(row.minimum_stock || 0);
  return {
    ...ADDON_DEFAULTS,
    ...safe,
    id: String(row.id),
    sku: String(row.sku),
    slug: String(row.slug),
    name: String(row.name),
    product_type: row.product_type as Addon["product_type"],
    subtype: String(row.subtype || ""),
    status: row.status as Addon["status"],
    price_minor: row.price_minor === null ? null : Number(row.price_minor),
    stock_type: row.stock_type as Addon["stock_type"],
    available_quantity: available,
    stock_status:
      row.stock_type === "MADE_TO_ORDER"
        ? "PREORDER"
        : available <= 0
          ? "OUT_OF_STOCK"
          : available <= minimum
            ? "LOW_STOCK"
            : "IN_STOCK",
    components: (row.components || []) as Addon["components"],
  };
}
export async function getAddonCatalog(
  db: DB,
  checkoutEnabled = false,
): Promise<AddonCatalog> {
  const { rows } =
    await db.query(`SELECT a.*,s.available_quantity,s.minimum_stock,s.stock_type,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('product_id',c.product_id,'quantity',c.quantity) ORDER BY c.product_id) FROM wink_bundle_components c WHERE c.bundle_id=a.id),'[]') AS components
 FROM wink_addons a JOIN wink_addon_availability s ON s.addon_id=a.id ORDER BY a.sku`);
  const recs = await db.query<{ main_slug: string; addon_ids: string[] }>(
    "SELECT main_slug,addon_ids FROM wink_addon_recommendations",
  );
  // Hidden components must remain available to eligibility checks, but their data must not be public.
  const items = rows.map(publicAddon).filter((a) => a.status === "ACTIVE");
  return {
    version: 1,
    items,
    recommendations: Object.fromEntries(
      recs.rows.map((r) => [r.main_slug, r.addon_ids]),
    ),
    checkout_enabled: checkoutEnabled,
  };
}
export function validateAddon(a: Addon) {
  if (
    !/^[A-Z0-9][A-Z0-9_-]{1,60}$/.test(a.sku) ||
    !/^[a-z0-9][a-z0-9-]{1,100}$/.test(a.slug) ||
    !a.name.trim()
  )
    throw new Error("Укажите название, SKU и адрес страницы.");
  if (
    !["ADDON", "SERVICE", "BUNDLE"].includes(a.product_type) ||
    !["ACTIVE", "DRAFT", "HIDDEN", "ARCHIVED"].includes(a.status)
  )
    throw new Error("Проверьте тип и статус.");
  if (
    a.price_minor !== null &&
    (!Number.isSafeInteger(a.price_minor) || a.price_minor <= 0)
  )
    throw new Error("Цена должна быть положительной.");
  if (a.status === "ACTIVE" && a.price_minor === null)
    throw new Error("Перед публикацией укажите цену.");
  if (
    !Number.isSafeInteger(a.personalization_price_minor) ||
    a.personalization_price_minor < 0 ||
    !Number.isInteger(a.production_days) ||
    a.production_days < 0
  )
    throw new Error("Проверьте доплату и срок изготовления.");
  if (a.stock_type === "MADE_TO_ORDER" && a.production_days < 1)
    throw new Error("Укажите срок изготовления от одного дня.");
  if (!["STANDARD", "LARGE", "OVERSIZED"].includes(a.delivery_class))
    throw new Error("Проверьте класс доставки.");
  if (a.images.some((i) => !/^https:\/\//.test(i.url) || !i.alt.trim()))
    throw new Error("Для фото нужны HTTPS-ссылка и описание.");
  if (a.status === "ACTIVE" && a.subtype === "SOFT_TOY" && !a.images.length)
    throw new Error("Добавьте подтверждённое фото игрушки перед публикацией.");
  if (
    a.personalization_fields.length > 10 ||
    new Set(a.personalization_fields.map((f) => f.key)).size !==
      a.personalization_fields.length ||
    a.personalization_fields.some(
      (f) =>
        !/^[a-z][a-z0-9_]{0,30}$/.test(f.key) ||
        !f.label ||
        !Number.isInteger(f.max_length) ||
        f.max_length < 1 ||
        f.max_length > 500,
    )
  )
    throw new Error("Проверьте поля персонализации.");
  if (
    a.product_type === "BUNDLE" &&
    (!a.components.length ||
      a.components.some(
        (c) =>
          c.product_id === a.id ||
          !Number.isInteger(c.quantity) ||
          c.quantity < 1,
      ) ||
      new Set(a.components.map((c) => c.product_id)).size !==
        a.components.length)
  )
    throw new Error("Проверьте состав набора.");
}
export async function saveAddon(
  db: DB,
  staff: Staff,
  input: Addon,
  revision: number,
  stock: { stock_quantity: number; minimum_stock: number },
) {
  requireCatalogRole(staff);
  validateAddon(input);
  if (
    !Number.isInteger(stock.stock_quantity) ||
    stock.stock_quantity < 0 ||
    !Number.isInteger(stock.minimum_stock) ||
    stock.minimum_stock < 0
  )
    throw new Error("Проверьте остаток.");
  const data = Object.fromEntries(
    publicKeys.map((k) => [k, input[k as keyof Addon]]),
  );
  const existing = await db.query<{ revision: number }>(
    "SELECT revision FROM wink_addons WHERE id=$1 FOR UPDATE",
    [input.id],
  );
  if (existing.rows.length && existing.rows[0].revision !== revision)
    throw new Error("Товар изменён другим сотрудником. Обновите страницу.");
  await db.query(
    `INSERT INTO wink_addons(id,sku,slug,name,product_type,subtype,status,price_minor,public_data) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
 ON CONFLICT(id) DO UPDATE SET sku=excluded.sku,slug=excluded.slug,name=excluded.name,product_type=excluded.product_type,subtype=excluded.subtype,status=excluded.status,price_minor=excluded.price_minor,public_data=excluded.public_data,revision=wink_addons.revision+1,updated_at=now()`,
    [
      input.id,
      input.sku,
      input.slug,
      input.name,
      input.product_type,
      input.subtype,
      input.status,
      input.price_minor,
      JSON.stringify(data),
    ],
  );
  await db.query(
    "INSERT INTO wink_addon_stock(addon_id) VALUES($1) ON CONFLICT DO NOTHING",
    [input.id],
  );
  await db.query(
    "SELECT addon_id FROM wink_addon_stock WHERE addon_id=$1 FOR UPDATE",
    [input.id],
  );
  const held = await db.query<{ quantity: number }>(
    `SELECT COALESCE(SUM(quantity),0)::integer AS quantity FROM wink_addon_reservations WHERE addon_id=$1 AND state='HELD' AND expires_at>now()`,
    [input.id],
  );
  if (
    stock.stock_quantity < held.rows[0].quantity &&
    input.stock_type === "TRACKED"
  )
    throw new Error("Остаток не может быть меньше действующих резервов.");
  if (input.stock_type === "MADE_TO_ORDER" && held.rows[0].quantity > 0)
    throw new Error("Сначала завершите текущие резервы.");
  if (input.product_type === "BUNDLE")
    for (const part of input.components) {
      const child = await db.query<{
        product_type: string;
        public_data: { allow_in_bundles?: boolean };
      }>(
        "SELECT product_type,public_data FROM wink_addons WHERE id=$1 FOR SHARE",
        [part.product_id],
      );
      if (
        !child.rows[0] ||
        child.rows[0].product_type === "BUNDLE" ||
        !child.rows[0].public_data.allow_in_bundles
      )
        throw new Error(
          "В набор можно включить только разрешённые товары, без вложенных наборов.",
        );
    }
  await db.query(
    "UPDATE wink_addon_stock SET stock_quantity=$2,minimum_stock=$3,stock_type=$4 WHERE addon_id=$1",
    [
      input.id,
      input.product_type === "BUNDLE" ? 0 : stock.stock_quantity,
      stock.minimum_stock,
      input.stock_type,
    ],
  );
  await db.query("DELETE FROM wink_bundle_components WHERE bundle_id=$1", [
    input.id,
  ]);
  if (input.product_type === "BUNDLE")
    for (const part of input.components)
      await db.query("INSERT INTO wink_bundle_components VALUES($1,$2,$3)", [
        input.id,
        part.product_id,
        part.quantity,
      ]);
  await db.query(
    "INSERT INTO wink_addon_audit(actor_id,entity_id,action) VALUES($1,$2,$3)",
    [staff.id, input.id, "CATALOG_SAVE"],
  );
}
