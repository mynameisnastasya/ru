"use client";

import { useEffect, useState } from "react";
import { createAuthClient } from "@neondatabase/neon-js/auth";
import styles from "./dashboard.module.css";

const AUTH_URL = "https://ep-shy-recipe-ayg4gc7p.neonauth.c-5.us-east-2.aws.neon.tech/wink/auth";
const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const authClient = createAuthClient(AUTH_URL);

type Staff = { id?: string; role: string; name?: string | null; email?: string | null };
type Capacity = { id: string; start_at?: string; end_at?: string; max_orders: number; reserved_orders: number; max_capacity_minutes: number; reserved_capacity_minutes: number; active: boolean };
type Finance = { revenue_today: number; revenue_week: number; revenue_month: number; paid_today: number; unpaid_recent: number; refunds: number; aov_month: number };
type Health = { outbox_pending?: number; outbox_failed?: number; telegram_last_success?: string | null; telegram_last_failure?: string | null; payments_failed?: number; low_stock?: number };
type Dashboard = { staff: Staff; today: Record<string, number>; capacity: Capacity[]; finance?: Finance; health: Health };
type ApiError = { error?: { message?: string } };

function money(minor: number | undefined) {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(Number(minor || 0) / 100))} ₽`;
}
function time(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(date);
  return value.slice(0, 5);
}
function stamp(value: string | null | undefined) {
  if (!value) return "не было";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}
async function bearerToken() {
  const result = await authClient.token();
  const token = result.data?.token;
  if (result.error || !token) throw new Error(result.error?.message || "Не удалось получить staff token.");
  return token;
}
async function api<T>(path: string): Promise<T> {
  const token = await bearerToken();
  const response = await fetch(`${API_URL}${path}`, { headers: { authorization: `Bearer ${token}` } });
  const body = await response.json().catch(() => ({})) as T & ApiError;
  if (!response.ok) throw new Error(body.error?.message || `WINK API ${response.status}`);
  return body;
}

const STATUS_RU: Record<string, string> = {
  AWAITING_PAYMENT: "Ждут оплату", PAID: "Оплачены", NEEDS_CLARIFICATION: "Нужно уточнение", CONFIRMED: "Подтверждены", ASSEMBLY: "В сборке", QUALITY_CHECK: "QC", READY: "Готовы", COURIER_ASSIGNED: "Курьер назначен", OUT_FOR_DELIVERY: "У курьера", DELIVERED: "Доставлены", CANCELED: "Отменены", REFUNDED: "Возвраты",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setBusy(true); setError("");
    try { setData(await api<Dashboard>("/api/admin/dashboard")); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить сводку."); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    let cancelled = false;
    void authClient.getSession().then(async (session) => {
      if (cancelled) return;
      const email = session.data?.user?.email || "";
      setSessionEmail(email);
      if (session.data?.session && email) await loadDashboard();
    }).catch((sessionError: unknown) => {
      if (!cancelled) setError(sessionError instanceof Error ? sessionError.message : "Не удалось проверить staff session.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function signInGoogle() {
    setBusy(true); setError("");
    try {
      const callbackURL = `${window.location.origin}${window.location.pathname}`;
      const result = await authClient.signIn.social({ provider: "google", callbackURL });
      if (result?.error) throw new Error(result.error.message || "Не удалось войти через Google.");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Не удалось войти через Google."); setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true); await authClient.signOut().catch(() => undefined); setData(null); setSessionEmail(""); setError(""); setBusy(false);
  }

  if (loading) return <main className={styles.page}><div className={styles.loading}>WINK operations · собираем сводку…</div></main>;
  if (!sessionEmail) return <main className={styles.page}><div className={styles.login}><section className={styles.loginCard}><div className={styles.eyebrow}>WINK / private operations</div><h1>Сводка</h1><p className={styles.muted}>Вход через Google. Backend отдельно проверит staff-role и выдаст только разрешённый объём данных.</p>{error && <div className={styles.error}>{error}</div>}<button className={styles.button} onClick={() => void signInGoogle()} disabled={busy}>{busy ? "Открываем Google…" : "Войти через Google"}</button></section></div></main>;

  const finance = data?.finance;
  const health = data?.health || {};
  const outboxProblems = Number(health.outbox_failed || 0);
  const paymentProblems = Number(health.payments_failed || 0);
  const lowStock = Number(health.low_stock || 0);

  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.top}><div><div className={styles.eyebrow}>WINK / operations today</div><h1>Сводка</h1><p className={styles.muted}>Один экран для того, что реально требует внимания сегодня: заказы, деньги, capacity и интеграции.</p></div><div className={styles.toolbar}>{data?.staff && <span className={styles.pill}>{data.staff.role}</span>}<button className={styles.button} onClick={() => void loadDashboard()} disabled={busy}>{busy ? "Обновляем…" : "Обновить"}</button><button className={styles.button} onClick={() => void signOut()} disabled={busy}>Выйти</button></div></header>
    {error && <div className={styles.error}>{error}</div>}

    <section className={styles.grid}>
      <div className={styles.card}><span>Выручка сегодня</span><strong>{finance ? money(finance.revenue_today) : "—"}</strong><small>{finance ? `${finance.paid_today} оплаченных заказов` : "Для production финансы скрыты"}</small></div>
      <div className={styles.card}><span>Неделя</span><strong>{finance ? money(finance.revenue_week) : "—"}</strong><small>{finance ? `AOV месяца ${money(finance.aov_month)}` : "Ролевой доступ"}</small></div>
      <div className={styles.card}><span>Ждут оплаты ≤24ч</span><strong>{finance ? finance.unpaid_recent : "—"}</strong><small>{finance ? `refunds: ${finance.refunds}` : "Ролевой доступ"}</small></div>
      <div className={`${styles.card} ${outboxProblems || paymentProblems ? styles.bad : styles.good}`}><span>Интеграции</span><strong>{outboxProblems + paymentProblems}</strong><small>outbox failed {outboxProblems} · payment failed {paymentProblems}</small></div>
    </section>

    <section className={styles.section}><div className={styles.sectionTitle}><h2>Заказы на сегодня</h2><span className={styles.muted}>По текущему статусу</span></div><div className={styles.statusGrid}>{Object.keys(data?.today || {}).length ? Object.entries(data?.today || {}).map(([status, count]) => <div className={styles.status} key={status}><b>{STATUS_RU[status] || status}</b><strong>{count}</strong></div>) : <div className={styles.status}><b>Заказов на сегодня нет</b><strong>0</strong></div>}</div></section>

    <section className={styles.section}><div className={styles.sectionTitle}><h2>Delivery capacity</h2><span className={styles.muted}>Пустая таблица означает: реальные слоты ещё не настроены</span></div><div className={styles.capacity}>{data?.capacity?.length ? <table className={styles.table}><thead><tr><th>Слот</th><th>Заказы</th><th>Минуты производства</th><th>Статус</th></tr></thead><tbody>{data.capacity.map((slot) => <tr key={slot.id}><td>{time(slot.start_at)}–{time(slot.end_at)}</td><td>{slot.reserved_orders} / {slot.max_orders}</td><td>{slot.reserved_capacity_minutes} / {slot.max_capacity_minutes}</td><td><span className={styles.pill}>{slot.active ? "active" : "off"}</span></td></tr>)}</tbody></table> : <div className={styles.loading}>Зоны/слоты ещё не заполнены — сайт поэтому не обещает availability.</div>}</div></section>

    <section className={styles.section}><div className={styles.sectionTitle}><h2>Health</h2><span className={styles.muted}>Интеграции и склад</span></div><div className={styles.grid}>
      <div className={`${styles.card} ${Number(health.outbox_pending || 0) > 0 ? styles.warn : styles.good}`}><span>Outbox pending</span><strong>{Number(health.outbox_pending || 0)}</strong><small>failed: {outboxProblems}</small></div>
      <div className={`${styles.card} ${health.telegram_last_failure && (!health.telegram_last_success || health.telegram_last_failure > health.telegram_last_success) ? styles.bad : styles.good}`}><span>Telegram</span><strong>{health.telegram_last_success ? "OK" : "—"}</strong><small>success {stamp(health.telegram_last_success)} · fail {stamp(health.telegram_last_failure)}</small></div>
      <div className={`${styles.card} ${paymentProblems ? styles.bad : styles.good}`}><span>Payment errors</span><strong>{paymentProblems}</strong><small>Технические ошибки платежного контура</small></div>
      <div className={`${styles.card} ${lowStock ? styles.warn : styles.good}`}><span>Low stock</span><strong>{lowStock}</strong><small>Позиции на/ниже reorder point</small></div>
    </div></section>
  </div></main>;
}
