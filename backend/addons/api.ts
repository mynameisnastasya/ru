/** Mount before the existing router. Existing staff JWT verification and CORS remain mandatory. */
import { Addon } from "../../lib/wink-addons";
import {
  ADDON_DEFAULTS,
  DB,
  Staff,
  getAddonCatalog,
  publicAddon,
  requireCatalogRole,
  requireFinanceRole,
  saveAddon,
} from "./catalog";
export type AddonDependencies = {
  db: DB;
  transaction: <T>(work: (db: DB) => Promise<T>) => Promise<T>;
  verifyStaff: (request: Request) => Promise<Staff>;
  rateLimit: (request: Request) => Promise<boolean>;
  checkoutEnabled: boolean; // enable only after order + reserve + payment + refund hooks are mounted
};
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });
const isUUID = (v: unknown) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
async function bodyOf(request: Request) {
  const raw = await request.text();
  if (raw.length > 64000) throw new Error("request_too_large");
  return JSON.parse(raw) as Record<string, unknown>;
}
export async function handleAddonRequest(
  request: Request,
  deps: AddonDependencies,
): Promise<Response | null> {
  const path = new URL(request.url).pathname.replace(/\/$/, "");
  if (!path.startsWith("/api/addons") && !path.startsWith("/api/admin/addons"))
    return null;
  try {
    if (path === "/api/addons" && request.method === "GET")
      return json(await getAddonCatalog(deps.db, deps.checkoutEnabled));
    if (path === "/api/addons/events" && request.method === "POST") {
      if (!(await deps.rateLimit(request)))
        return json({ error: { message: "Попробуйте позже." } }, 429);
      const b = await bodyOf(request);
      if (
        !isUUID(b.event_id) ||
        !isUUID(b.addon_id) ||
        ![
          "addon_view",
          "addon_click",
          "addon_add",
          "addon_remove",
          "bundle_view",
          "bundle_add",
        ].includes(String(b.event_name))
      )
        throw new Error("invalid_event");
      await deps.db.query(
        `INSERT INTO wink_addon_events(event_id,event_name,addon_id,main_slug) SELECT $1,$2,id,$4 FROM wink_addons WHERE id=$3 AND status='ACTIVE' ON CONFLICT DO NOTHING`,
        [
          b.event_id,
          b.event_name,
          b.addon_id,
          typeof b.main_slug === "string" ? b.main_slug.slice(0, 100) : null,
        ],
      );
      return json({ ok: true });
    }
    if (!path.startsWith("/api/admin/addons"))
      return json({ error: { message: "Не найдено." } }, 404);
    let staff: Staff;
    try {
      staff = await deps.verifyStaff(request);
    } catch {
      return json({ error: { message: "Войдите в рабочий кабинет." } }, 401);
    }
    requireCatalogRole(staff);
    if (path === "/api/admin/addons" && request.method === "GET") {
      const rows = await deps.db.query(
        `SELECT a.*,s.*,COALESCE(op.data,'{}') AS operations_data,COALESCE((SELECT jsonb_agg(jsonb_build_object('product_id',c.product_id,'quantity',c.quantity)) FROM wink_bundle_components c WHERE c.bundle_id=a.id),'[]') AS components FROM wink_addons a JOIN wink_addon_availability s ON s.addon_id=a.id LEFT JOIN wink_addon_operations op ON op.addon_id=a.id ORDER BY a.sku`,
      );
      const items = rows.rows.map((r) => ({
        product: publicAddon(r),
        operations_data: r.operations_data,
        revision: r.revision,
        stock_quantity: r.stock_quantity,
        minimum_stock: r.minimum_stock,
        reserved_quantity: r.reserved_quantity,
      }));
      const recs = await deps.db.query(
        "SELECT main_slug,addon_ids,revision FROM wink_addon_recommendations",
      );
      const products = await deps.db.query(
        "SELECT slug,name,subtitle FROM products ORDER BY sort_weight,slug",
      );
      return json({
        items,
        recommendations: recs.rows,
        products: products.rows,
        checkout_enabled: deps.checkoutEnabled,
      });
    }
    if (path === "/api/admin/addons" && request.method === "PUT") {
      const b = await bodyOf(request);
      const raw = b.product as Addon;
      if (!raw || !isUUID(raw.id)) throw new Error("invalid_product");
      const product = { ...ADDON_DEFAULTS, ...raw };
      await deps.transaction(async (db) => {
        await saveAddon(db, staff, product, Number(b.revision), {
          stock_quantity: Number(b.stock_quantity),
          minimum_stock: Number(b.minimum_stock),
        });
        const rawOps = (b.operations_data as Record<string, unknown>) || {};
        const ops = Object.fromEntries(
          [
            "weight",
            "manufacturer",
            "supplier",
            "supplier_sku",
            "country",
            "storage_volume",
            "can_be_vacuum_packed",
            "requires_restoration_after_shipping",
            "safety_documents",
            "lead_time",
            "minimum_order_quantity",
          ]
            .filter((k) => k in rawOps)
            .map((k) => [k, rawOps[k]]),
        );
        await db.query(
          "INSERT INTO wink_addon_operations VALUES($1,$2) ON CONFLICT(addon_id) DO UPDATE SET data=$2",
          [product.id, JSON.stringify(ops)],
        );
      });
      return json({ ok: true });
    }
    if (
      path === "/api/admin/addons/recommendations" &&
      request.method === "PUT"
    ) {
      const b = await bodyOf(request);
      if (
        typeof b.main_slug !== "string" ||
        !Array.isArray(b.addon_ids) ||
        b.addon_ids.length > 20 ||
        !b.addon_ids.every(isUUID) ||
        new Set(b.addon_ids).size !== b.addon_ids.length
      )
        throw new Error("invalid_recommendations");
      await deps.transaction(async (db) => {
        const ids = await db.query(
          "SELECT id FROM wink_addons WHERE id=ANY($1::uuid[])",
          [b.addon_ids],
        );
        if (ids.rows.length !== (b.addon_ids as string[]).length)
          throw new Error("addon_not_found");
        const result = await db.query(
          `INSERT INTO wink_addon_recommendations(main_slug,addon_ids) VALUES($1,$2) ON CONFLICT(main_slug) DO UPDATE SET addon_ids=excluded.addon_ids,revision=wink_addon_recommendations.revision+1 WHERE wink_addon_recommendations.revision=$3 RETURNING revision`,
          [b.main_slug, b.addon_ids, Number(b.revision)],
        );
        if (!result.rows.length)
          throw new Error("Рекомендации уже изменены. Обновите страницу.");
        await db.query(
          "INSERT INTO wink_addon_audit(actor_id,entity_id,action) VALUES($1,$2,$3)",
          [staff.id, b.main_slug, "RECOMMENDATIONS_SAVE"],
        );
      });
      return json({ ok: true });
    }
    const finance = path.match(
      /^\/api\/admin\/addons\/([0-9a-f-]+)\/finance$/i,
    );
    if (finance) {
      requireFinanceRole(staff);
      const id = finance[1];
      if (request.method === "GET")
        return json({
          finance:
            (
              await deps.db.query(
                `SELECT f.*,a.price_minor, a.price_minor-f.cost_price_minor-f.variable_cost_minor AS gross_profit_minor,round((a.price_minor-f.cost_price_minor-f.variable_cost_minor)*100.0/nullif(a.price_minor,0),1) AS gross_margin FROM wink_addon_finance f JOIN wink_addons a ON a.id=f.addon_id WHERE a.id=$1`,
                [id],
              )
            ).rows[0] || null,
          history: (
            await deps.db.query(
              "SELECT cost_price_minor,variable_cost_minor,created_at FROM wink_addon_cost_history WHERE addon_id=$1 ORDER BY created_at DESC LIMIT 30",
              [id],
            )
          ).rows,
        });
      if (request.method === "PUT") {
        const b = await bodyOf(request);
        const cost = Number(b.cost_price_minor),
          variable = Number(b.variable_cost_minor),
          threshold = Number(b.minimum_margin);
        if (
          !Number.isSafeInteger(cost) ||
          cost < 0 ||
          !Number.isSafeInteger(variable) ||
          variable < 0 ||
          !Number.isFinite(threshold) ||
          threshold < 0 ||
          threshold > 100
        )
          throw new Error("invalid_finance");
        await deps.transaction(async (db) => {
          await db.query("SELECT id FROM wink_addons WHERE id=$1 FOR UPDATE", [
            id,
          ]);
          await db.query(
            `INSERT INTO wink_addon_finance(addon_id,cost_price_minor,variable_cost_minor,minimum_margin,supplier_data) VALUES($1,$2,$3,$4,$5) ON CONFLICT(addon_id) DO UPDATE SET cost_price_minor=$2,variable_cost_minor=$3,minimum_margin=$4,supplier_data=$5`,
            [
              id,
              cost,
              variable,
              threshold,
              JSON.stringify(b.supplier_data || {}),
            ],
          );
          await db.query(
            "INSERT INTO wink_addon_cost_history(addon_id,cost_price_minor,variable_cost_minor,actor_id) VALUES($1,$2,$3,$4)",
            [id, cost, variable, staff.id],
          );
        });
        return json({ ok: true });
      }
    }
    if (path === "/api/admin/addons/metrics" && request.method === "GET") {
      requireFinanceRole(staff);
      const summary = await deps.db
        .query(`WITH paid AS (SELECT id FROM orders WHERE paid_at IS NOT NULL), ai AS (SELECT i.*,COALESCE(r.amount,0) AS refunded FROM order_items i JOIN paid p ON p.id=i.order_id LEFT JOIN (SELECT order_item_id,SUM(amount_minor) AS amount FROM wink_addon_refunds GROUP BY order_item_id) r ON r.order_item_id=i.id WHERE i.addon_id IS NOT NULL)
   SELECT (SELECT COUNT(*) FROM paid)::integer AS paid_orders,COUNT(DISTINCT ai.order_id)::integer AS attached_orders,COALESCE(SUM(ai.line_total_minor-ai.refunded),0)::bigint AS addon_revenue_minor,COALESCE(SUM(CASE WHEN f.order_item_id IS NOT NULL THEN ai.line_total_minor-ai.refunded-f.cost_snapshot_minor-f.variable_cost_snapshot_minor END),0)::bigint AS addon_gross_profit_minor, COUNT(*) FILTER(WHERE f.order_item_id IS NULL)::integer AS missing_cost_snapshots FROM ai LEFT JOIN wink_order_item_finance f ON f.order_item_id=ai.id`);
      const pairs = await deps.db.query(
        `SELECT i.main_sku_snapshot,i.sku_snapshot,i.purchase_context,SUM(i.quantity)::integer AS quantity FROM order_items i JOIN orders o ON o.id=i.order_id WHERE i.addon_id IS NOT NULL AND o.paid_at IS NOT NULL GROUP BY i.main_sku_snapshot,i.sku_snapshot,i.purchase_context ORDER BY quantity DESC LIMIT 100`,
      );
      return json({ summary: summary.rows[0], pairs: pairs.rows });
    }
    return json({ error: { message: "Не найдено." } }, 404);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось выполнить запрос.";
    if (message === "forbidden")
      return json({ error: { message: "Недостаточно прав." } }, 403);
    return json(
      {
        error: {
          message: /^[a-z_]+$/.test(message)
            ? "Проверьте данные и повторите попытку."
            : message,
        },
      },
      400,
    );
  }
}
