import { afterEach, describe, expect, it, vi } from "vitest";
import {
  INITIAL_CHECKOUT_FIELDS,
  clearCheckoutDraft,
  readCheckoutDraft,
  saveCheckoutDraft,
} from "./wink-checkout-draft";

afterEach(() => {
  vi.stubGlobal("window", {});
  clearCheckoutDraft(true);
  clearCheckoutDraft(false);
  vi.unstubAllGlobals();
});

describe("private checkout draft", () => {
  it("retains all fields across client-side navigation without browser storage", () => {
    // No localStorage or sessionStorage exists on this window.
    vi.stubGlobal("window", {});
    const fields = {
      ...INITIAL_CHECKOUT_FIELDS,
      customerName: "Тестовый покупатель",
      customerPhone: "+7 000 000-00-00",
      address: "Тестовая улица, дом 1",
      date: "2030-10-01",
      surprise: false,
    };
    saveCheckoutDraft(true, fields);
    expect(readCheckoutDraft(true)).toEqual(fields);
    fields.customerName = "Изменение исходного объекта";
    const restored = readCheckoutDraft(true)!;
    restored.address = "Изменение прочитанного объекта";
    expect(readCheckoutDraft(true)).toMatchObject({
      customerName: "Тестовый покупатель",
      address: "Тестовая улица, дом 1",
    });
  });

  it("isolates demo data and clears a completed checkout", () => {
    vi.stubGlobal("window", {});
    saveCheckoutDraft(true, { ...INITIAL_CHECKOUT_FIELDS, customerName: "Демо" });
    expect(readCheckoutDraft(false)).toBeNull();
    saveCheckoutDraft(false, { ...INITIAL_CHECKOUT_FIELDS, customerName: "Заказ" });
    clearCheckoutDraft(true);
    expect(readCheckoutDraft(true)).toBeNull();
    expect(readCheckoutDraft(false)?.customerName).toBe("Заказ");
  });

  it("does not keep personal information in the server process", () => {
    vi.stubGlobal("window", undefined);
    saveCheckoutDraft(false, { ...INITIAL_CHECKOUT_FIELDS, customerName: "Не сохранять" });
    expect(readCheckoutDraft(false)).toBeNull();
    vi.stubGlobal("window", {});
    expect(readCheckoutDraft(false)).toBeNull();
  });
});
