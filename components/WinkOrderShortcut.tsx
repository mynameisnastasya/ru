"use client";

import { useEffect, useState } from "react";

type LastOrder = { number?: string; public_token?: string };

export default function WinkOrderShortcut() {
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("wink-last-order");
      if (raw) setOrder(JSON.parse(raw) as LastOrder);
    } catch {}

    const sync = () => {
      try {
        const raw = window.localStorage.getItem("wink-last-order");
        setOrder(raw ? (JSON.parse(raw) as LastOrder) : null);
      } catch {}
    };
    window.addEventListener("storage", sync);
    const timer = window.setInterval(sync, 1500);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(timer);
    };
  }, []);

  if (!order?.public_token) return null;
  const prefix = window.location.pathname.startsWith("/ru") ? "/ru" : "";

  return (
    <a
      href={`${prefix}/order/?token=${encodeURIComponent(order.public_token)}`}
      style={{
        position: "fixed",
        right: 18,
        bottom: 76,
        zIndex: 80,
        background: "#171615",
        color: "#fffdf9",
        borderRadius: 999,
        padding: "12px 16px",
        fontSize: 12,
        letterSpacing: ".02em",
        textDecoration: "none",
        boxShadow: "0 12px 32px rgba(23,22,21,.16)",
      }}
    >
      Отследить {order.number ? `#${order.number}` : "заказ"} →
    </a>
  );
}
