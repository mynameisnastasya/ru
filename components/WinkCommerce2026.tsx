"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const CART_KEY = "wink-v4-cart";
const IDEM_KEY = "wink-v4-idempotency";
const DELIVERY_INTENT_KEY = "wink-delivery-intent";

type LineConfig = { palette?: string; foilColor?: string; number?: string; inscription?: string; revealResult?: "girl" | "boy"; addons: string[] };
type CartLine = { lineId: string; productId: string; name: string; subtitle: string; qty: number; unitPriceMinor: number; config: LineConfig };
type OrderResult = { number: string; public_token: string; total?: string; total_minor?: number; status?: string };
type DeliveryIntent = { mode?: string; date?: string; address?: string };

const PALETTES: Record<string, string> = { MILK:"Молочный",PINK_MILK:"Розовый + milk",PINK_CHROME:"Розовый + chrome",BLACK_GOLD:"Чёрный + gold",NUDE_GOLD:"Айвори + gold",BLACK_CHROME:"Чёрный + chrome",FROST:"Голубой + chrome",CHERRY_MILK:"Вишня + blush" };
const FOIL: Record<string, string> = { S:"Silver",G:"Gold",R:"Red" };

function money(minor: number) { return `${new Intl.NumberFormat("ru-RU").format(Math.round(minor / 100))} ₽`; }
function localDate(offset = 0) { const d = new Date(); d.setDate(d.getDate() + offset); const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 10); }
function readCart(): CartLine[] { try { return JSON.parse(window.localStorage.getItem(CART_KEY) || "[]") as CartLine[]; } catch { return []; } }
function readIntent(): DeliveryIntent { try { return JSON.parse(window.localStorage.getItem(DELIVERY_INTENT_KEY) || "{}") as DeliveryIntent; } catch { return {}; } }
function configText(line: CartLine) { return [line.config.palette ? PALETTES[line.config.palette] || line.config.palette : "",line.config.foilColor ? FOIL[line.config.foilColor] || line.config.foilColor : "",line.config.number ? `цифры ${line.config.number}` : "",line.config.inscription ? `«${line.config.inscription.replace(/\n/g," / ")}»` : "",line.config.revealResult ? (line.config.revealResult === "girl" ? "girl · розовое конфетти" : "boy · голубое конфетти") : "",line.config.addons?.length ? "банты" : ""].filter(Boolean).join(" · "); }

export function openWinkCart() { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("wink:open-cart")); }

