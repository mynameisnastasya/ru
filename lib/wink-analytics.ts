export type WinkAnalyticsEvent =
  | "view_category"
  | "view_product"
  | "palette_change"
  | "size_change"
  | "delivery_date_selected"
  | "favorite_add"
  | "favorite_remove"
  | "add_to_cart"
  | "checkout_start"
  | "order_created"
  | "finder_start"
  | "finder_step"
  | "finder_complete"
  | "finder_result_click"
  | "search"
  | "reorder_click";

type Primitive = string | number | boolean | null | undefined;
export type WinkAnalyticsPayload = Record<string, Primitive>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function acquisitionContext() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    path: window.location.pathname,
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
  };
}

/**
 * Vendor-neutral client event bus for WINK.
 * Intentionally do not put phones, addresses, card messages or reveal secrets here.
 * Google/Yandex/etc. can subscribe later through dataLayer or the wink:analytics event.
 */
export function trackWinkEvent(event: WinkAnalyticsEvent, payload: WinkAnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  const detail = {
    event,
    wink: { ...acquisitionContext(), ...payload },
    event_time: new Date().toISOString(),
  };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(detail);
  window.dispatchEvent(new CustomEvent("wink:analytics", { detail }));
}
