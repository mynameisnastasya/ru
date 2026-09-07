"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { API_URL } from "@/lib/wink-shop";
import { WINK_DEMO } from "@/lib/wink-mode";
export type WinkEvent = {
  event: string;
  path?: string;
  product_slug?: string;
  [key: string]: string | number | boolean | null | undefined;
};
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}
export function trackWink(event: WinkEvent) {
  if (typeof window === "undefined" || WINK_DEMO) return;
  const payload = { ...event, path: event.path || window.location.pathname };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("wink:analytics", { detail: payload }));
}
function slug(path: string) {
  return path.match(/\/product\/([^/?#]+)/)?.[1];
}
export default function WinkAnalytics2026() {
  const pathname = usePathname();
  useEffect(() => {
    if (WINK_DEMO) return;
    const params = new URLSearchParams(window.location.search);
    const attribution = Object.fromEntries(
      ["source", "medium", "campaign", "content", "term"]
        .map((key) => [key, params.get("utm_" + key)])
        .filter(([, value]) => value),
    );
    if (Object.keys(attribution).length) {
      try {
        window.sessionStorage.setItem(
          "wink-attribution",
          JSON.stringify(attribution),
        );
      } catch {}
    }
    const event = /\/product\//.test(pathname)
      ? "view_product"
      : /\/checkout\/?$/.test(pathname)
        ? "begin_checkout"
        : /\/shop\/?$/.test(pathname)
          ? "view_catalog"
          : "page_view";
    trackWink({ event, product_slug: slug(pathname), ...attribution });
  }, [pathname]);
  useEffect(() => {
    if (WINK_DEMO) return;
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const link = e.target.closest("a");
      const href = link?.getAttribute("href") || "";
      if (href.includes("/product/"))
        trackWink({ event: "product_click", product_slug: slug(href) });
      else if (href.includes("#finder")) trackWink({ event: "finder_open" });
    };
    const onAdd = (event: Event) => {
      const detail = (event as CustomEvent<{ slug: string; price: number }>)
        .detail;
      trackWink({
        event: "add_to_cart",
        product_slug: detail.slug,
        value: detail.price,
      });
    };
    const onOrder = (event: Event) => {
      const detail = (event as CustomEvent<{ value: number }>).detail;
      trackWink({ event: "order_created", value: detail.value });
    };
    const onAddon = (event: Event) => {
      const d = (
        event as CustomEvent<{
          event_id: string;
          event_name: string;
          addon_id: string;
          main_slug?: string;
        }>
      ).detail;
      if (
        ![
          "addon_view",
          "addon_click",
          "addon_add",
          "addon_remove",
          "bundle_view",
          "bundle_add",
        ].includes(d.event_name)
      )
        return;
      trackWink({
        event: d.event_name,
        addon_id: d.addon_id,
        product_slug: d.main_slug,
      });
      void fetch(`${API_URL}/api/addons/events`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(d),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener("wink-addon-event", onAddon);
    document.addEventListener("click", onClick, true);
    window.addEventListener("wink-add-to-cart", onAdd);
    window.addEventListener("wink-order-created", onOrder);
    return () => {
      window.removeEventListener("wink-addon-event", onAddon);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("wink-add-to-cart", onAdd);
      window.removeEventListener("wink-order-created", onOrder);
    };
  }, []);
  return null;
}
