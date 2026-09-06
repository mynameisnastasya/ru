"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import WinkPageFrame2026 from "@/components/WinkPageFrame2026";

const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const CART_KEY = "wink-v4-cart";
const DELIVERY_INTENT_KEY = "wink-delivery-intent";
const IDEM_KEY = "wink-v4-idempotency";

type LineConfig = { palette?: string; foilColor?: string; number?: string; inscription?: string; revealResult?: "girl" | "boy"; addons: string[] };
type CartLine = { lineId: string; productId: string; name: string; subtitle: string; qty: number; unitPriceMinor: number; config: LineConfig };
type OrderResult = { number?: string; public_token?: string; status?: string };

function money(minor: number) { return `${new Intl.NumberFormat("ru-RU").format(Math.round(minor / 100))} ₽`; }
function readCart(): CartLine[] { try { return JSON.parse(window.localStorage.getItem(CART_KEY) || "[]") as CartLine[]; } catch { return []; } }
function configLine(config: LineConfig) {
  return [config.palette, config.foilColor ? `foil ${config.foilColor}` : "", config.number ? `цифры ${config.number}` : "", config.inscription ? `«${config.inscription}»` : "", config.addons?.length ? "с бантами" : ""].filter(Boolean).join(" · ");
}

export default function WinkCheckout2026() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [giftForSomeone, setGiftForSomeone] = useState(true);
  const [surprise, setSurprise] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [senderName, setSenderName] = useState("");
  const [cardMessage, setCardMessage] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("Подтвердим время после проверки");
  const [leaveAtDoor, setLeaveAtDoor] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCart(readCart());
      try {
        const intent = JSON.parse(window.localStorage.getItem(DELIVERY_INTENT_KEY) || "null") as { date?: string; address?: string } | null;
        if (intent?.date) setDate(intent.date);
        if (intent?.address) setAddress(intent.address);
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const total = useMemo(() => cart.reduce((sum, line) => sum + line.unitPriceMinor * line.qty, 0), [cart]);

  function updateQty(lineId: string, delta: number) {
    setCart(current => {
      const next = current.flatMap(line => line.lineId !== lineId ? [line] : line.qty + delta > 0 ? [{ ...line, qty: Math.min(20, line.qty + delta) }] : []);
      try { window.localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!cart.length) { setError("Корзина пустая."); return; }
    if (customerName.trim().length < 2 || customerPhone.replace(/\D/g, "").length < 7) { setError("Проверьте имя и телефон покупателя."); return; }
    if (giftForSomeone && (recipientName.trim().length < 2 || recipientPhone.replace(/\D/g, "").length < 7)) { setError("Нужны имя и телефон получателя."); return; }
    if (address.trim().length < 5 || !date) { setError("Добавьте адрес и дату доставки."); return; }
    setSubmitting(true);
    try {
      const payload = {
        customer: { name: customerName.trim(), phone: customerPhone.trim() },
        gift: {
          forSomeone: giftForSomeone,
          recipientName: giftForSomeone ? recipientName.trim() : "",
          recipientPhone: giftForSomeone ? recipientPhone.trim() : "",
          anonymous: giftForSomeone ? anonymous : false,
          senderName: giftForSomeone ? senderName.trim() : "",
          dontCall: giftForSomeone ? surprise : false,
          message: cardMessage.trim(),
        },
        delivery: {
          date,
          slot,
          address: address.trim(),
          courierNote: leaveAtDoor ? "Оставить у двери, если условия заказа и адрес позволяют." : "",
        },
        items: cart.map(line => ({ productId: line.productId, qty: line.qty, config: line.config })),
        source: "wink-site-2026",
        utm: Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].map(key => [key.replace("utm_", ""), new URLSearchParams(window.location.search).get(key)])),
      };
      const fingerprint = JSON.stringify(payload);
      let idempotencyKey = "";
      try {
        const stored = JSON.parse(window.localStorage.getItem(IDEM_KEY) || "null") as { fingerprint?: string; key?: string } | null;
        if (stored?.fingerprint === fingerprint && stored.key) idempotencyKey = stored.key;
      } catch {}
      if (!idempotencyKey) idempotencyKey = window.crypto.randomUUID();
      try { window.localStorage.setItem(IDEM_KEY, JSON.stringify({ fingerprint, key: idempotencyKey })); } catch {}
      const response = await fetch(`${API_URL}/api/orders`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, idempotency_key: idempotencyKey }) });
      const data = await response.json().catch(() => null) as { order?: OrderResult; error?: { message?: string } } | null;
      if (!response.ok || !data?.order) throw new Error(data?.error?.message || "Не удалось создать заказ.");
      setOrder(data.order);
      setCart([]);
      try {
        window.localStorage.setItem("wink-last-order", JSON.stringify(data.order));
        window.localStorage.removeItem(CART_KEY);
        window.localStorage.removeItem(IDEM_KEY);
      } catch {}
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось создать заказ.");
    } finally { setSubmitting(false); }
  }

  if (order) return <WinkPageFrame2026><main className="wc26-success"><span>WINK · заказ {order.number ? `#${order.number}` : "принят"}</span><h1>Всё. Теперь красиво — наша работа.</h1><p>Заказ сохранён. Когда подключим платёжный провайдер, именно здесь будет следующий безопасный шаг оплаты. Пока мы не выдаём заявку за оплаченную.</p><div>{order.public_token && <Link href={`/order/?token=${encodeURIComponent(order.public_token)}`}>Следить за заказом</Link>}<Link href="/">Вернуться на главную</Link></div></main><CheckoutStyles /></WinkPageFrame2026>;

  return <WinkPageFrame2026>
    <main className="wc26">
      <section className="wc26-head"><p>Оформление</p><h1>Почти готово.</h1><span>Минимум полей. Всё, что можно решить без вас, WINK решит сам.</span></section>
      <form className="wc26-layout" onSubmit={submit}>
        <div className="wc26-form">
          <section className="wc26-card"><div className="wc26-num">01</div><div><h2>Кто получает?</h2><div className="wc26-switch"><button type="button" className={giftForSomeone ? "active" : ""} onClick={() => setGiftForSomeone(true)}>Это подарок</button><button type="button" className={!giftForSomeone ? "active" : ""} onClick={() => setGiftForSomeone(false)}>Для меня</button></div>{giftForSomeone && <div className="wc26-fields"><label>Имя получателя<input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Например, Катя" /></label><label>Телефон получателя<input inputMode="tel" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} placeholder="+7 ..." /></label><label className="wc26-check"><input type="checkbox" checked={surprise} onChange={e => setSurprise(e.target.checked)} /><span><b>Это сюрприз</b><small>Не звоним получателю заранее. Все вопросы решаем с вами.</small></span></label><label className="wc26-check"><input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} /><span><b>Анонимно</b><small>Не называем отправителя получателю.</small></span></label>{!anonymous && <label>От кого<input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Как подписать подарок" /></label>}</div>}</div></section>

          <section className="wc26-card"><div className="wc26-num">02</div><div><h2>Куда и когда?</h2><div className="wc26-fields"><label className="wide">Адрес<input value={address} onChange={e => setAddress(e.target.value)} placeholder="Улица, дом, квартира / отель" /></label><label>Дата<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><label>Предпочтительное время<select value={slot} onChange={e => setSlot(e.target.value)}><option>Подтвердим время после проверки</option><option>Утро — запрос</option><option>День — запрос</option><option>Вечер — запрос</option><option>Точное время — запрос</option></select></label><label className="wc26-check wide"><input type="checkbox" checked={leaveAtDoor} onChange={e => setLeaveAtDoor(e.target.checked)} /><span><b>Оставить у двери, если это безопасно</b><small>Менеджер подтвердит, подходит ли такой способ для конкретного заказа.</small></span></label></div><p className="wc26-note">Реальные delivery zones, capacity и тарифы пока не утверждены, поэтому сайт не показывает выдуманные интервалы и стоимость.</p></div></section>

          <section className="wc26-card"><div className="wc26-num">03</div><div><h2>Открытка</h2><label>Что написать?<textarea value={cardMessage} onChange={e => setCardMessage(e.target.value)} placeholder="Несколько слов от вас. Можно оставить пустым." /></label><p className="wc26-note">Открытка входит в сервисный сценарий. Не превращаем её в случайный платный SKU без утверждённого правила.</p></div></section>

          <section className="wc26-card"><div className="wc26-num">04</div><div><h2>Кто заказывает?</h2><div className="wc26-fields"><label>Ваше имя<input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Имя" /></label><label>Ваш телефон<input inputMode="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+7 ..." /></label></div></div></section>

          <section className="wc26-payment"><p>Оплата</p><h2>Онлайн-оплата — следующий подключаемый слой.</h2><span>Платёжный провайдер и его production-ключи ещё не выбраны. Мы не имитируем оплату кнопкой, которая ничего не оплачивает.</span></section>
          {error && <div className="wc26-error">{error}</div>}
          <button className="wc26-submit" type="submit" disabled={submitting || !cart.length}>{submitting ? "Сохраняем заказ…" : "Создать заказ"}</button>
        </div>

        <aside className="wc26-summary"><p>Ваш WINK</p>{cart.length ? <><div className="wc26-lines">{cart.map(line => <article key={line.lineId}><div><b>{line.subtitle}</b><small>{configLine(line.config)}</small><div><button type="button" onClick={() => updateQty(line.lineId, -1)}>−</button><span>{line.qty}</span><button type="button" onClick={() => updateQty(line.lineId, 1)}>+</button></div></div><strong>{money(line.unitPriceMinor * line.qty)}</strong></article>)}</div><div className="wc26-total"><span>Товары</span><b>{money(total)}</b></div><small className="wc26-summaryNote">Доставка отдельно — после реального расчёта зоны и capacity.</small></> : <div className="wc26-empty"><h3>Пока пусто.</h3><p>Покажем то, с чем сложно ошибиться?</p><Link href="/shop">Смотреть хиты</Link></div>}</aside>
      </form>
    </main>
    <CheckoutStyles />
  </WinkPageFrame2026>;
}

