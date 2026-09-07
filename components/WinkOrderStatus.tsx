"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import WinkPageFrame2026 from "./WinkPageFrame2026";
import { API_URL, CONTACT_URL, PALETTES } from "@/lib/wink-shop";
type PublicOrder = {
  number: string;
  status: string;
  delivery_date: string;
  delivery_slot?: string | null;
  items: {
    name: string;
    subtitle?: string | null;
    quantity: number;
    configuration?: {
      palette?: string;
      number?: string | null;
      addons?: string[];
    };
  }[];
};
const labels: Record<string, string> = {
  AWAITING_PAYMENT: "Ожидает оплаты",
  PAID: "Оплачен",
  NEEDS_CLARIFICATION: "Уточняем детали",
  CONFIRMED: "Подтверждён",
  ASSEMBLY: "Собираем",
  QUALITY_CHECK: "Проверяем",
  READY: "Готовим к отправке",
  COURIER_ASSIGNED: "Передаём курьеру",
  OUT_FOR_DELIVERY: "Уже едет",
  DELIVERED: "Доставлен",
  CANCELED: "Отменён",
  REFUNDED: "Возврат завершён",
};
export default function WinkOrderStatus() {
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let token = new URLSearchParams(window.location.search).get("token") || "";
    if (!token) {
      try {
        const last = JSON.parse(
          window.localStorage.getItem("wink-last-order") || "null",
        );
        if (typeof last?.public_token === "string") token = last.public_token;
      } catch {}
    }
    let active = true;
    const controller = new AbortController();
    const load = async () => {
      if (!token) {
        setError("Откройте ссылку, полученную после оформления заявки.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${API_URL}/api/orders/public/${encodeURIComponent(token)}`,
          {
            cache: "no-store",
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(10000),
            ]),
          },
        );
        const data = await response.json().catch(() => null);
        const next = data?.order;
        if (
          !response.ok ||
          !next ||
          typeof next.number !== "string" ||
          typeof next.status !== "string" ||
          typeof next.delivery_date !== "string" ||
          !Array.isArray(next.items) ||
          !next.items.every(
            (item: PublicOrder["items"][number]) =>
              item &&
              typeof item.name === "string" &&
              Number.isInteger(item.quantity),
          )
        )
          throw new Error(
            "Не удалось обновить статус. Попробуйте позже или напишите нам номер заявки.",
          );
        if (active) {
          setOrder(next);
          setError("");
        }
      } catch {
        if (active)
          setError(
            "Не удалось обновить статус. Попробуйте позже или напишите нам номер заявки.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const timer = token ? window.setInterval(load, 30000) : undefined;
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);
  return (
    <WinkPageFrame2026>
      <main className="wk-section wk-order-status">
        <p className="wk-eyebrow">Статус вашего WINK</p>
        {loading ? (
          <h1>Смотрим, где подарок…</h1>
        ) : (
          <>
            <h1>
              {order
                ? labels[order.status] || "Уточняем детали"
                : "Найдём вашу заявку."}
            </h1>
            {error && (
              <p className="wk-error" role="alert">
                {error}
              </p>
            )}
            {order && (
              <>
                <p>
                  Заявка № {order.number} · Желаемая дата:{" "}
                  {order.delivery_date.split("-").reverse().join(".")}
                  {order.delivery_slot ? " · " + order.delivery_slot : ""}
                </p>
                <div className="wk-status-items">
                  {order.items.map((item, i) => {
                    const config = item.configuration || {};
                    return (
                      <article key={i}>
                        <h2>
                          {item.quantity} × {item.subtitle || item.name}
                        </h2>
                        <p>
                          {[
                            PALETTES[config.palette || ""]?.name,
                            config.number ? "Цифры: " + config.number : "",
                            Array.isArray(config.addons) && config.addons.length
                              ? "С бантами"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </article>
                    );
                  })}
                </div>
                <p className="wk-status-note">
                  Статус обновляется автоматически. Детали и подтверждённое
                  время доставки можно уточнить у нас.
                </p>
              </>
            )}
            <div className="wk-actions">
              <a className="wk-button" href={CONTACT_URL}>
                Написать WINK
              </a>
              <Link className="wk-text-link" href="/shop">
                Все композиции →
              </Link>
            </div>
          </>
        )}
      </main>
    </WinkPageFrame2026>
  );
}
