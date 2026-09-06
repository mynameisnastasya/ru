"use client";

import { useEffect, useMemo, useState } from "react";
import { createAuthClient } from "@neondatabase/neon-js/auth";
import styles from "./admin.module.css";

const AUTH_URL = "https://ep-shy-recipe-ayg4gc7p.neonauth.c-5.us-east-2.aws.neon.tech/wink/auth";
const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const authClient = createAuthClient(AUTH_URL);

type Staff = { id: string; role: string; name?: string | null; email?: string | null };
type OrderSummary = {
  id: string;
  number: string;
  status: string;
  payment_status?: string;
  total_minor?: number | string;
  delivery_date?: string;
  customer_name?: string;
  recipient_name?: string;
  created_at?: string;
};
type RecipeComponent = { sku?: string; name?: string; qty?: number | string; waste_factor?: number | string };
type RecipeSnapshot = { production_id?: string; variant_sku?: string; palette?: string; estimated_minutes?: number | string; components?: RecipeComponent[] };
type Configuration = {
  productionId?: string;
  variantSku?: string;
  palette?: string;
  paletteId?: string | null;
  paletteRu?: string;
  number?: string | null;
  inscription?: string | null;
  revealResult?: string | null;
  addons?: string[];
  addonCodes?: string[];
};
type OrderItem = {
  id: string;
  name_snapshot: string;
  subtitle_snapshot?: string;
  quantity: number | string;
  unit_price_minor?: number | string;
  line_total_minor?: number | string;
  configuration_snapshot?: Configuration | string;
  recipe_snapshot?: RecipeSnapshot | string;
};
type HistoryEntry = {
  from_status?: string | null;
  to_status: string;
  actor_type?: string;
  actor_id?: string | null;
  reason?: string | null;
  created_at?: string;
};
type OrderRecord = Record<string, unknown> & { id: string; number: string; status: string };
type OrderDetail = { staff: Staff; order: OrderRecord; items: OrderItem[]; history: HistoryEntry[] };
type ApiError = { error?: { message?: string; code?: string } };

const STATUS_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: "Ожидает оплату",
  PAID: "Оплачен",
  CONFIRMED: "Подтверждён",
  NEEDS_CLARIFICATION: "Нужно уточнение",
  ASSEMBLY: "В сборке",
  QUALITY_CHECK: "QC",
  READY: "Готов",
  COURIER_ASSIGNED: "Курьер назначен",
  OUT_FOR_DELIVERY: "У курьера",
  DELIVERED: "Доставлен",
  CANCELED: "Отменён",
  REFUNDED: "Возврат завершён",
};

const TRANSITIONS: Record<string, string[]> = {
  AWAITING_PAYMENT: ["CANCELED"],
  PAID: ["CONFIRMED", "NEEDS_CLARIFICATION", "CANCELED"],
  NEEDS_CLARIFICATION: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["ASSEMBLY", "CANCELED"],
  ASSEMBLY: ["QUALITY_CHECK"],
  QUALITY_CHECK: ["ASSEMBLY", "READY"],
  READY: ["OUT_FOR_DELIVERY"],
  COURIER_ASSIGNED: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "READY"],
};

function moneyMinor(value: unknown) {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(Number(value ?? 0) / 100))} ₽`;
}
function dateLabel(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
function timeLabel(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}
function text(value: unknown) { return value === null || value === undefined || value === "" ? "—" : String(value); }
function statusLabel(value: unknown) { const key = String(value || ""); return STATUS_LABELS[key] || key || "—"; }
function parsedObject<T>(value: T | string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}
function field(order: OrderRecord | undefined, key: string) { return order?.[key]; }

async function bearerToken() {
  const result = await authClient.token();
  const token = result.data?.token;
  if (result.error || !token) throw new Error(result.error?.message || "Не удалось получить staff token.");
  return token;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await bearerToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Bearer ${token}`, ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({})) as T & ApiError;
  if (!response.ok) throw new Error(body.error?.message || `WINK API ${response.status}`);
  return body;
}

