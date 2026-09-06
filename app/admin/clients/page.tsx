"use client";

import { useEffect, useMemo, useState } from "react";
import { createAuthClient } from "@neondatabase/neon-js/auth";
import styles from "./clients.module.css";

const AUTH_URL = "https://ep-shy-recipe-ayg4gc7p.neonauth.c-5.us-east-2.aws.neon.tech/wink/auth";
const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const authClient = createAuthClient(AUTH_URL);

const CRM_ROLES = new Set(["OWNER", "ADMIN", "MANAGER"]);

type Staff = { id: string; role: string; name?: string | null; email?: string | null };
type OrderSummary = { id: string; number: string; status: string; created_at?: string };
type OrderRecord = Record<string, unknown> & { id: string; number: string; status: string };
type OrderDetail = { staff: Staff; order: OrderRecord };
type ApiError = { error?: { message?: string; code?: string } };

type RecipientView = { name: string; phone: string };
type ClientView = {
  key: string;
  name: string;
  phone: string;
  email: string;
  orderCount: number;
  totalValue: number;
  paidRevenue: number;
  averageValue: number;
  lastAt: string;
  recipients: RecipientView[];
  sources: string[];
};

function clean(value: unknown) {
  return value === null || value === undefined ? "" : String(value).trim();
}
function phoneKey(value: unknown) {
  const digits = clean(value).replace(/\D/g, "");
  if (digits.length === 10) return `7${digits}`;
  if (digits.length === 11 && digits.startsWith("8")) return `7${digits.slice(1)}`;
  return digits;
}
function moneyMinor(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value / 100))} ₽`;
}
function dateLabel(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).format(date);
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

async function loadDetails(ids: string[]) {
  const result: OrderRecord[] = [];
  for (let index = 0; index < ids.length; index += 8) {
    const chunk = ids.slice(index, index + 8);
    const rows = await Promise.all(chunk.map((id) => api<OrderDetail>(`/api/admin/orders/${encodeURIComponent(id)}`)));
    result.push(...rows.map((row) => row.order));
  }
  return result;
}

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");
  const [staff, setStaff] = useState<Staff | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  async function loadCRM() {
    setBusy(true);
    setError("");
    try {
      const me = await api<{ staff: Staff }>("/api/admin/me");
      if (!CRM_ROLES.has(me.staff.role)) throw new Error("Эта роль не имеет доступа к клиентским данным WINK.");
      const list = await api<{ staff: Staff; orders: OrderSummary[] }>("/api/admin/orders");
      const ids = (list.orders || []).slice(0, 100).map((order) => order.id);
      const details = await loadDetails(ids);
      setStaff(me.staff);
      setOrders(details);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить CRM.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    void authClient.getSession().then(async (session) => {
      if (cancelled) return;
      const email = session.data?.user?.email || "";
      setSessionEmail(email);
      if (session.data?.session && email) await loadCRM();
    }).catch((sessionError: unknown) => {
      if (!cancelled) setError(sessionError instanceof Error ? sessionError.message : "Не удалось проверить staff session.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  async function signInGoogle() {
    setBusy(true);
    setError("");
    try {
      const callbackURL = `${window.location.origin}${window.location.pathname}`;
      const result = await authClient.signIn.social({ provider: "google", callbackURL });
      if (result?.error) throw new Error(result.error.message || "Не удалось войти через Google.");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Не удалось войти через Google.");
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    await authClient.signOut().catch(() => undefined);
    setStaff(null);
    setOrders([]);
    setSessionEmail("");
    setError("");
    setBusy(false);
  }

  const clients = useMemo<ClientView[]>(() => {
    type MutableClient = Omit<ClientView, "recipients" | "sources" | "averageValue"> & { recipientMap: Map<string, RecipientView>; sourceSet: Set<string> };
    const map = new Map<string, MutableClient>();

    for (const order of orders) {
      const phone = phoneKey(order.customer_phone);
      const email = clean(order.customer_email).toLowerCase();
      const name = clean(order.customer_name) || "Без имени";
      const key = phone || email || `${name.toLowerCase()}-${order.id}`;
      const createdAt = clean(order.created_at);
      const total = Number(order.total_minor || 0);
      const paid = clean(order.payment_status) === "SUCCEEDED";
      const current = map.get(key) || {
        key,
        name,
        phone: clean(order.customer_phone),
        email,
        orderCount: 0,
        totalValue: 0,
        paidRevenue: 0,
        lastAt: createdAt,
        recipientMap: new Map<string, RecipientView>(),
        sourceSet: new Set<string>(),
      };

      current.orderCount += 1;
      current.totalValue += total;
      if (paid) current.paidRevenue += total;
      if (!current.lastAt || (createdAt && createdAt > current.lastAt)) current.lastAt = createdAt;
      if (!current.name || current.name === "Без имени") current.name = name;
      if (!current.phone) current.phone = clean(order.customer_phone);
      if (!current.email) current.email = email;

      const recipientName = clean(order.recipient_name);
      const recipientPhone = clean(order.recipient_phone);
      if (recipientName) {
        const recipientKey = phoneKey(recipientPhone) || recipientName.toLowerCase();
        current.recipientMap.set(recipientKey, { name: recipientName, phone: recipientPhone });
      }

      const source = clean(order.utm_source) || clean(order.source) || "не указан";
      const medium = clean(order.utm_medium);
      current.sourceSet.add(medium ? `${source} / ${medium}` : source);
      map.set(key, current);
    }

    return [...map.values()].map((client) => ({
      key: client.key,
      name: client.name,
      phone: client.phone,
      email: client.email,
      orderCount: client.orderCount,
      totalValue: client.totalValue,
      paidRevenue: client.paidRevenue,
      averageValue: client.orderCount ? Math.round(client.totalValue / client.orderCount) : 0,
      lastAt: client.lastAt,
      recipients: [...client.recipientMap.values()],
      sources: [...client.sourceSet.values()],
    })).sort((a, b) => b.orderCount - a.orderCount || b.lastAt.localeCompare(a.lastAt));
  }, [orders]);

  const filteredClients = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((client) => [client.name, client.phone, client.email, client.sources.join(" "), client.recipients.map((recipient) => `${recipient.name} ${recipient.phone}`).join(" ")].join(" ").toLowerCase().includes(needle));
  }, [clients, query]);

  const repeatClients = clients.filter((client) => client.orderCount > 1).length;
  const repeatRate = clients.length ? Math.round((repeatClients / clients.length) * 100) : 0;
  const paidRevenue = clients.reduce((sum, client) => sum + client.paidRevenue, 0);

  if (loading) return <main className={styles.page}><div className={styles.loading}>WINK CRM · проверяем staff session…</div></main>;

  if (!sessionEmail) {
    return <main className={styles.page}><div className={styles.login}><section className={styles.loginCard}>
      <div className={styles.eyebrow}>WINK / private CRM</div>
      <h1>Клиенты WINK</h1>
      <p className={styles.muted}>Вход через Google. После входа backend отдельно проверяет staff-role — одной авторизации недостаточно.</p>
      {error && <div className={styles.error}>{error}</div>}
      <button className={styles.button} onClick={() => void signInGoogle()} disabled={busy}>{busy ? "Открываем Google…" : "Войти через Google"}</button>
    </section></div></main>;
  }

  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.top}>
      <div><div className={styles.eyebrow}>WINK / client capital</div><h1>Клиенты</h1><p className={styles.muted}>Агрегация по последним 100 заказам. Телефон используется как основной ключ клиента; никакие данные не публикуются наружу.</p></div>
      <div className={styles.toolbar}>{staff && <span className={styles.pill}>{staff.role}</span>}<button className={styles.button} onClick={() => void loadCRM()} disabled={busy}>{busy ? "Обновляем…" : "Обновить"}</button><button className={styles.button} onClick={() => void signOut()} disabled={busy}>Выйти</button></div>
    </header>

    {error && <div className={styles.error}>{error}</div>}

    <section className={styles.metrics} aria-label="CRM метрики">
      <div className={styles.metric}><span>Клиентов</span><strong>{clients.length}</strong></div>
      <div className={styles.metric}><span>Повторных</span><strong>{repeatClients} · {repeatRate}%</strong></div>
      <div className={styles.metric}><span>Заказов в выборке</span><strong>{orders.length}</strong></div>
      <div className={styles.metric}><span>Оплаченная выручка</span><strong>{moneyMinor(paidRevenue)}</strong></div>
    </section>

    <section className={styles.panel}>
      <div className={styles.panelHead}><div><div className={styles.eyebrow}>Customer directory</div><div className={styles.muted}>Средний чек здесь считается по созданным заказам; оплаченная выручка — только по `SUCCEEDED`.</div></div><input className={styles.search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Имя, телефон, получатель, источник…" aria-label="Поиск клиентов"/></div>
      {filteredClients.length === 0 ? <div className={styles.empty}>{orders.length ? "По запросу ничего не найдено." : "Пока нет заказов, из которых можно собрать клиентскую базу."}</div> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Клиент</th><th>Заказы</th><th>Средний чек</th><th>Оплачено</th><th>Получатели</th><th>Источник</th><th>Последний заказ</th></tr></thead><tbody>{filteredClients.map((client) => <tr key={client.key}>
        <td><div className={styles.name}>{client.name}</div><div className={styles.sub}>{client.phone || "телефон не указан"}{client.email ? ` · ${client.email}` : ""}</div></td>
        <td><span className={styles.pill}>{client.orderCount}{client.orderCount > 1 ? " · repeat" : ""}</span><div className={styles.sub}>создано на {moneyMinor(client.totalValue)}</div></td>
        <td>{moneyMinor(client.averageValue)}</td>
        <td>{moneyMinor(client.paidRevenue)}</td>
        <td><div className={styles.recipients}>{client.recipients.length ? client.recipients.map((recipient) => <div key={`${recipient.name}-${recipient.phone}`}>{recipient.name}<span className={styles.sub}>{recipient.phone}</span></div>) : "—"}</div></td>
        <td><div className={styles.source}>{client.sources.map((source) => <span key={source} className={styles.pill}>{source}</span>)}</div></td>
        <td>{dateLabel(client.lastAt)}</td>
      </tr>)}</tbody></table></div>}
    </section>
  </div></main>;
}
