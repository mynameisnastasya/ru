"use client";

import { useEffect } from "react";

export type WinkEvent = {
  event: string;
  path?: string;
  label?: string;
  product_slug?: string;
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
  if (/\/occasion\//.test(path) || /\/(for-her|for-him|kids|room)\/?$/.test(path)) return "view_collection";
  if (/\/favorites\/?$/.test(path)) return "view_favorites";
  if (/\/search\/?$/.test(path)) return "view_search";
  return "page_view";
}

function productSlug(path: string) {
  const match = path.match(/\/product\/([^/?#]+)/);
  return match?.[1] || undefined;
}

function eventForClick(target: Element) {
  const clickable = target.closest("a,button");
  if (!clickable) return null;
  const text = (clickable.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);
  const href = clickable instanceof HTMLAnchorElement ? clickable.getAttribute("href") || "" : "";
  const lower = text.toLowerCase();
  if (lower.includes("добавить") && (lower.includes("корз") || lower.includes("gift") || lower === "добавить")) return "add_to_cart";
  if (lower.includes("избран") || text === "♡" || text === "♥") return "favorite_click";
  if (lower.includes("подбер") || href.includes("#finder")) return "finder_click";
  if (lower.includes("оформ") || href.includes("/checkout")) return "checkout_click";
  if (lower.includes("палитр")) return "palette_click";
  if (href.includes("/product/")) return "product_click";
  if (href.includes("/search")) return "search_click";
  return null;
}

export default function WinkAnalytics2026() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    trackWink({
      event: classifyPath(path),
      path,
      product_slug: productSlug(path),
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
    });

    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const name = eventForClick(event.target);
      if (!name) return;
      const clickable = event.target.closest("a,button");
      trackWink({ event: name, label: (clickable?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120), product_slug: productSlug(window.location.pathname) });
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);

  return null;
}
