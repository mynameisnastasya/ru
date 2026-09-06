"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import WinkPageFrame2026 from "@/components/WinkPageFrame2026";

const STORAGE_KEY = "wink-important-dates";

type ImportantDate = {
  id: string;
  name: string;
  date: string;
};

function readDates(): ImportantDate[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as ImportantDate[];
    return Array.isArray(value) ? value.filter((item) => item?.id && item?.name && item?.date) : [];
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(parsed);
}

export default function WinkDates2026() {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDates(readDates()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const sorted = useMemo(() => [...dates].sort((a, b) => a.date.slice(5).localeCompare(b.date.slice(5))), [dates]);

  function persist(next: ImportantDate[]) {
    setDates(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2 || !date) return;
    persist([...dates, { id: window.crypto.randomUUID(), name: cleanName, date }]);
    setName("");
    setDate("");
  }

  function remove(id: string) {
    persist(dates.filter((item) => item.id !== id));
  }

  return <WinkPageFrame2026>
    <main className="wd26">
      <section className="wd26-hero">
        <p>WINK · важные даты</p>
        <h1>Помнить можно<br/>не всё самому.</h1>
        <span>Сохраните дни рождения и другие поводы. Пока список хранится только на этом устройстве — без регистрации и без ложной синхронизации.</span>
      </section>

      <section className="wd26-grid">
        <form className="wd26-form" onSubmit={submit}>
          <p>Добавить человека</p>
          <label>Имя<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Катя" /></label>
          <label>Важная дата<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <button type="submit" disabled={name.trim().length < 2 || !date}>Сохранить дату</button>
          <small>Когда появится полноценный кабинет WINK, даты можно будет синхронизировать между устройствами и включать напоминания. Сейчас ничего такого не обещаем автоматически.</small>
        </form>

        <div className="wd26-list">
          <div className="wd26-listHead"><p>Ваш список</p><span>{sorted.length ? `${sorted.length} ${sorted.length === 1 ? "дата" : "даты"}` : "Пока пусто"}</span></div>
          {sorted.length ? sorted.map((item) => <article key={item.id}><div><strong>{item.name}</strong><span>{formatDate(item.date)}</span></div><button type="button" onClick={() => remove(item.id)} aria-label={`Удалить дату ${item.name}`}>Удалить</button></article>) : <div className="wd26-empty"><h2>Начните с одного человека.</h2><p>Так WINK постепенно станет местом, где подарок не приходится вспоминать в последний вечер.</p></div>}
        </div>
      </section>
    </main>
    <style jsx global>{`
      .wd26{min-height:78vh;background:#F7F3EE;color:#242222;padding:100px max(24px,calc((100vw - 1200px)/2)) 120px;font-family:Inter,Arial,sans-serif}.wd26 *{box-sizing:border-box}.wd26-hero{max-width:850px;margin-bottom:70px}.wd26-hero>p,.wd26-form>p,.wd26-listHead>p{margin:0 0 18px;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#81756f}.wd26-hero h1{margin:0;font:400 clamp(54px,7vw,96px)/.9 "Instrument Serif",Georgia,serif;letter-spacing:-.055em}.wd26-hero>span{display:block;max-width:650px;margin-top:28px;font-size:17px;line-height:1.6;color:#6d6460}.wd26-grid{display:grid;grid-template-columns:minmax(280px,.7fr) minmax(0,1.3fr);gap:18px;align-items:start}.wd26-form,.wd26-list{background:#FFFDFC;border:1px solid rgba(36,34,34,.12);padding:30px}.wd26-form{display:flex;flex-direction:column;gap:16px}.wd26-form label{display:flex;flex-direction:column;gap:7px;font-size:11px}.wd26-form input{min-height:52px;border:1px solid rgba(36,34,34,.14);background:#F7F3EE;padding:0 14px;font:inherit}.wd26-form button{min-height:54px;border:0;background:#242222;color:white;font-weight:600;cursor:pointer}.wd26-form button:disabled{opacity:.35;cursor:not-allowed}.wd26-form small{font-size:10px;line-height:1.55;color:#796f6a}.wd26-listHead{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid rgba(36,34,34,.12);padding-bottom:14px}.wd26-listHead>p{margin:0}.wd26-listHead>span{font-size:11px;color:#81756f}.wd26-list article{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px 0;border-bottom:1px solid rgba(36,34,34,.1)}.wd26-list article>div{display:flex;flex-direction:column;gap:5px}.wd26-list article strong{font-size:18px}.wd26-list article span{font-size:12px;color:#736a66}.wd26-list article button{border:0;background:transparent;text-decoration:underline;text-underline-offset:3px;cursor:pointer;color:#736a66}.wd26-empty{padding:50px 0 30px}.wd26-empty h2{margin:0;font:400 38px/1 "Instrument Serif",Georgia,serif}.wd26-empty p{max-width:520px;color:#736a66;line-height:1.6}
      @media(max-width:760px){.wd26{padding:72px 18px 92px}.wd26-grid{grid-template-columns:1fr}.wd26-form,.wd26-list{padding:22px}.wd26-hero{margin-bottom:46px}.wd26-hero>span{font-size:15px}}
    `}</style>
  </WinkPageFrame2026>;
}