function availableTransitions(role: string, status: string) {
  const transitions = TRANSITIONS[status] || [];
  if (role === "PRODUCTION") return transitions.filter((next) => ["ASSEMBLY", "QUALITY_CHECK", "READY"].includes(next));
  if (["OWNER", "ADMIN", "MANAGER"].includes(role)) return transitions;
  return [];
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authUserEmail, setAuthUserEmail] = useState("");
  const [staff, setStaff] = useState<Staff | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  async function loadWorkspace(preferredId?: string | null) {
    const me = await api<{ staff: Staff }>("/api/admin/me");
    const list = await api<{ staff: Staff; orders: OrderSummary[] }>("/api/admin/orders");
    setStaff(me.staff);
    setOrders(list.orders || []);
    const target = preferredId || list.orders?.[0]?.id || null;
    if (!target) { setSelectedId(null); setDetail(null); return; }
    const next = await api<OrderDetail>(`/api/admin/orders/${encodeURIComponent(target)}`);
    setSelectedId(target);
    setDetail(next);
  }

  useEffect(() => {
    let cancelled = false;
    void authClient.getSession().then(async (session) => {
      if (cancelled) return;
      const email = session.data?.user?.email || "";
      setAuthUserEmail(email);
      if (!session.data?.session || !email) return;
      try { await loadWorkspace(); }
      catch (workspaceError) { if (!cancelled) setError(workspaceError instanceof Error ? workspaceError.message : "Нет доступа к WINK staff."); }
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
      setError(loginError instanceof Error ? loginError.message : "Не удалось войти через Google.");
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    await authClient.signOut().catch(() => undefined);
    setStaff(null); setOrders([]); setDetail(null); setSelectedId(null); setAuthUserEmail(""); setError("");
    setBusy(false);
  }

  async function selectOrder(id: string) {
    setBusy(true); setError("");
    try { setSelectedId(id); setDetail(await api<OrderDetail>(`/api/admin/orders/${encodeURIComponent(id)}`)); }
    catch (selectError) { setError(selectError instanceof Error ? selectError.message : "Не удалось открыть заказ."); }
    finally { setBusy(false); }
  }

  async function refresh() {
    setBusy(true); setError("");
    try { await loadWorkspace(selectedId); }
    catch (refreshError) { setError(refreshError instanceof Error ? refreshError.message : "Не удалось обновить кабинет."); }
    finally { setBusy(false); }
  }

  async function transition(toStatus: string) {
    if (!detail) return;
    setBusy(true); setError("");
    try {
      await api(`/api/admin/orders/${encodeURIComponent(detail.order.id)}/transition`, { method: "POST", body: JSON.stringify({ to_status: toStatus, reason: reason.trim() || null }) });
      setReason("");
      await loadWorkspace(detail.order.id);
    } catch (transitionError) { setError(transitionError instanceof Error ? transitionError.message : "Не удалось изменить статус."); }
    finally { setBusy(false); }
  }

  const transitions = useMemo(() => detail && staff ? availableTransitions(staff.role, detail.order.status) : [], [detail, staff]);
  const order = detail?.order;
  const address = parsedObject<Record<string, unknown>>(field(order, "delivery_address_snapshot") as Record<string, unknown> | string | undefined, {});

  if (loading) return <main className={styles.page}><div className={styles.loading}>WINK backoffice · проверяем доступ…</div></main>;

  if (!authUserEmail) return <main className={styles.page}><div className={`${styles.shell} ${styles.loginWrap}`}><section className={styles.loginCard}>
    <div className={styles.eyebrow}>WINK / private backoffice</div>
    <h1>Рабочий кабинет</h1>
    <p className={styles.muted}>Вход через Google. После входа backend отдельно проверит, есть ли у аккаунта staff-role WINK. Сам факт Google-авторизации не открывает заказы.</p>
    {error && <div className={styles.error}>{error}</div>}
    <div style={{ marginTop: 18 }}><button className={styles.button} onClick={() => void signInGoogle()} disabled={busy}>{busy ? "Переходим…" : "Войти через Google"}</button></div>
  </section></div></main>;

  if (!staff) return <main className={styles.page}><div className={`${styles.shell} ${styles.loginWrap}`}><section className={styles.loginCard}>
    <div className={styles.eyebrow}>WINK / staff access</div>
    <h1>Аккаунт есть. Роли нет.</h1>
    <p className={styles.muted}>Вы вошли как <b>{authUserEmail}</b>, но email ещё не назначен сотрудником WINK. Заказы, телефоны, адреса, деньги и BOM остаются закрыты.</p>
    {error && <div className={styles.notice}>{error}</div>}
    <div style={{ marginTop: 18 }}><button className={styles.buttonGhost} onClick={() => void signOut()} disabled={busy}>Выйти</button></div>
  </section></div></main>;

  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.topbar}>
      <div><div className={styles.brand}>WINK</div><div className={styles.eyebrow}>operations backoffice</div></div>
      <div className={styles.toolbar}><span className={styles.pill}>{staff.role}</span><span className={styles.muted} style={{ fontSize: 12 }}>{staff.name || staff.email}</span><button className={styles.buttonGhost} onClick={() => void refresh()} disabled={busy}>Обновить</button><button className={styles.buttonGhost} onClick={() => void signOut()} disabled={busy}>Выйти</button></div>
    </header>
    {error && <div className={styles.error} style={{ marginBottom: 14 }}>{error}</div>}
    <div className={styles.grid}>
      <section className={`${styles.panel} ${selectedId ? styles.panelListHidden : ""}`}>
        <div className={styles.panelHead}><h2>Заказы</h2><span className={styles.pill}>{orders.length}</span></div>
        <div className={styles.orders}>{orders.length === 0 && <div className={styles.empty}>Заказов для этой роли пока нет.</div>}{orders.map((item) => <button key={item.id} className={`${styles.orderRow} ${selectedId === item.id ? styles.orderRowActive : ""}`} onClick={() => void selectOrder(item.id)}><div><div className={styles.orderNo}>{item.number}</div><div className={styles.orderMeta}>{dateLabel(item.delivery_date)}{item.recipient_name ? ` · ${item.recipient_name}` : ""}</div><span className={styles.status}>{statusLabel(item.status)}</span></div><div className={styles.amount}>{item.total_minor !== undefined ? moneyMinor(item.total_minor) : ""}</div></button>)}</div>
      </section>

      <section className={`${styles.panel} ${!selectedId ? styles.panelDetailHidden : ""}`}>
        {!detail || !order ? <div className={styles.empty}>Выберите заказ слева.</div> : <div className={styles.detail}>
          <button className={`${styles.buttonGhost} ${styles.mobileBack}`} onClick={() => setSelectedId(null)}>← Заказы</button>
          <div className={styles.detailHero}><div><div className={styles.eyebrow}>Order</div><h1>{text(order.number)}</h1><span className={styles.status}>{statusLabel(order.status)}</span></div>{field(order, "total_minor") !== undefined && <div style={{ fontSize: 24 }}>{moneyMinor(field(order, "total_minor"))}</div>}</div>
          <div className={styles.facts}>
            <div className={styles.fact}><span>Доставка</span><strong>{dateLabel(field(order, "delivery_date"))} · {text(address.slot)}</strong></div>
            <div className={styles.fact}><span>Получатель</span><strong>{text(field(order, "recipient_name"))}</strong></div>
            <div className={styles.fact}><span>Не звонить</span><strong>{field(order, "dont_call_recipient") ? "Да" : "Нет"}</strong></div>
            <div className={styles.fact}><span>Оплата</span><strong>{statusLabel(field(order, "payment_status"))}</strong></div>
          </div>

          {staff.role !== "PRODUCTION" && <section className={styles.section}><div className={styles.sectionTitle}><h3>Клиент и доставка</h3></div><div className={styles.facts}>
            <div className={styles.fact}><span>Покупатель</span><strong>{text(field(order, "customer_name"))}<br />{text(field(order, "customer_phone"))}</strong></div>
            <div className={styles.fact}><span>Получатель</span><strong>{text(field(order, "recipient_name"))}<br />{text(field(order, "recipient_phone"))}</strong></div>
            <div className={styles.fact}><span>Адрес</span><strong>{text(address.raw || address.address || address.normalized)}</strong></div>
            <div className={styles.fact}><span>Отправитель</span><strong>{field(order, "anonymous_sender") ? "Анонимно" : text(field(order, "sender_name"))}</strong></div>
          </div>{field(order, "card_message") ? <div className={styles.notice}>Открытка: {text(field(order, "card_message"))}</div> : null}</section>}

          <section className={styles.section}><div className={styles.sectionTitle}><h3>Состав и производство</h3><span className={styles.pill}>{detail.items.length} поз.</span></div>
            {detail.items.map((item) => {
              const config = parsedObject<Configuration>(item.configuration_snapshot, {});
              const recipe = parsedObject<RecipeSnapshot>(item.recipe_snapshot, {});
              return <article key={item.id} className={styles.item}><div className={styles.itemTop}><div><div className={styles.itemName}>{item.name_snapshot} × {item.quantity}</div><div className={styles.itemSub}>{item.subtitle_snapshot || ""}</div></div>{item.line_total_minor !== undefined && staff.role !== "PRODUCTION" ? <strong>{moneyMinor(item.line_total_minor)}</strong> : null}</div>
                <div className={styles.chips}>{[config.productionId || recipe.production_id, config.variantSku || recipe.variant_sku, config.paletteRu || config.palette || recipe.palette, config.number ? `Цифры ${config.number}` : "", config.inscription ? `Текст: ${config.inscription}` : "", config.revealResult ? `Reveal: ${config.revealResult}` : ""].filter(Boolean).map((chip) => <span key={String(chip)} className={styles.chip}>{String(chip)}</span>)}</div>
                {recipe.components?.length ? <table className={styles.bom}><thead><tr><th>SKU</th><th>Материал</th><th>Кол-во</th></tr></thead><tbody>{recipe.components.map((component, index) => <tr key={`${component.sku || component.name}-${index}`}><td>{text(component.sku)}</td><td>{text(component.name)}</td><td>{text(component.qty)}</td></tr>)}</tbody></table> : <div className={styles.notice}>Recipe snapshot отсутствует — заказ требует проверки.</div>}
              </article>;
            })}
          </section>

          <section className={styles.section}><div className={styles.sectionTitle}><h3>Следующее действие</h3></div>{transitions.length ? <><textarea className={styles.textarea} placeholder="Причина / комментарий к переходу (если нужен)" value={reason} onChange={(event) => setReason(event.target.value)} /><div className={styles.actions} style={{ marginTop: 10 }}>{transitions.map((next) => <button key={next} className={next === "CANCELED" ? styles.buttonDanger : styles.button} onClick={() => void transition(next)} disabled={busy}>{statusLabel(next)}</button>)}</div></> : <div className={styles.notice}>Для роли {staff.role} из текущего статуса нет разрешённых переходов.</div>}</section>

          <section className={styles.section}><div className={styles.sectionTitle}><h3>Timeline</h3></div><div className={styles.timeline}>{detail.history.length === 0 && <div className={styles.muted}>История пока пустая.</div>}{detail.history.map((entry, index) => <div className={styles.timelineRow} key={`${entry.to_status}-${entry.created_at || index}`}><span className={styles.dot} /><div><div className={styles.timelineMain}>{entry.from_status ? `${statusLabel(entry.from_status)} → ` : ""}{statusLabel(entry.to_status)}</div><div className={styles.timelineMeta}>{timeLabel(entry.created_at)} · {text(entry.actor_type)}{entry.reason ? ` · ${entry.reason}` : ""}</div></div></div>)}</div></section>
        </div>}
      </section>
    </div>
  </div></main>;
}
