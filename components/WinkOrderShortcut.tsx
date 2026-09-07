"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { SHOP_EVENT, isConfirmedOrder } from "@/lib/wink-shop";
import { WINK_DEMO } from "@/lib/wink-mode";
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(SHOP_EVENT, listener);
  window.addEventListener("wink-order-created", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(SHOP_EVENT, listener);
    window.removeEventListener("wink-order-created", listener);
  };
}
function snapshot() {
  if (WINK_DEMO) return null;
  try {
    return window.localStorage.getItem("wink-last-order");
  } catch {
    return null;
  }
}
export default function WinkOrderShortcut() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  let order: unknown;
  try {
    order = raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
  if (!isConfirmedOrder(order)) return null;
  return (
    <Link href={`/order/?token=${encodeURIComponent(order.public_token)}`}>
      Статус заявки № {order.number} →
    </Link>
  );
}