function CheckoutStyles() { return <style jsx global>{`
  .wc26{--milk:#F7F3EE;--white:#FFFDFC;--graphite:#242222;--blush:#E5C8CE;--cocoa:#5A403E;--line:rgba(36,34,34,.13);background:var(--milk);color:var(--graphite);min-height:100vh}.wc26-head{max-width:1400px;margin:auto;padding:90px 0 55px}.wc26-head>p,.wc26-summary>p,.wc26-payment>p{font-size:10px;text-transform:uppercase;letter-spacing:.15em}.wc26-head h1{font-size:clamp(48px,6vw,82px);letter-spacing:-.06em;line-height:.9;margin:12px 0 20px}.wc26-head span{color:#746c68;font-size:16px}.wc26-layout{max-width:1400px;margin:auto;padding-bottom:120px;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(330px,.7fr);gap:30px;align-items:start}.wc26-form{display:flex;flex-direction:column;gap:9px}.wc26-card{background:var(--white);border:1px solid var(--line);padding:30px;display:grid;grid-template-columns:48px 1fr;gap:15px}.wc26-num{font-size:10px;color:#8b817b}.wc26-card h2,.wc26-payment h2{font-size:30px;letter-spacing:-.04em;margin:0 0 22px}.wc26-switch{display:flex;gap:7px;margin-bottom:20px}.wc26-switch button{border:1px solid var(--line);background:var(--milk);padding:12px 16px;cursor:pointer}.wc26-switch button.active{background:var(--graphite);color:white}.wc26-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.wc26 label{display:flex;flex-direction:column;gap:7px;font-size:11px}.wc26 label.wide,.wc26-check.wide{grid-column:1/-1}.wc26 input,.wc26 textarea,.wc26 select{width:100%;border:1px solid var(--line);background:var(--milk);padding:13px 14px;min-height:50px;outline:none}.wc26 textarea{min-height:105px;resize:vertical;margin-top:8px}.wc26-check{flex-direction:row!important;align-items:flex-start!important;border:1px solid var(--line);background:var(--milk);padding:13px;cursor:pointer}.wc26-check input{width:auto;min-height:0;margin:3px 4px 0 0}.wc26-check span{display:flex;flex-direction:column;gap:4px}.wc26-check small{color:#786f6a;line-height:1.4}.wc26-note{font-size:10px;color:#786f6a;line-height:1.55;margin:16px 0 0}.wc26-payment{background:var(--cocoa);color:white;padding:32px}.wc26-payment h2{margin-top:12px}.wc26-payment span{color:#e2d4cf;line-height:1.6}.wc26-submit{min-height:58px;border:0;background:var(--graphite);color:white;font-weight:600;cursor:pointer}.wc26-submit:disabled{opacity:.35;cursor:not-allowed}.wc26-error{background:#f4dfe3;color:#7e2738;padding:14px;font-size:12px}.wc26-summary{position:sticky;top:94px;background:var(--white);border:1px solid var(--line);padding:26px}.wc26-lines article{display:flex;justify-content:space-between;gap:15px;padding:17px 0;border-bottom:1px solid var(--line)}.wc26-lines article>div{display:flex;flex-direction:column;gap:5px}.wc26-lines small{font-size:9px;color:#786f6a}.wc26-lines article>div>div{display:flex;gap:8px;align-items:center;margin-top:7px}.wc26-lines button{width:28px;height:28px;border:1px solid var(--line);background:white;cursor:pointer}.wc26-lines strong{font-size:12px;white-space:nowrap}.wc26-total{display:flex;justify-content:space-between;padding:22px 0 9px;font-size:17px}.wc26-summaryNote{display:block;color:#786f6a;font-size:9px;line-height:1.5}.wc26-empty{padding:25px 0}.wc26-empty h3{font-size:26px;margin:0}.wc26-empty p{color:#786f6a}.wc26-empty a{text-decoration:underline}.wc26-success{min-height:72vh;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;max-width:960px;margin:auto;padding:80px 24px}.wc26-success>span{font-size:10px;text-transform:uppercase;letter-spacing:.14em}.wc26-success h1{font-size:clamp(48px,7vw,92px);letter-spacing:-.06em;line-height:.92;margin:18px 0}.wc26-success p{max-width:700px;color:#746c68;font-size:17px;line-height:1.65}.wc26-success>div{display:flex;gap:9px;margin-top:20px}.wc26-success a{background:#242222;color:white;padding:15px 18px}.wc26-success a+ a{background:transparent;color:#242222;border:1px solid rgba(36,34,34,.2)}
  @media(max-width:1450px){.wc26-head,.wc26-layout{margin-left:24px;margin-right:24px}}
  @media(max-width:850px){.wc26-head{margin:0;padding:60px 18px 34px}.wc26-layout{display:flex;flex-direction:column-reverse;margin:0;padding:0 18px 100px}.wc26-summary{position:static;width:100%}.wc26-form{width:100%}.wc26-card{padding:22px 17px;grid-template-columns:34px 1fr}.wc26-card h2,.wc26-payment h2{font-size:25px}.wc26-fields{grid-template-columns:1fr}.wc26 label.wide,.wc26-check.wide{grid-column:auto}.wc26-payment{padding:25px 20px}.wc26-submit{position:sticky;bottom:10px;z-index:40;box-shadow:0 10px 30px rgba(0,0,0,.16)}.wc26-success{padding:55px 18px}.wc26-success>div{flex-direction:column;width:100%}.wc26-success a{text-align:center}}
`}</style>; }
