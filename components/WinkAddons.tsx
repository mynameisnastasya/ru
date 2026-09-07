"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Addon,
  AddonCatalog,
  RecommendationContext,
  stockLabel,
  addonPrice,
  availableQuantity,
  personalization,
  recommendations,
} from "@/lib/wink-addons";
import {
  addAddonLine,
  bundleConflicts,
  cartAddonIds,
} from "@/lib/wink-addon-cart";
import {
  CartLine,
  SHOP_EVENT,
  createClientId,
  money,
  readCart,
  writeCart,
} from "@/lib/wink-shop";
import { ShopDialog } from "./WinkShopUI";
export function addonEvent(name: string, a: Addon, main?: string) {
  window.dispatchEvent(
    new CustomEvent("wink-addon-event", {
      detail: {
        event_id: createClientId(),
        event_name: name,
        addon_id: a.id,
        main_slug: main,
      },
    }),
  );
}
export function AddonCards({
  items,
  catalog,
  context = {},
  standalone = false,
}: {
  items: Addon[];
  catalog: AddonCatalog;
  context?: RecommendationContext;
  standalone?: boolean;
}) {
  const [cart, setCart] = useState<CartLine[]>([]),
    [opened, setOpened] = useState<Addon | null>(null),
    [replace, setReplace] = useState<Addon | null>(null),
    [fields, setFields] = useState<Record<string, string>>({}),
    [error, setError] = useState("");
  useEffect(() => {
    function sync() {
      try {
        setCart(readCart());
      } catch {
        setError("Не удалось прочитать корзину.");
      }
    }
    sync();
    window.addEventListener(SHOP_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHOP_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const ids = items.map((a) => a.id).join(",");
  useEffect(() => {
    items.forEach((a) =>
      addonEvent(
        a.product_type === "BUNDLE" ? "bundle_view" : "addon_view",
        a,
        context.product_id,
      ),
    );
  }, [ids, context.product_id]); // eslint-disable-line react-hooks/exhaustive-deps
  function open(a: Addon) {
    setOpened(a);
    setFields({});
    setError("");
    addonEvent("addon_click", a, context.product_id);
  }
  function add(a: Addon, confirm = false) {
    try {
      const lines = readCart();
      if (a.personalization_enabled && !opened) {
        open(a);
        return;
      }
      personalization(a, fields);
      if (bundleConflicts(a, lines).length && !confirm) {
        setReplace(a);
        return;
      }
      writeCart(
        addAddonLine(
          lines,
          a,
          catalog,
          fields,
          standalone ? "STANDALONE" : "ADDON",
          context.product_id,
          confirm,
        ),
      );
      setOpened(null);
      setReplace(null);
      setFields({});
      setError("");
      addonEvent(
        a.product_type === "BUNDLE" ? "bundle_add" : "addon_add",
        a,
        context.product_id,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось добавить товар.");
    }
  }
  function remove(a: Addon) {
    try {
      writeCart(readCart().filter((l) => l.addon?.id !== a.id));
      addonEvent("addon_remove", a, context.product_id);
      setError("");
    } catch {
      setError("Не удалось обновить корзину.");
    }
  }
  function price(a: Addon) {
    try {
      return addonPrice(a, a.id === opened?.id ? fields : {});
    } catch {
      return a.price_minor || 0;
    }
  }
  function controls(a: Addon) {
    const selected = cart.some((l) => l.addon?.id === a.id);
    return (
      <button
        type="button"
        className={`wk-button ${selected ? "secondary" : ""}`}
        onClick={() => (selected ? remove(a) : add(a))}
        disabled={
          !catalog.checkout_enabled || availableQuantity(a, catalog.items) < 1
        }
      >
        {selected
          ? "Добавлено ✓ · убрать"
          : standalone && !a.allow_standalone
            ? "Выбрать композицию"
            : "+ Добавить"}
      </button>
    );
  }
  return (
    <>
      <div className="wk-addon-grid">
        {items.map((a) => (
          <article key={a.id} className="wk-addon-card">
            <button
              className="wk-addon-photo"
              type="button"
              aria-label={`Посмотреть ${a.short_name || a.name}`}
              onClick={() => open(a)}
            >
              {a.images[0] ? (
                <Image
                  unoptimized
                  width={600}
                  height={600}
                  src={a.images[0].url}
                  alt={a.images[0].alt}
                  loading="lazy"
                />
              ) : (
                <span className="wk-addon-wordmark">
                  WINK<span>Фото скоро появится</span>
                </span>
              )}
            </button>
            <div className="wk-addon-content">
              {a.is_wink_original && (
                <small className="wk-eyebrow">WINK ORIGINAL</small>
              )}
              <h3>{a.short_name || a.name}</h3>
              <p>
                {[a.size_cm ? `${a.size_cm} см` : "", a.color]
                  .filter(Boolean)
                  .join(" · ") || a.short_description}
              </p>
              <small>{stockLabel(a, catalog.items)}</small>
              <strong>
                {standalone ? "" : "+"}
                {money(price(a))}
              </strong>
              {standalone && !a.allow_standalone ? (
                <Link className="wk-button secondary" href="/shop">
                  К композиции →
                </Link>
              ) : (
                controls(a)
              )}
            </div>
          </article>
        ))}
      </div>
      {error && (
        <p className="wk-error" role="alert">
          {error}
        </p>
      )}
      <ShopDialog
        open={!!opened}
        title={opened?.short_name || opened?.name || "Дополнить подарок"}
        onClose={() => {
          setOpened(null);
          setFields({});
          setError("");
        }}
      >
        {opened && (
          <div className="wk-addon-detail">
            {opened.images[0] && (
              <Image
                unoptimized
                width={800}
                height={800}
                src={opened.images[0].url}
                alt={opened.images[0].alt}
              />
            )}
            <p>{opened.full_description || opened.short_description}</p>
            {opened.components.length > 0 && (
              <ul>
                {opened.components.map((c) => (
                  <li key={c.product_id}>
                    {catalog.items.find((a) => a.id === c.product_id)
                      ?.short_name || "Дополнение"}{" "}
                    × {c.quantity}
                  </li>
                ))}
              </ul>
            )}
            {opened.personalization_enabled &&
              opened.personalization_fields.map((f) => (
                <label className="wk-field" key={f.key}>
                  {f.label}
                  {f.required ? " *" : " · необязательно"}
                  {f.options?.length ? (
                    <select
                      value={fields[f.key] || ""}
                      onChange={(e) =>
                        setFields({ ...fields, [f.key]: e.target.value })
                      }
                    >
                      <option value="">Выберите</option>
                      {f.options.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type || "text"}
                      required={f.required}
                      maxLength={f.max_length}
                      value={fields[f.key] || ""}
                      onChange={(e) =>
                        setFields({ ...fields, [f.key]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
            {opened.personalization_enabled &&
              opened.personalization_price_minor > 0 && (
                <p>
                  Персонализация · +{money(opened.personalization_price_minor)}
                </p>
              )}
            <strong>
              {standalone ? "" : "+"}
              {money(price(opened))}
            </strong>
            {error && (
              <p className="wk-error" role="alert">
                {error}
              </p>
            )}
            {standalone && !opened.allow_standalone ? (
              <Link className="wk-button" href="/shop">
                Выбрать композицию
              </Link>
            ) : (
              <button
                type="button"
                className="wk-button"
                onClick={() => add(opened)}
                disabled={opened.personalization_fields.some(
                  (f) => f.required && !fields[f.key]?.trim(),
                )}
              >
                Добавить к заказу
              </button>
            )}
          </div>
        )}
      </ShopDialog>
      <ShopDialog
        open={!!replace}
        title="В наборе уже есть ваш выбор"
        onClose={() => setReplace(null)}
      >
        <p>
          В {replace?.name} входит товар, который вы уже добавили. Заменить
          отдельную позицию на набор?
        </p>
        <div className="wk-actions">
          <button
            type="button"
            className="wk-button"
            onClick={() => replace && add(replace, true)}
          >
            Заменить
          </button>
          <button
            type="button"
            className="wk-button secondary"
            onClick={() => setReplace(null)}
          >
            Оставить как есть
          </button>
        </div>
      </ShopDialog>
    </>
  );
}
export function AddonRecommendations({
  catalog,
  context,
  cartMode = false,
}: {
  catalog: AddonCatalog;
  context: RecommendationContext;
  cartMode?: boolean;
}) {
  const [excluded, setExcluded] = useState<string[]>([]);
  useEffect(() => {
    function sync() {
      try {
        setExcluded(cartAddonIds(readCart()));
      } catch {}
    }
    sync();
    window.addEventListener(SHOP_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHOP_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const items = recommendations(
    catalog,
    context,
    cartMode ? excluded : [],
    cartMode ? 2 : 3,
  );
  if (!items.length || !catalog.checkout_enabled) return null;
  return (
    <section className="wk-addons">
      <p className="wk-eyebrow">Маленькое продолжение</p>
      <h2>{cartMode ? "Последний штрих" : "Дополнить подарок"}</h2>
      <p>Несколько вещей, которые красиво работают именно с этим сетом.</p>
      <AddonCards items={items} catalog={catalog} context={context} />
    </section>
  );
}
