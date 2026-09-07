import {
  Addon,
  AddonCatalog,
  addonPrice,
  availableQuantity,
  personalization,
  PurchaseContext,
} from "./wink-addons";
import { CartLine, createClientId } from "./wink-shop";
export function cartAddonIds(lines: CartLine[]) {
  return [
    ...new Set(
      lines.flatMap((l) =>
        l.addon
          ? [l.addon.id, ...l.addon.components.map((c) => c.product_id)]
          : [],
      ),
    ),
  ];
}
export function bundleConflicts(a: Addon, lines: CartLine[]) {
  const ids =
    a.product_type === "BUNDLE"
      ? a.components.map((c) => c.product_id)
      : [a.id];
  return lines.filter(
    (l) =>
      l.addon &&
      (ids.includes(l.addon.id) ||
        l.addon.components.some((c) => ids.includes(c.product_id))),
  );
}
export function addAddonLine(
  lines: CartLine[],
  a: Addon,
  catalog: AddonCatalog,
  input: Record<string, string> = {},
  context: PurchaseContext = "ADDON",
  parent?: string,
  replace = false,
): CartLine[] {
  if (!catalog.checkout_enabled || !availableQuantity(a, catalog.items))
    throw new Error(
      "Этот вариант сейчас недоступен. Выберите другое дополнение.",
    );
  if (context === "STANDALONE" && !a.allow_standalone)
    throw new Error("Это дополнение доступно только вместе с композицией.");
  if (context !== "STANDALONE" && !a.allow_as_addon)
    throw new Error("Этот товар нельзя добавить к композиции.");
  const conflicts = bundleConflicts(a, lines);
  if (conflicts.length && !replace)
    throw new Error("В корзине уже есть товар из этого набора.");
  const base = replace
    ? lines.filter((l) => !conflicts.some((c) => c.lineId === l.lineId))
    : lines;
  const p = personalization(a, input);
  const line: CartLine = {
    lineId: createClientId(),
    productId: a.slug,
    name: a.name,
    subtitle: a.short_name || a.name,
    qty: 1,
    unitPriceMinor: addonPrice(a, p.snapshot),
    config: { addons: [] },
    addon: {
      id: a.id,
      sku: a.sku,
      kind: a.product_type,
      purchase_context: a.product_type === "BUNDLE" ? "BUNDLE" : context,
      parent_product_id: parent,
      personalization: p.snapshot,
      components: a.components.map((c) => ({
        ...c,
        name: catalog.items.find((p) => p.id === c.product_id)?.name || "",
        sku: catalog.items.find((p) => p.id === c.product_id)?.sku || "",
      })),
      delivery_class: a.delivery_class,
      production_days: a.production_days,
    },
  };
  return [...base, line];
}
export function validateAddonCart(lines: CartLine[], catalog: AddonCatalog) {
  const demand = new Map<string, number>();
  for (const l of lines) {
    if (!l.addon) continue;
    const a = catalog.items.find((a) => a.id === l.addon!.id);
    if (!catalog.checkout_enabled || !a || !availableQuantity(a, catalog.items))
      throw new Error(
        `${l.subtitle}: этот вариант закончился или недоступен. Уберите его или выберите замену.`,
      );
    if (!a.allow_standalone && !lines.some((x) => !x.addon))
      throw new Error(`${l.subtitle}: добавьте основную композицию.`);
    if (l.addon.purchase_context === "STANDALONE" && !a.allow_standalone)
      throw new Error(`${l.subtitle}: отдельная покупка недоступна.`);
    if (
      l.addon.purchase_context !== "STANDALONE" &&
      !(
        a.product_type === "BUNDLE" &&
        a.allow_standalone &&
        !l.addon.parent_product_id
      ) &&
      !a.allow_as_addon
    )
      throw new Error(`${l.subtitle}: дополнение недоступно.`);
    personalization(a, l.addon.personalization);
    const parts =
      a.product_type === "BUNDLE"
        ? a.components
        : [{ product_id: a.id, quantity: 1 }];
    for (const p of parts)
      demand.set(
        p.product_id,
        (demand.get(p.product_id) || 0) + p.quantity * l.qty,
      );
  }
  for (const [id, qty] of demand) {
    const a = catalog.items.find((a) => a.id === id);
    if (!a || qty > availableQuantity(a, catalog.items))
      throw new Error(
        `${a?.short_name || "Дополнение"}: доступно меньше, чем в корзине. Уменьшите количество.`,
      );
  }
}
