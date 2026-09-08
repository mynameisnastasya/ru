export const INITIAL_CHECKOUT_FIELDS = {
  gift: true,
  surprise: true,
  anonymous: false,
  recipientName: "",
  recipientPhone: "",
  senderName: "",
  message: "",
  address: "",
  date: "",
  slot: "Удобное время согласуем",
  exactTime: "",
  leaveAtDoor: false,
  customerName: "",
  customerPhone: "",
};

export type CheckoutFields = typeof INITIAL_CHECKOUT_FIELDS;

// Per-tab, in-memory draft only. A reload discards personal details; never use
// storage or a server-side singleton for them. Demo and live drafts are isolated.
const drafts: { demo: CheckoutFields | null; live: CheckoutFields | null } = {
  demo: null,
  live: null,
};

export function readCheckoutDraft(demo: boolean): CheckoutFields | null {
  if (typeof window === "undefined") return null;
  const draft = drafts[demo ? "demo" : "live"];
  return draft ? { ...draft } : null;
}

export function saveCheckoutDraft(demo: boolean, fields: CheckoutFields) {
  if (typeof window === "undefined") return;
  drafts[demo ? "demo" : "live"] = { ...fields };
}

export function clearCheckoutDraft(demo: boolean) {
  if (typeof window === "undefined") return;
  drafts[demo ? "demo" : "live"] = null;
}
