"use client";

import { useEffect, useState } from "react";

const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";

type PublicOrder = {
  number: string;
  status: string;
  delivery_date: string;
  delivery_slot?: string | null;
  items: Array<{
    name: string;
    subtitle?: string | null;
    quantity: number;
    configuration?: { palette?: string; number?: string | null; addons?: string[] };
  }>;
};

const labels: Record<string, string> = {
  AWAITING_PAYMENT: "Ждём оплату",
  PAID: "Приняли",
  NEEDS_CLARIFICATION: "Нужно уточнение",
  CONFIRMED: "Приняли",
  ASSEMBLY: "Собираем",
  QUALITY_CHECK: "Проверяем",
  READY: "Готовим к отправке",
  COURIER_ASSIGNED: "Передаём курьеру",
  OUT_FOR_DELIVERY: "Уже едет",
  DELIVERED: "Доставили",
  CANCELED: "Заказ отменён",
  REFUNDED: "Возврат завершён",
};

export default function WinkOrderStatus() {
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let token = params.get("token") || "";
    if (!token) {
      try {
        const last = JSON.parse(window.localStorage.getItem("wink-last-order") || "null");
        token = last?.public_token || "";
      } catch {}
    }

    let cancelled = false;
    const load = async () => {
      if (!token) {
        if (!cancelled) {
          setError("Нет безопасной ссылки на заказ.");
          setLoading(false);
        }
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/orders/public/${encodeURIComponent(token)}`);
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error?.message || "Не удалось загрузить заказ.");
        if (!cancelled) {
          setOrder(data.order as PublicOrder);
          setError("");
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Не удалось загрузить заказ.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(load, 30_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#F7F3EE", color: "#242222", padding: "24px 16px 80px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <a href="../" style={{ color: "inherit", textDecoration: "none", fontWeight: 700, fontSize: 32, letterSpacing: "-.05em" }}>WINK</a>
        <div style={{ marginTop: 72 }}>
          <p style={{ textTransform: "uppercase", letterSpacing: ".14em", fontSize: 10, opacity: .55 }}>Статус заказа</p>
          {loading && <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(42px,8vw,72px)", fontWeight: 400 }}>Смотрим, где подарок…</h1>}
          {error && !loading && <><h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(42px,8vw,72px)", fontWeight: 400 }}>Не нашли заказ.</h1><p>{error}</p></>}
          {order && !loading && <>
            <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(48px,9vw,84px)", lineHeight: .95, fontWeight: 400, marginBottom: 16 }}>{labels[order.status] || order.status}.</h1>
            <p style={{ fontSize: 15, opacity: .65 }}>#{order.number} · {order.delivery_date}{order.delivery_slot ? ` · ${order.delivery_slot}` : ""}</p>
            <div style={{ marginTop: 48, background: "#FFFDFC", borderRadius: 20, padding: 24, border: "1px solid rgba(36,34,34,.1)" }}>
              <p style={{ marginTop: 0, textTransform: "uppercase", letterSpacing: ".12em", fontSize: 10, opacity: .5 }}>Ваш WINK</p>
              {order.items.map((item, index) => {
                const c = item.configuration || {};
                const details = [c.palette, c.number ? `цифры ${c.number}` : "", ...(c.addons || [])].filter(Boolean).join(" · ");
                return <div key={`${item.name}-${index}`} style={{ padding: "18px 0", borderTop: index ? "1px solid rgba(36,34,34,.1)" : "none" }}><strong>{item.quantity}× {item.name}</strong>{item.subtitle && <div style={{ marginTop: 5, opacity: .6 }}>{item.subtitle}</div>}{details && <div style={{ marginTop: 5, fontSize: 13, opacity: .65 }}>{details}</div>}</div>;
              })}
            </div>
            <p style={{ marginTop: 24, fontSize: 13, opacity: .55 }}>Здесь нет телефонов, полного адреса и личного текста подарка. Статус обновляется автоматически.</p>
          </>}
        </div>
      </div>
    </main>
  );
}