export default function WinkCommerce2026() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [step, setStep] = useState(0);
  const [giftForSomeone, setGiftForSomeone] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [surprise, setSurprise] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"today"|"tomorrow"|"date">("tomorrow");
  const [deliveryDate, setDeliveryDate] = useState(localDate(1));
  const [slot, setSlot] = useState("12:00–15:00");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);

  function syncCart() { setCart(readCart()); }
  function show() { syncCart(); setOpen(true); }

  useEffect(() => {
    const onOpen = () => show();
    const onStorage = (event: StorageEvent) => { if (event.key === CART_KEY) syncCart(); };
    window.addEventListener("wink:open-cart", onOpen);
    window.addEventListener("storage", onStorage);
    const timer = window.setTimeout(() => {
      const intent = readIntent();
      if (intent.date) { setDeliveryDate(intent.date); setDeliveryMode("date"); }
      if (intent.address) setAddress(intent.address);
      const params = new URLSearchParams(window.location.search);
      if (params.get("bag") === "1") {
        show();
        params.delete("bag");
        const query = params.toString();
        window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
      }
    }, 0);
    return () => { window.clearTimeout(timer); window.removeEventListener("wink:open-cart", onOpen); window.removeEventListener("storage", onStorage); };
  }, []);

  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.qty, 0), [cart]);
  const provisional = useMemo(() => cart.reduce((sum, line) => sum + line.unitPriceMinor * line.qty, 0), [cart]);
  const recipientValid = !giftForSomeone || (recipientName.trim().length >= 2 && recipientPhone.replace(/\D/g, "").length >= 7);
  const deliveryValid = address.trim().length >= 5 && Boolean(deliveryDate) && Boolean(slot);
  const buyerValid = customerName.trim().length >= 2 && customerPhone.replace(/\D/g, "").length >= 7;

  function updateQty(lineId: string, delta: number) {
    setCart(current => {
      const next = current.map(line => line.lineId === lineId ? { ...line, qty: Math.max(0, line.qty + delta) } : line).filter(line => line.qty > 0);
      try { window.localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function setDelivery(mode: "today"|"tomorrow"|"date") {
    setDeliveryMode(mode);
    if (mode === "today") setDeliveryDate(localDate(0));
    if (mode === "tomorrow") setDeliveryDate(localDate(1));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!recipientValid || !deliveryValid || !buyerValid || !cart.length) { setError("Проверьте обязательные поля."); return; }
    const payload = {
      customer: { name: customerName.trim(), phone: customerPhone.trim() },
      gift: { forSomeone: giftForSomeone, recipientName: giftForSomeone ? recipientName.trim() : "", recipientPhone: giftForSomeone ? recipientPhone.trim() : "", anonymous: giftForSomeone ? anonymous : false, senderName: giftForSomeone ? senderName.trim() : "", dontCall: giftForSomeone ? surprise : false, message: giftForSomeone ? message.trim() : "" },
      delivery: { date: deliveryDate, slot, address: address.trim() },
      items: cart.map(line => ({ productId: line.productId, qty: line.qty, config: line.config })),
      source: "wink-2026-github-pages",
    };
    const fingerprint = JSON.stringify(payload);
    let idem = "";
    try { const stored = JSON.parse(window.localStorage.getItem(IDEM_KEY) || "null") as {fingerprint?:string;key?:string}|null; if (stored?.fingerprint === fingerprint && stored.key) idem = stored.key; } catch {}
    if (!idem) idem = window.crypto.randomUUID();
    try { window.localStorage.setItem(IDEM_KEY, JSON.stringify({ fingerprint, key: idem })); } catch {}
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/orders`, { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({...payload,idempotency_key:idem}) });
      const data = await response.json().catch(() => null) as { order?:OrderResult; error?:{message?:string} } | null;
      if (!response.ok || !data?.order) throw new Error(data?.error?.message || "Не удалось создать заказ.");
      setResult(data.order); setCart([]); setStep(0);
      try { window.localStorage.setItem("wink-last-order", JSON.stringify(data.order)); window.localStorage.setItem(CART_KEY,"[]"); window.localStorage.removeItem(IDEM_KEY); } catch {}
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Не удалось создать заказ."); }
    finally { setSubmitting(false); }
  }

  if (!open) return null;
  return <div className="wc26-layer" role="dialog" aria-modal="true" aria-label="Корзина WINK">
    <button className="wc26-backdrop" onClick={() => setOpen(false)} aria-label="Закрыть корзину" />
    <aside className="wc26-drawer">
      <header><div><small>WINK</small><h2>{result ? "Заказ принят" : cartCount ? `Ваш подарок · ${cartCount}` : "Пока пусто"}</h2></div><button onClick={() => setOpen(false)} aria-label="Закрыть">×</button></header>
      {result ? <Success result={result} close={() => { setResult(null); setOpen(false); }} /> : cart.length === 0 ? <div className="wc26-empty"><h3>Пока пусто.</h3><p>Покажем то, с чем сложно ошибиться?</p><Link href="/shop" onClick={() => setOpen(false)}>Смотреть хиты</Link></div> : <>
        <nav className="wc26-steps">{["Подарок","Получатель","Доставка","Проверка"].map((label,index)=><button key={label} className={step===index?"active":""} onClick={()=>{if(index===0||index===1||(index===2&&recipientValid)||(index===3&&recipientValid&&deliveryValid))setStep(index)}}><i>{index+1}</i><span>{label}</span></button>)}</nav>
        {step===0&&<div className="wc26-panel"><div className="wc26-lines">{cart.map(line=><article key={line.lineId}><div><b>{line.subtitle}</b><small>{configText(line)}</small><div><button onClick={()=>updateQty(line.lineId,-1)}>−</button><span>{line.qty}</span><button onClick={()=>updateQty(line.lineId,1)}>+</button></div></div><strong>{money(line.unitPriceMinor*line.qty)}</strong></article>)}</div><div className="wc26-total"><span>Товары</span><strong>{money(provisional)}</strong></div><p className="wc26-note">Доставка отдельно. Финальную сумму и состав ещё раз проверит backend.</p><button className="wc26-next" onClick={()=>setStep(1)}>Оформить →</button><Link className="wc26-more" href="/shop" onClick={()=>setOpen(false)}>Добавить что-нибудь ещё</Link></div>}
        {step===1&&<div className="wc26-panel wc26-form"><div className="wc26-question"><b>Кто получает?</b><div className="wc26-segments"><button className={giftForSomeone?"active":""} onClick={()=>setGiftForSomeone(true)}>Другой человек</button><button className={!giftForSomeone?"active":""} onClick={()=>setGiftForSomeone(false)}>Я</button></div></div>{giftForSomeone&&<><div className="wc26-two"><label>Имя получателя<input value={recipientName} onChange={e=>setRecipientName(e.target.value)} placeholder="Катя" /></label><label>Телефон получателя<input value={recipientPhone} onChange={e=>setRecipientPhone(e.target.value)} inputMode="tel" placeholder="+7 ..." /></label></div><label className="wc26-check"><input type="checkbox" checked={surprise} onChange={e=>setSurprise(e.target.checked)} /><span><b>Это сюрприз</b><small>Не звоним получателю заранее. Все вопросы решаем с вами.</small></span></label><label className="wc26-check"><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)} /><span><b>Анонимно</b><small>Не указываем имя отправителя.</small></span></label>{!anonymous&&<label>От кого<input value={senderName} onChange={e=>setSenderName(e.target.value)} placeholder="Ваше имя" /></label>}<label>Текст к подарку<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} placeholder="Что хотим сказать?" /></label></>}<button className="wc26-next" disabled={!recipientValid} onClick={()=>setStep(2)}>К доставке →</button></div>}
        {step===2&&<div className="wc26-panel wc26-form"><div className="wc26-question"><b>Когда?</b><div className="wc26-segments"><button className={deliveryMode==="today"?"active":""} onClick={()=>setDelivery("today")}>Сегодня — запрос</button><button className={deliveryMode==="tomorrow"?"active":""} onClick={()=>setDelivery("tomorrow")}>Завтра</button><button className={deliveryMode==="date"?"active":""} onClick={()=>setDelivery("date")}>Дата</button></div></div>{deliveryMode==="date"&&<label>Дата<input type="date" min={localDate(0)} value={deliveryDate} onChange={e=>setDeliveryDate(e.target.value)} /></label>}<label>Предпочтительное время<select value={slot} onChange={e=>setSlot(e.target.value)}><option>09:00–12:00</option><option>12:00–15:00</option><option>15:00–18:00</option><option>18:00–21:00</option><option>Точное время — запрос</option></select></label><label>Куда доставить?<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Улица, дом, квартира / отель" /></label><p className="wc26-note">Пока в production не настроены delivery zones/capacity, это пожелание по времени, а не фальшивая гарантия свободного слота.</p><button className="wc26-next" disabled={!deliveryValid} onClick={()=>setStep(3)}>Проверить заказ →</button></div>}
        {step===3&&<form className="wc26-panel wc26-form" onSubmit={submit}><div className="wc26-summary"><Summary label="Получатель" value={giftForSomeone?`${recipientName} · ${recipientPhone}`:"Вы"}/><Summary label="Доставка" value={`${deliveryDate} · ${slot}`}/><Summary label="Адрес" value={address}/>{giftForSomeone&&surprise&&<Summary label="Сюрприз" value="Не звоним получателю заранее"/>}</div><h3>Кто заказывает?</h3><div className="wc26-two"><label>Ваше имя<input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Имя" /></label><label>Ваш телефон<input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} inputMode="tel" placeholder="+7 ..." /></label></div><div className="wc26-total final"><span>Товары</span><strong>{money(provisional)}</strong></div><p className="wc26-note">Это ещё не списание денег. Backend повторно проверит цену и создаст заказ со статусом ожидания оплаты. Эквайринг подключается отдельным этапом.</p>{error&&<div className="wc26-error">{error}</div>}<button className="wc26-next" type="submit" disabled={!buyerValid||submitting}>{submitting?"Создаём заказ…":"Подтвердить заказ"}</button></form>}
      </>}
    </aside>
    <style jsx global>{`
      .wc26-layer{--milk:#F7F3EE;--white:#FFFDFC;--graphite:#242222;--blush:#E5C8CE;--cocoa:#5A403E;--line:rgba(36,34,34,.13);position:fixed;z-index:200;inset:0;font-family:Inter,Arial,sans-serif;color:var(--graphite)}.wc26-backdrop{position:absolute;inset:0;border:0;background:rgba(25,21,20,.45);backdrop-filter:blur(3px)}.wc26-drawer{position:absolute;right:0;top:0;bottom:0;width:min(620px,100%);background:var(--milk);overflow:auto;box-shadow:-20px 0 60px rgba(25,21,20,.12)}.wc26-drawer>header{position:sticky;top:0;z-index:3;height:82px;background:rgba(247,243,238,.96);backdrop-filter:blur(16px);border-bottom:1px solid var(--line);padding:16px 20px;display:flex;align-items:center;justify-content:space-between}.wc26-drawer>header small{font-size:9px;letter-spacing:.14em}.wc26-drawer>header h2{font-size:24px;margin:3px 0 0;letter-spacing:-.03em}.wc26-drawer>header>button{border:0;background:transparent;font-size:28px;cursor:pointer}.wc26-steps{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--line);background:var(--white)}.wc26-steps button{min-height:60px;border:0;border-right:1px solid var(--line);background:transparent;color:#8a817c;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}.wc26-steps button.active{color:var(--graphite);background:var(--blush)}.wc26-steps i{font-style:normal;font-size:9px}.wc26-steps span{font-size:10px}.wc26-panel{padding:24px 20px 36px}.wc26-lines{display:grid;gap:8px}.wc26-lines article{background:var(--white);border:1px solid var(--line);padding:14px;display:flex;justify-content:space-between;gap:16px}.wc26-lines article b{display:block;font-size:14px}.wc26-lines article small{display:block;color:#7c736e;font-size:10px;line-height:1.5;margin-top:4px;max-width:350px}.wc26-lines article>div>div{display:flex;align-items:center;gap:10px;margin-top:11px}.wc26-lines article>div>div button{width:28px;height:28px;border:1px solid var(--line);background:var(--milk);cursor:pointer}.wc26-lines article strong{font-size:13px;white-space:nowrap}.wc26-total{display:flex;justify-content:space-between;border-top:1px solid var(--graphite);padding-top:16px;margin-top:22px;font-size:16px}.wc26-total.final{font-size:18px;margin-top:22px}.wc26-note{font-size:10px;line-height:1.55;color:#786f6a}.wc26-next{width:100%;min-height:54px;border:0;border-radius:13px;background:var(--graphite);color:white;font-weight:600;cursor:pointer;margin-top:14px}.wc26-next:disabled{opacity:.35;cursor:not-allowed}.wc26-more{display:block;text-align:center;margin-top:15px;color:#746c68;font-size:11px;text-decoration:underline}.wc26-form label{display:flex;flex-direction:column;gap:6px;font-size:11px;margin-bottom:13px}.wc26-form input,.wc26-form textarea,.wc26-form select{width:100%;border:1px solid var(--line);background:var(--white);min-height:50px;padding:12px;font:inherit;outline:none}.wc26-form textarea{min-height:86px;resize:vertical}.wc26-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}.wc26-question{margin-bottom:18px}.wc26-question>b{display:block;font-size:18px;margin-bottom:10px}.wc26-segments{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.wc26-segments button{min-height:45px;border:1px solid var(--line);background:var(--white);font-size:10px;cursor:pointer}.wc26-segments button.active{background:var(--graphite);color:white}.wc26-check{display:grid!important;grid-template-columns:20px 1fr;align-items:start;background:var(--white);border:1px solid var(--line);padding:12px}.wc26-check input{width:18px!important;height:18px!important;min-height:0!important;margin:1px 0 0}.wc26-check b{font-size:12px}.wc26-check small{display:block;color:#786f6a;font-size:9px;line-height:1.45;margin-top:3px}.wc26-summary{display:grid;gap:5px;margin-bottom:25px}.wc26-summary>div{background:var(--white);padding:11px;display:grid;grid-template-columns:100px 1fr;gap:10px}.wc26-summary small{font-size:9px;text-transform:uppercase;color:#817873}.wc26-summary span{font-size:11px;line-height:1.45}.wc26-panel h3{font-size:19px;margin:20px 0 12px}.wc26-error{background:#f1d7db;color:#7c2938;padding:11px;font-size:11px}.wc26-empty,.wc26-success{padding:70px 26px}.wc26-empty h3,.wc26-success h3{font-size:36px;letter-spacing:-.045em;margin:0 0 10px}.wc26-empty p,.wc26-success p{color:#746c68;line-height:1.6}.wc26-empty a,.wc26-success a{display:inline-flex;min-height:50px;align-items:center;background:var(--graphite);color:white!important;padding:0 18px;border-radius:12px;text-decoration:none;margin-top:14px}.wc26-success>span{font-size:10px;letter-spacing:.13em;text-transform:uppercase}.wc26-success button{display:block;border:0;background:transparent;border-bottom:1px solid currentColor;margin-top:20px;padding:3px 0;cursor:pointer}
      @media(max-width:620px){.wc26-drawer{width:100%}.wc26-drawer>header{height:70px}.wc26-steps span{display:none}.wc26-steps button{min-height:48px}.wc26-panel{padding:20px 16px 90px}.wc26-two{grid-template-columns:1fr}.wc26-segments{grid-template-columns:1fr}.wc26-lines article{padding:12px}.wc26-summary>div{grid-template-columns:82px 1fr}}
    `}</style>
  </div>;
}

function Summary({label,value}:{label:string;value:string}){return <div><small>{label}</small><span>{value}</span></div>}
function Success({result,close}:{result:OrderResult;close:()=>void}){const total=result.total||(typeof result.total_minor==="number"?money(result.total_minor):"проверена сервером");return <div className="wc26-success"><span>WINK · #{result.number}</span><h3>Всё. Теперь красиво — наша работа.</h3><p>Заказ создан, сумма {total}. Сейчас он ждёт оплаты: эквайринг ещё не подключён, поэтому мы не притворяемся, что деньги списаны.</p><Link href={`/order/?token=${encodeURIComponent(result.public_token)}`}>Следить за заказом</Link><button onClick={close}>Вернуться на главную</button></div>}
