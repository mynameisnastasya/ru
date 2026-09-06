"use client";

import { useEffect } from "react";

export type WinkEvent = {
  event: string;
  path?: string;
  label?: string;
  product_slug?: string;
  value?: string;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  [key: string]: string | number | boolean | null | undefined;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackWink(event: WinkEvent) {
  if (typeof window === "undefined") return;
  const payload = { ...event, path: event.path || window.location.pathname };
  window.dataLayer?.push(payload);
  window.dispatchEvent(new CustomEvent("wink:analytics", { detail: payload }));
}

function classifyPath(path: string) {
  if (/\/product\//.test(path)) return "view_product";
  if (/\/checkout\/?$/.test(path)) return "begin_checkout";
  if (/\/shop\/?$/.test(path)) return "view_catalog";
  if (/\/occasion\//.test(path) || /\/(for-her|for-him|kids|room|wow|build)\/?$/.test(path)) return "view_collection";
  if (/\/favorites\/?$/.test(path)) return "view_favorites";
  if (/\/search\/?$/.test(path)) return "view_search";
  return "page_view";
}

function productSlug(path: string) {
  return path.match(/\/product\/([^/?#]+)/)?.[1] || undefined;
}

function cleanLabel(element: Element | null) {
  return (element?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);
}

function clickEvent(target: Element): WinkEvent | null {
  const clickable = target.closest("a,button");
  if (!clickable) return null;
  const label = cleanLabel(clickable);
  const href = clickable instanceof HTMLAnchorElement ? clickable.getAttribute("href") || "" : "";
  const lower = label.toLowerCase();

  if (clickable.matches(".wp26-palettes button")) return { event: "palette_change", label, value: label };
  if (clickable.matches(".wp26-foil button")) return { event: "foil_color_change", label, value: label };
  if (clickable.matches(".wp26-sizes a")) return { event: "size_change", label, value: href };
  if (clickable.matches(".wp26-addon")) return { event: "addon_toggle", label: "Банты" };
  if (clickable.matches(".wp26-add,.wp26-mobile button")) return { event: "add_to_cart", label };
  if (clickable.matches(".wp26-main > button") || lower.includes("избран") || label === "♡" || label === "♥") return { event: "favorite_toggle", label };
  if (href.includes("#finder") || lower.includes("подбер")) return { event: "finder_open", label };
  if (href.includes("/checkout") || lower === "оформить" || lower.includes("оформить заказ")) return { event: "checkout_click", label };
  if (href.includes("/product/")) return { event: "product_click", label, value: href };
  if (href.includes("/search")) return { event: "search_click", label };
  return null;
}

function changeEvent(target: Element): WinkEvent | null {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return null;
  const label = cleanLabel(target.closest("label"));

  if (target instanceof HTMLInputElement && target.type === "date") return { event: "delivery_date_change", value: target.value };
  if (target instanceof HTMLSelectElement && /время|слот/i.test(label)) return { event: "delivery_slot_change", value: target.value };
  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    if (/сюрприз/i.test(label)) return { event: "surprise_toggle", value: target.checked ? "on" : "off" };
    if (/аноним/i.test(label)) return { event: "anonymous_toggle", value: target.checked ? "on" : "off" };
    if (/у двери/i.test(label)) return { event: "leave_at_door_toggle", value: target.checked ? "on" : "off" };
  }
  if (target.matches(".wp26-number")) return { event: "personalization_number_change", value: target.value };
  return null;
}

export default function WinkAnalytics2026() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const slug = productSlug(path);
    trackWink({
      event: classifyPath(path),
      path,
      product_slug: slug,
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
    });

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const detail = clickEvent(event.target);
      if (detail) trackWink({ ...detail, product_slug: slug });
    };
    const onChange = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const detail = changeEvent(event.target);
      if (detail) trackWink({ ...detail, product_slug: slug });
    };

    let orderCreatedSent = false;
    const observer = new MutationObserver(() => {
      if (orderCreatedSent || !document.querySelector(".wc26-success")) return;
      orderCreatedSent = true;
      trackWink({ event: "order_created" });
    });

    document.addEventListener("click", onClick, true);
    document.addEventListener("change", onChange, true);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("change", onChange, true);
      observer.disconnect();
    };
  }, []);

  return null;
}
