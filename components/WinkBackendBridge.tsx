"use client";

import { useEffect } from "react";

const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const DRAFT_KEY = "wink-checkout-draft-v1";
const IDEM_KEY = "wink-checkout-idempotency-v1";

type CheckoutDraft = {
  giftForSomeone?: boolean;
  recipientName?: string;
  recipientPhone?: string;
  anonymous?: boolean;
  senderName?: string;
  noCall?: boolean;
  message?: string;
  deliveryMode?: "today" | "tomorrow" | "date";
  deliveryDate?: string;
  deliverySlot?: string;
  address?: string;
};

type CartItem = {
  lineId: string;
  productId: string;
  name: string;
  subtitle?: string;
  image?: string;
  qty: number;
  config?: { palette?: string; number?: string; addons?: string[]; baseCount?: number };
};

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveDraft(patch: Partial<CheckoutDraft>) {
  const next = { ...readJson<CheckoutDraft>(DRAFT_KEY, {}), ...patch };
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
}

function normalizedLabel(control: Element) {
  return control.closest("label")?.textContent?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";
}

function valueOf(root: ParentNode, labelStartsWith: string) {
  const labels = Array.from(root.querySelectorAll("label"));
  const label = labels.find((item) => item.textContent?.trim().toLowerCase().startsWith(labelStartsWith.toLowerCase()));
  const control = label?.querySelector("input,textarea,select") as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  return control?.value?.trim() ?? "";
}

function renderServerResult(data: any, error?: string) {
  window.setTimeout(() => {
    const box = document.querySelector(".order-ready.final") as HTMLElement | null;
    if (!box) return;
    box.replaceChildren();

    const title = document.createElement("b");
    const text = document.createElement("p");
    if (error) {
      title.textContent = "Заказ не создан.";
      text.textContent = error;
      box.append(title, text);
      return;
    }

    const order = data?.order;
    title.textContent = `Заказ #${order?.number ?? "—"} создан.`;
    text.textContent = `WINK записал заказ в базу. Сумма проверена сервером: ${order?.total ?? "—"}. Статус: ждёт оплату.`;
    const note = document.createElement("small");
    note.textContent = "После подтверждённой оплаты заказ автоматически уйдёт в операционный Telegram-канал и производственную очередь.";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = "Скопировать номер заказа";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(String(order?.number ?? ""));
        copy.textContent = "Скопировано ✓";
      } catch {
        copy.textContent = String(order?.number ?? "");
      }
    });
    box.append(title, text, note, copy);
  }, 50);
}

export default function WinkBackendBridge() {
  useEffect(() => {
    const captureControl = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
      const label = normalizedLabel(target);

      if (label.startsWith("recipient name")) saveDraft({ recipientName: target.value });
      else if (label.startsWith("recipient phone")) saveDraft({ recipientPhone: target.value });
      else if (label.startsWith("who is it from")) saveDraft({ senderName: target.value });
      else if (label.startsWith("message")) saveDraft({ message: target.value });
      else if (label.startsWith("date")) saveDraft({ deliveryDate: target.value, deliveryMode: "date" });
      else if (label.startsWith("preferred slot")) saveDraft({ deliverySlot: target.value });
      else if (label.startsWith("delivery address")) saveDraft({ address: target.value });
      else if (label.includes("keep me anonymous") && target instanceof HTMLInputElement) saveDraft({ anonymous: target.checked });
      else if (label.includes("don’t call the recipient") && target instanceof HTMLInputElement) saveDraft({ noCall: target.checked });
    };

    const captureClick = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest("button");
      if (!button) return;
      const text = button.textContent?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";
      if (text.includes("yes, for someone else")) saveDraft({ giftForSomeone: true });
      else if (text.includes("no, for me")) saveDraft({ giftForSomeone: false });
      else if (text === "запросить сегодня") saveDraft({ deliveryMode: "today", deliveryDate: localDate(0) });
      else if (text === "завтра") saveDraft({ deliveryMode: "tomorrow", deliveryDate: localDate(1) });
      else if (text === "дата") saveDraft({ deliveryMode: "date" });
    };

    let inFlight = false;
    const submit = async (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.classList.contains("checkout-panel")) return;
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      if (!submitButton || !submitButton.textContent?.includes("Собрать заявку")) return;

      event.preventDefault();
      if (inFlight) return;
      inFlight = true;
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Создаём заказ…";

      try {
        const cart = readJson<CartItem[]>("wink-gift", []);
        const draft = readJson<CheckoutDraft>(DRAFT_KEY, {});
        const customerName = valueOf(form, "your name");
        const customerPhone = valueOf(form, "your phone");
        const giftForSomeone = draft.giftForSomeone ?? true;
        const deliveryMode = draft.deliveryMode ?? "tomorrow";
        const deliveryDate = deliveryMode === "today" ? localDate(0) : deliveryMode === "tomorrow" ? localDate(1) : draft.deliveryDate || localDate(1);
        const deliverySlot = draft.deliverySlot || "12:00–15:00";
        const items = cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          subtitle: item.subtitle,
          image: item.image,
          qty: item.qty,
          config: {
            ...(item.config ?? {}),
            baseCount: item.productId === "custom"
              ? item.config?.baseCount ?? Number(item.name.match(/WINK\s+(\d+)/i)?.[1] ?? 0)
              : item.config?.baseCount,
          },
        }));

        const fingerprint = JSON.stringify({ items, draft, customerName, customerPhone, deliveryDate, deliverySlot });
        const savedIdem = readJson<{ fingerprint: string; key: string } | null>(IDEM_KEY, null);
        const idem = savedIdem?.fingerprint === fingerprint ? savedIdem.key : crypto.randomUUID();
        window.localStorage.setItem(IDEM_KEY, JSON.stringify({ fingerprint, key: idem }));

        const params = new URLSearchParams(window.location.search);
        const response = await fetch(`${API_URL}/api/orders`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            idempotency_key: idem,
            customer: { name: customerName, phone: customerPhone },
            gift: {
              forSomeone: giftForSomeone,
              recipientName: giftForSomeone ? draft.recipientName ?? "" : "",
              recipientPhone: giftForSomeone ? draft.recipientPhone ?? "" : "",
              anonymous: giftForSomeone ? Boolean(draft.anonymous) : false,
              senderName: giftForSomeone ? draft.senderName ?? "" : "",
              dontCall: giftForSomeone ? draft.noCall ?? true : false,
              message: giftForSomeone ? draft.message ?? "" : "",
            },
            delivery: {
              date: deliveryDate,
              slot: deliverySlot,
              address: draft.address ?? "",
            },
            items,
            source: "github-pages",
            utm: {
              source: params.get("utm_source"),
              medium: params.get("utm_medium"),
              campaign: params.get("utm_campaign"),
              content: params.get("utm_content"),
              term: params.get("utm_term"),
            },
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error?.message || "Не удалось связаться с WINK backend.");
        window.localStorage.setItem("wink-last-order", JSON.stringify(data.order));
        renderServerResult(data);
      } catch (error) {
        renderServerResult(null, error instanceof Error ? error.message : "Неизвестная ошибка заказа.");
      } finally {
        inFlight = false;
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    };

    document.addEventListener("input", captureControl, true);
    document.addEventListener("change", captureControl, true);
    document.addEventListener("click", captureClick, true);
    document.addEventListener("submit", submit, true);
    return () => {
      document.removeEventListener("input", captureControl, true);
      document.removeEventListener("change", captureControl, true);
      document.removeEventListener("click", captureClick, true);
      document.removeEventListener("submit", submit, true);
    };
  }, []);

  return null;
}
