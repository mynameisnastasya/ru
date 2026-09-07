import {
  addonPrice,
  availableQuantity,
  compatible,
  deliveryRequirements,
  personalization,
} from "../../lib/wink-addons";
import { getAddonCatalog, DB } from "./catalog";
export type AddonOrderInput = {
  addon_id: string;
  quantity: number;
  purchase_context: "STANDALONE" | "ADDON" | "BUNDLE";
  main_slug?: string;
  personalization?: Record<string, string>;
};
/** Called inside the SAME transaction as the existing order + main item writes. Never trust browser prices. */
export async function snapshotAddons(
  db: DB,
  orderId: string,
  inputs: AddonOrderInput[],
  mainItems: {
    slug: string;
    sku: string;
    category: string;
    palette?: string;
    quantity: number;
    price_minor: number;
  }[],
  deliveryDate: string,
) {
  if (inputs.length > 30) throw new Error("too_many_addons");
  const catalog = await getAddonCatalog(db, true);
  const requirements = deliveryRequirements(
    inputs.map((i) => ({ product_id: i.addon_id })),
    catalog.items,
  );
  const earliest = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Novokuznetsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Date.now() + requirements.days * 86400000));
  if (deliveryDate < earliest)
    throw new Error(`delivery_before_production:${earliest}`);
  let total = 0;
  const seen = new Set<string>();
  for (const input of inputs) {
    if (
      !Number.isInteger(input.quantity) ||
      input.quantity < 1 ||
      input.quantity > 20
    )
      throw new Error("invalid_quantity");
    const a = catalog.items.find((a) => a.id === input.addon_id);
    if (!a || !availableQuantity(a, catalog.items))
      throw new Error("addon_unavailable");
    const main = mainItems.find((p) => p.slug === input.main_slug);
    if (input.purchase_context === "STANDALONE") {
      if (!a.allow_standalone) throw new Error("standalone_not_allowed");
    } else if (!(a.product_type === "BUNDLE" && !main && a.allow_standalone)) {
      if (!main || !a.allow_as_addon) throw new Error("main_product_required");
      if (
        !compatible(a, {
          product_id: main.slug,
          category: main.category,
          palette: main.palette,
          budget_minor: main.price_minor,
        })
      )
        throw new Error("addon_incompatible");
    }
    const components =
      a.product_type === "BUNDLE"
        ? a.components
        : [{ product_id: a.id, quantity: 1 }];
    // Reject an accidental duplicate across a bundle and a separate cart line. Quantity belongs on a single line.
    for (const c of components) {
      if (seen.has(c.product_id)) throw new Error("bundle_component_duplicate");
      seen.add(c.product_id);
    }
    const person = personalization(a, input.personalization || {}),
      unit = addonPrice(a, person.snapshot);
    const componentSnapshots = components.map((c) => {
      const p = catalog.items.find((p) => p.id === c.product_id)!;
      const componentPerson = personalization(
        p,
        Object.fromEntries(
          Object.entries(person.snapshot).filter(([key]) =>
            p.personalization_fields.some((f) => f.key === key),
          ),
        ),
      );
      return {
        personalization: componentPerson.snapshot,
        product_id: p.id,
        sku: p.sku,
        name: p.name,
        image: p.images[0]?.url || null,
        quantity: c.quantity,
      };
    });
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO order_items(order_id,addon_id,sku_snapshot,name_snapshot,subtitle_snapshot,image_snapshot,quantity,unit_price_minor,line_total_minor,purchase_context,main_sku_snapshot,personalization_snapshot,components_snapshot,non_returnable_to_stock)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [
        orderId,
        a.id,
        a.sku,
        a.name,
        a.short_name,
        a.images[0]?.url || null,
        input.quantity,
        unit,
        unit * input.quantity,
        a.product_type === "BUNDLE" ? "BUNDLE" : input.purchase_context,
        main?.sku || null,
        JSON.stringify(person.snapshot),
        JSON.stringify(a.product_type === "BUNDLE" ? componentSnapshots : []),
        a.non_returnable_to_stock,
      ],
    );
    for (const part of components)
      await db.query(
        "INSERT INTO wink_order_addon_components(order_item_id,addon_id,quantity) VALUES($1,$2,$3)",
        [rows[0].id, part.product_id, part.quantity * input.quantity],
      );
    const costs = await db.query<{
      cost: number;
      variable: number;
      known: boolean;
    }>(
      `SELECT COUNT(f.addon_id)=COUNT(*) AS known,COALESCE(SUM(f.cost_price_minor*c.quantity),0)::integer AS cost,COALESCE(SUM(f.variable_cost_minor*c.quantity),0)::integer AS variable FROM wink_order_addon_components c LEFT JOIN wink_addon_finance f ON f.addon_id=c.addon_id WHERE c.order_item_id=$1`,
      [rows[0].id],
    );
    if (costs.rows[0].known)
      await db.query("INSERT INTO wink_order_item_finance VALUES($1,$2,$3)", [
        rows[0].id,
        costs.rows[0].cost,
        costs.rows[0].variable,
      ]);
    total += unit * input.quantity;
  }
  return {
    subtotal_minor: total,
    delivery_class: requirements.delivery_class,
    earliest_delivery_date: earliest,
  };
}
/** Call only after provider verification, within the existing payment transaction. */
export async function consumePaidAddons(db: DB, orderId: string) {
  await db.query("SELECT wink_consume_addons($1)", [orderId]);
}
/** Reserve immediately before creating a payment session; cart/order draft creation reserves nothing. */
export async function reserveForPayment(db: DB, orderId: string) {
  return (
    await db.query<{ expires_at: string }>(
      "SELECT wink_reserve_addons($1) AS expires_at",
      [orderId],
    )
  ).rows[0].expires_at;
}
export async function releasePayment(db: DB, orderId: string) {
  await db.query("SELECT wink_release_addons($1)", [orderId]);
}
/** Called only for an authenticated, confirmed provider refund. Idempotent per provider refund ID. */
export async function recordAddonRefund(
  db: DB,
  input: {
    order_item_id: string;
    provider_refund_id: string;
    quantity: number;
    amount_minor: number;
    restock: boolean;
  },
) {
  const { rows } = await db.query<{
    id: string;
    order_id: string;
    quantity: number;
    unit_price_minor: number;
    non_returnable_to_stock: boolean;
  }>(
    `SELECT id,order_id,quantity,unit_price_minor,non_returnable_to_stock FROM order_items WHERE id=$1 AND addon_id IS NOT NULL FOR UPDATE`,
    [input.order_item_id],
  );
  const item = rows[0];
  if (!item) throw new Error("item_not_found");
  const existing = await db.query(
    "SELECT id FROM wink_addon_refunds WHERE provider_refund_id=$1",
    [input.provider_refund_id],
  );
  if (existing.rows.length) return;
  const previous = await db.query<{ quantity: number; amount: number }>(
    "SELECT COALESCE(SUM(quantity),0)::integer AS quantity,COALESCE(SUM(amount_minor),0)::integer AS amount FROM wink_addon_refunds WHERE order_item_id=$1",
    [item.id],
  );
  if (
    !Number.isInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity + previous.rows[0].quantity > item.quantity ||
    !Number.isSafeInteger(input.amount_minor) ||
    input.amount_minor <= 0 ||
    input.amount_minor + previous.rows[0].amount >
      item.quantity * item.unit_price_minor
  )
    throw new Error("invalid_refund");
  if (input.restock && item.non_returnable_to_stock)
    throw new Error("personalized_item_not_returnable_to_stock");
  await db.query(
    "INSERT INTO wink_addon_refunds(order_item_id,provider_refund_id,quantity,amount_minor,restock) VALUES($1,$2,$3,$4,$5)",
    [
      item.id,
      input.provider_refund_id,
      input.quantity,
      input.amount_minor,
      input.restock,
    ],
  );
  if (input.restock) {
    const parts = await db.query<{
      addon_id: string;
      quantity: number;
      returned_quantity: number;
    }>(
      `SELECT c.* FROM wink_order_addon_components c JOIN wink_addon_stock s ON s.addon_id=c.addon_id WHERE c.order_item_id=$1 ORDER BY c.addon_id FOR UPDATE OF s,c`,
      [item.id],
    );
    for (const p of parts.rows) {
      const qty = Math.min(
        p.quantity - p.returned_quantity,
        (p.quantity / item.quantity) * input.quantity,
      );
      const consumed = await db.query(
        `SELECT 1 FROM wink_addon_reservations WHERE order_id=$1 AND addon_id=$2 AND state='CONSUMED'`,
        [item.order_id, p.addon_id],
      );
      if (consumed.rows.length) {
        await db.query(
          "UPDATE wink_addon_stock SET stock_quantity=stock_quantity+$2 WHERE addon_id=$1",
          [p.addon_id, qty],
        );
        await db.query(
          "UPDATE wink_order_addon_components SET returned_quantity=returned_quantity+$3 WHERE order_item_id=$1 AND addon_id=$2",
          [item.id, p.addon_id, qty],
        );
      }
    }
  }
}
export type OperationalItem = {
  sku_snapshot: string;
  name_snapshot: string;
  quantity: number;
  purchase_context?: string;
  personalization_snapshot?: Record<string, string>;
  components_snapshot?: { sku: string; name: string; quantity: number }[];
};
/** Plain text only: Telegram sender must omit parse_mode. Never interpolate customer text into HTML. */
export function addonPackingLines(items: OperationalItem[]) {
  return items.flatMap((i) => [
    `${i.sku_snapshot} · ${i.name_snapshot} × ${i.quantity}`,
    ...(i.components_snapshot || []).map(
      (c) => `  ☐ ${c.sku} · ${c.name} × ${c.quantity * i.quantity}`,
    ),
    ...Object.entries(i.personalization_snapshot || {}).map(
      ([k, v]) => `  ☐ ${k}: ${v}`,
    ),
  ]);
}
/** Cancellation is explicit about physical use; monetary refund is a separate verified provider operation. */
export async function restockCanceledAddons(
  db: DB,
  orderId: string,
  unusedLineIds: string[],
) {
  await db.query("SELECT id FROM orders WHERE id=$1 FOR UPDATE", [orderId]);
  await releasePayment(db, orderId);
  const parts = await db.query<{
    order_item_id: string;
    addon_id: string;
    quantity: number;
    returned_quantity: number;
    non_returnable_to_stock: boolean;
  }>(
    `SELECT c.*,i.non_returnable_to_stock FROM wink_order_addon_components c JOIN order_items i ON i.id=c.order_item_id JOIN wink_addon_stock s ON s.addon_id=c.addon_id WHERE i.order_id=$1 AND i.id=ANY($2::uuid[]) ORDER BY c.addon_id,c.order_item_id FOR UPDATE OF s,c,i`,
    [orderId, unusedLineIds],
  );
  for (const p of parts.rows) {
    if (p.non_returnable_to_stock) continue;
    const consumed = await db.query(
      `SELECT 1 FROM wink_addon_reservations WHERE order_id=$1 AND addon_id=$2 AND state='CONSUMED'`,
      [orderId, p.addon_id],
    );
    const remaining = p.quantity - p.returned_quantity;
    if (consumed.rows.length && remaining > 0) {
      await db.query(
        "UPDATE wink_addon_stock SET stock_quantity=stock_quantity+$2 WHERE addon_id=$1",
        [p.addon_id, remaining],
      );
      await db.query(
        "UPDATE wink_order_addon_components SET returned_quantity=quantity WHERE order_item_id=$1 AND addon_id=$2",
        [p.order_item_id, p.addon_id],
      );
    }
  }
}
