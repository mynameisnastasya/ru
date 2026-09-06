"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createAuthClient } from "@neondatabase/neon-js/auth";
import styles from "./admin.module.css";

const AUTH_URL = "https://ep-shy-recipe-ayg4gc7p.neonauth.c-5.us-east-2.aws.neon.tech/wink/auth";
const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";

const authClient = createAuthClient(AUTH_URL, {
  fetchOptions: { credentials: "include" },
});

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
type OrderDetail = {
  staff: Staff;
  order: Record<string, unknown> & { id: string; number: string; status: string };
  items: OrderItem[];
  history: HistoryEntry[];
};
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
  const n = Number(value ?? 0);
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(n / 100))} ₽`;
}
function dateLabel(value: unknown) {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}
function timeLabel(value: unknown) {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
}
function statusLabel(status: unknown) {
  const key = String(status || "");
  return STATUS_LABELS[key] || key || "—";
}
function parsedObject<T>(value: T | string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}
function text(value: unknown) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

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
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({})) as T & ApiError;
  if (!response.ok) {
    const error = new Error(body.error?.message || `WINK API ${response.status}`);
    error.name = body.error?.code || "API_ERROR";
    throw error;
  }
  return body;
}

function availableTransitions(role: string, status: string) {
  const base = TRANSITIONS[status] || [];
  if (role === "PRODUCTION") return base.filter((s) => ["ASSEMBLY", "QUALITY_CHECK", "READY"].includes(s));
  if (["OWNER", "ADMIN", "MANAGER"].includes(role)) return base;
  return [];
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    const target = preferredId || selectedId || list.orders?.[0]?.id || null;
    if (target) {
      const next = await api<OrderDetail>(`/api/admin/orders/${encodeURIComponent(target)}`);
      setSelectedId(target);
      setDetail(next);
    } else {
      setSelectedId(null);
      setDetail(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const session = await authClient.getSession();
        if (cancelled) return;
        if (session.data?.session && session.data?.user) {
          setSignedIn(true);
          setEmail(session.data.user.email || "");
          try { await loadWorkspace(); }
          catch (workspaceError) { if (!cancelled) setError(workspaceError instanceof Error ? workspaceError.message : "Нет доступа к WINK staff."); }
        }
      } catch (sessionError) {
        if (!cancelled) setError(sessionError instanceof Error ? sessionError.message : "Не удалось проверить staff session.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // Initial session bootstrap only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) throw new Error(result.error.message || "Не удалось войти.");
      setSignedIn(true);
      await loadWorkspace();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Не удалось войти.");
    } finally { setBusy(false); setLoading(false); }
  }

  async function signOut() {
    setBusy(true);
    await authClient.signOut().catch(() => undefined);
    setStaff(null); setOrders([]); setDetail(null); setSelectedId(null); setSignedIn(false); setPassword(""); setError("");
    setBusy(false);
  }

  async function selectOrder(id: string) {
    setBusy(true); setError("");
    try {
      const next = await api<OrderDetail>(`/api/admin/orders/${encodeURIComponent(id)}`);
      setSelectedId(id); setDetail(next);
    } catch (selectError) { setError(selectError instanceof Error ? selectError.message : "Не удалось открыть заказ."); }
    finally { setBusy(false); }
  }

  async function transition(toStatus: string) {
    if (!detail) return;
    setBusy(true); setError("");
    try {
      await api(`/api/admin/orders/${encodeURIComponent(detail.order.id)}/transition`, {
        method: "POST",
        body: JSON.stringify({ to_status: toStatus, reason: reason.trim() || null }),
      });
      setReason("");
      await loadWorkspace(detail.order.id);
    } catch (transitionError) { setError(transitionError instanceof Error ? transitionError.message : "Не удалось изменить статус."); }
    finally { setBusy(false); }
  }

  const transitions = useMemo(() => detail && staff ? availableTransitions(staff.role, detail.order.status) : [], [detail, staff]);

  if (loading) return <main className={styles.page}><div className={styles.loading}>WINK backoffice · проверяем session…</div></main>;

  if (!signedIn) {
    return <main className={styles.page}><div className={`${styles.shell} ${styles.loginWrap}`}>
      <form className={styles.loginCard} onSubmit={signIn}>
        <div className={styles.eyebrow}>WINK / private backoffice</div>
        <h1>Рабочий кабинет</h1>
        <p className={styles.muted}>Только для сотрудников, привязанных к staff role. Регистрация с этой страницы отключена.</p>
        <div className={styles.field}><label>Email</label><input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
        <div className={styles.field}><label>Пароль</label><input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
        {error && <div className={styles.error}>{error}</div>}
        <div style={{marginTop:18}}><button className={styles.button} type="submit" disabled={busy}>{busy ? "Входим…" : "Войти в WINK"}</button></div>
      </form>
    </div></main>;
  }

  if (!staff) {
    return <main className={styles.page}><div className={`${styles.shell} ${styles.loginWrap}`}>
      <section className={styles.loginCard}>
        <div className={styles.eyebrow}>WINK / staff access</div>
        <h1>Аккаунт есть. Роли нет.</h1>
        <p className={styles.muted}>Вы вошли как <b>{email}</b>, но этот email ещё не привязан к WINK staff. До привязки backend не отдаёт заказы, телефоны, адреса, деньги или BOM.</p>
        {error && <div className={styles.notice}>{error}</div>}
        <div style={{marginTop:18}}><button className={styles.buttonGhost} onClick={signOut} disabled={busy}>Выйти</button></div>
      </section>
    </div></main>;
  }

  const o = detail?.order;
  const address = parsedObject<Record<string, unknown>>(o?.delivery_address_snapshot as Record<string, unknown> | string | undefined, {});

  return <main className={styles.page}>
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div><div className={styles.brand}>WINK</div><div className={styles.eyebrow}>operations backoffice</div></div>
        <div className={styles.toolbar}>
          <span className={styles.pill}>{staff.role}</span>
          <span className={styles.muted} style={{fontSize:12}}>{staff.name || staff.email}</span>
          <button className={styles.buttonGhost} onClick={() => void loadWorkspace(selectedId)} disabled={busy}>Обновить</button>
          <button className={styles.buttonGhost} onClick={signOut} disabled={busy}>Выйти</button>
        </div>
      </header>
      {error && <div className={styles.error} style={{marginBottom:14}}>{error}</div>}
      <div className={styles.grid}>
        <section className={`${styles.panel} ${selectedId ? styles.panelListHidden : ""}`}>
          <div className={styles.panelHead}><h2>Заказы</h2><span className={styles.pill}>{orders.length}</span></div>
          <div className={styles.orders}>
            {orders.length === 0 && <div className={styles.empty}>Заказов для этой роли пока нет.</div>}
            {orders.map((order) => <button key={order.id} className={`${styles.orderRow} ${selectedId === order.id ? styles.orderRowActive : ""}`} onClick={() => void selectOrder(order.id)}>
              <div>
                <div className={styles.orderNo}>{order.number}</div>
                <div className={styles.orderMeta}>{dateLabel(order.delivery_date)}{order.recipient_name ? ` · ${order.recipient_name}` : ""}</div>
                <span className={styles.status}>{statusLabel(order.status)}</span>
              </div>
              <div className={styles.amount}>{order.total_minor !== undefined ? moneyMinor(order.total_minor) : ""}</div>
            </button>)}
          </div>
        </section>

        <section className={`${styles.panel} ${!selectedId ? styles.panelDetailHidden : ""}`}>
          {!detail || !o ? <div className={styles.empty}>Выберите заказ слева.</div> : <div className={styles.detail}>
            <button className={`${styles.buttonGhost} ${styles.mobileBack}`} onClick={() => setSelectedId(null)}>← Заказы</button>
            <div className={styles.detailHero}>
              <div><div className={styles.eyebrow}>Order</div><h1>{text(o.number)}</h1><span className={styles.status}>{statusLabel(o.status)}</span></div>
              {o.total_minor !== undefined && <div style={{fontSize:24}}>{moneyMinor(o.total_minor)}</div>}
            </div>

            <div className={styles.facts}>
              <div className={styles.fact}><span>Доставка</span><strong>{dateLabel(o.delivery_date)}</strong></div>
              <div className={styles.fact}><span>Слот</span><strong>{text(address.slot)}</strong></div>
              <div className={styles.fact}><span>Оплата</span><strong>{text(o.payment_status)}</strong></div>
              <div className={styles.fact}><span>Создан</span><strong>{timeLabel(o.created_at)}</strong></div>
            </div>

            {(staff.role === "OWNER" || staff.role === "ADMIN" || staff.role === "MANAGER") && <section className={styles.section}>
              <div className={styles.sectionTitle}><h3>Клиент и доставка</h3></div>
              <div className={styles.facts}>
                <div className={styles.fact}><span>Покупатель</span><strong>{text(o.customer_name)}</strong></div>
                <div className={styles.fact}><span>Телефон покупателя</span><strong>{text(o.customer_phone)}</strong></div>
                <div className={styles.fact}><span>Получатель</span><strong>{text(o.recipient_name)}</strong></div>
                <div className={styles.fact}><span>Телефон получателя</span><strong>{text(o.recipient_phone)}</strong></div>
              </div>
              <div className={styles.facts}>
                <div className={styles.fact} style={{gridColumn:"span 2"}}><span>Адрес</span><strong>{text(address.raw || address.normalized)}</strong></div>
                <div className={styles.fact}><span>Не звонить</span><strong>{o.dont_call_recipient ? "Да" : "Нет"}</strong></div>
                <div className={styles.fact}><span>Анонимно</span><strong>{o.anonymous_sender ? "Да" : "Нет"}</strong></div>
              </div>
            </section>}

            <section className={styles.section}>
              <div className={styles.sectionTitle}><h3>Состав заказа</h3><span className={styles.muted} style={{fontSize:11}}>{detail.items.length} поз.</span></div>
              {detail.items.map((item) => {
                const cfg = parsedObject<Configuration>(item.configuration_snapshot, {});
                const recipe = parsedObject<RecipeSnapshot>(item.recipe_snapshot, {});
                return <article className={styles.item} key={item.id}>
                  <div className={styles.itemTop}><div><div className={styles.itemName}>{item.name_snapshot} × {item.quantity}</div><div className={styles.itemSub}>{item.subtitle_snapshot}</div></div>{item.line_total_minor !== undefined && staff.role !== "PRODUCTION" && <div>{moneyMinor(item.line_total_minor)}</div>}</div>
                  <div className={styles.chips}>
                    {cfg.productionId && <span className={styles.chip}>{cfg.productionId}</span>}
                    {cfg.palette && <span className={styles.chip}>{cfg.paletteRu || cfg.palette}</span>}
                    {cfg.number && <span className={styles.chip}>Цифры: {cfg.number}</span>}
                    {cfg.inscription && <span className={styles.chip}>«{cfg.inscription}»</span>}
                    {cfg.revealResult && <span className={styles.chip}>Reveal: {cfg.revealResult === "P" ? "girl / pink" : "boy / blue"}</span>}
                    {(cfg.addons || []).map((addon) => <span className={styles.chip} key={addon}>{addon}</span>)}
                  </div>
                  {recipe.components && recipe.components.length > 0 && <>
                    <div className={styles.sectionTitle} style={{marginTop:16}}><h3>BOM · {recipe.estimated_minutes || "—"} мин</h3><span className={styles.muted} style={{fontSize:10}}>{recipe.variant_sku}</span></div>
                    <table className={styles.bom}><thead><tr><th>SKU</th><th>Материал</th><th>Кол-во</th></tr></thead><tbody>{recipe.components.map((component, index) => <tr key={`${component.sku}-${index}`}><td>{component.sku}</td><td>{component.name}</td><td>{text(component.qty)}</td></tr>)}</tbody></table>
                  </>}
                </article>;
              })}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}><h3>Действия</h3></div>
              {transitions.length > 0 ? <>
                <div className={styles.field}><label>Комментарий к изменению статуса</label><textarea className={styles.textarea} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Почему меняем статус — особенно для отмены или возврата в сборку" /></div>
                <div className={styles.actions} style={{marginTop:10}}>{transitions.map((target) => <button key={target} className={target === "CANCELED" ? styles.buttonDanger : styles.button} disabled={busy} onClick={() => void transition(target)}>{statusLabel(target)} →</button>)}</div>
              </> : <div className={styles.muted} style={{fontSize:12}}>Для роли {staff.role} сейчас нет доступных переходов из {statusLabel(o.status)}.</div>}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}><h3>Timeline</h3></div>
              <div className={styles.timeline}>{detail.history.length === 0 ? <div className={styles.muted} style={{fontSize:12}}>История пока пустая.</div> : detail.history.map((entry, index) => <div className={styles.timelineRow} key={`${entry.created_at}-${index}`}><span className={styles.dot}/><div><div className={styles.timelineMain}>{entry.from_status ? `${statusLabel(entry.from_status)} → ` : ""}{statusLabel(entry.to_status)}</div><div className={styles.timelineMeta}>{timeLabel(entry.created_at)} · {entry.actor_type || "SYSTEM"}{entry.reason ? ` · ${entry.reason}` : ""}</div></div></div>)}</div>
            </section>
          </div>}
        </section>
      </div>
    </div>
  </main>;
}
