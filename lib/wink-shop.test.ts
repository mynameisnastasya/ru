import { afterEach, describe, expect, it, vi } from "vitest";
import { createClientId } from "./wink-shop";
import {
  CART_KEY,
  FALLBACK_CATALOG,
  SHOP_EVENT,
  budgetMatches,
  configText,
  displayPrice,
  isConfirmedOrder,
  kemerovoDate,
  normalizePhone,
  parseCart,
  parseCatalog,
  personalizationErrors,
  priceFor,
  productImage,
  searchProducts,
  validDeliveryDate,
  writeCart,
} from "./wink-shop";

const air = FALLBACK_CATALOG.products.find((p) => p.slug === "air16")!;
const line = {
  lineId: "example",
  productId: air.slug,
  name: air.name,
  subtitle: air.subtitle,
  qty: 1,
  unitPriceMinor: air.base_price_minor,
  config: { palette: "PINK_MILK", addons: [] },
};
afterEach(() => vi.unstubAllGlobals());

describe("catalog and prices used by the storefront", () => {
  it("does not illustrate BABY REVEAL SOLO with the extra fountains", () => {
    const solo = FALLBACK_CATALOG.products.find(
      (p) => p.slug === "baby-reveal-solo",
    )!;
    const full = FALLBACK_CATALOG.products.find(
      (p) => p.slug === "baby-reveal16",
    )!;
    expect(productImage(solo)).toContain("reveal-solo-v2.webp");
    expect(productImage(solo)).not.toBe(productImage(full));
  });
  it("uses v6 base plus bows without a palette surcharge", () => {
    const product = {
      ...air,
      variants: [
        {
          id: "v",
          sku: "test",
          palette_id: "PINK_MILK",
          price_delta_minor: 20000,
          config: {},
        },
      ],
    };
    expect(
      priceFor(
        product,
        { palette: "PINK_MILK", addons: ["BOWS_16"] },
        FALLBACK_CATALOG,
      ),
    ).toBe(500000);
    expect(displayPrice(product, "PINK_MILK")).toBe(450000);
  });
  it("does not charge an addon from a different size", () => {
    expect(
      priceFor(air, { palette: "MILK", addons: ["BOWS_30"] }, FALLBACK_CATALOG),
    ).toBe(450000);
    expect(
      personalizationErrors(air, { palette: "MILK", addons: ["BOWS_30"] }),
    ).not.toEqual([]);
  });
  it("keeps v6 foil colours at the same price", () => {
    const hearts = {
      ...FALLBACK_CATALOG.products.find((p) => p.slug === "hearts7")!,
      variants: [
        {
          id: "h",
          sku: "h",
          palette_id: null,
          price_delta_minor: 10000,
          config: { foil_color: "G" },
        },
      ],
    };
    expect(
      priceFor(hearts, { foilColor: "G", addons: [] }, FALLBACK_CATALOG),
    ).toBe(320000);
  });
  it("rejects an unusable catalog and skips malformed records", () => {
    expect(() => parseCatalog({ products: [] })).toThrow();
    expect(
      parseCatalog({ products: [null, { slug: "unrecognized" }, air] })
        .products,
    ).toHaveLength(1);
  });
  it("treats budget as a ceiling including the selected palette", () => {
    expect(budgetMatches(500000, "5000")).toBe(true);
    expect(budgetMatches(519000, "5000")).toBe(false);
    expect(
      budgetMatches(
        displayPrice(
          {
            ...air,
            variants: [
              {
                id: "v",
                sku: "v",
                palette_id: "PINK_MILK",
                price_delta_minor: 160000,
                config: {},
              },
            ],
          },
          "PINK_MILK",
        ),
        "5000",
      ),
    ).toBe(true);
  });
  it("combines search intent and budget rather than returning unrelated inexpensive products", () => {
    const results = searchProducts(
      FALLBACK_CATALOG.products,
      "сердца до 5 000 ₽",
    );
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (p) => ["HEARTS", "LOVE"].includes(p.name) && displayPrice(p) <= 500000,
      ),
    ).toBe(true);
    expect(
      searchProducts(FALLBACK_CATALOG.products, "несуществующий запрос"),
    ).toEqual([]);
    expect(
      searchProducts(FALLBACK_CATALOG.products, "Детям").every((p) =>
        ["BIRTHDAY", "AIR", "MESSAGE"].includes(p.name),
      ),
    ).toBe(true);
  });
});

describe("cart integrity and persistence", () => {
  it("creates a valid local ID when randomUUID is unavailable", () => {
    const source = {
      getRandomValues: (bytes: Uint8Array) => bytes.fill(17),
    } as unknown as Crypto;
    expect(createClientId(source)).toBe("11111111-1111-4111-9111-111111111111");
  });
  it("restores a valid cart without losing personalization", () => {
    expect(parseCart(JSON.stringify([line]))).toEqual([line]);
    expect(parseCart(null)).toEqual([]);
  });
  it.each([
    "{",
    "null",
    "{}",
    JSON.stringify([{ ...line, qty: -1 }]),
    JSON.stringify([{ ...line, qty: 1.5 }]),
    JSON.stringify([{ ...line, unitPriceMinor: null }]),
    JSON.stringify([{ ...line, config: { addons: "broken" } }]),
    JSON.stringify([line, line]),
  ])("rejects corrupt cart: %s", (value) => {
    expect(() => parseCart(value)).toThrow();
  });
  it("does not announce a saved cart when browser storage fails", () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", {
      localStorage: {
        setItem: () => {
          throw new Error("quota");
        },
      },
      dispatchEvent,
    });
    expect(() => writeCart([line])).toThrow("quota");
    expect(dispatchEvent).not.toHaveBeenCalled();
  });
  it("notifies other storefront components after writing", () => {
    const setItem = vi.fn(),
      dispatchEvent = vi.fn();
    vi.stubGlobal("window", { localStorage: { setItem }, dispatchEvent });
    writeCart([line]);
    expect(setItem).toHaveBeenCalledWith(CART_KEY, JSON.stringify([line]));
    expect(dispatchEvent.mock.calls[0][0].type).toBe(SHOP_EVENT);
  });
  it("rejects malformed birthday digits and unknown palette values", () => {
    const birthday = FALLBACK_CATALOG.products.find(
      (p) => p.slug === "birthday16-2",
    )!;
    expect(
      personalizationErrors(birthday, {
        number: "2x5",
        palette: "MILK",
        addons: [],
      }),
    ).not.toEqual([]);
    expect(
      personalizationErrors(birthday, {
        number: "25",
        palette: "MILK",
        addons: [],
      }),
    ).toEqual([]);
    expect(
      personalizationErrors(air, { palette: "unknown", addons: [] }),
    ).not.toEqual([]);
  });
  it("does not disclose reveal colors in the visible cart summary", () => {
    expect(configText({ revealResult: "girl", addons: [] })).toBe(
      "Цвет конфетти выбран",
    );
    expect(configText({ revealResult: "boy", addons: [] })).toBe(
      "Цвет конфетти выбран",
    );
  });
});

describe("checkout input and receipt boundaries", () => {
  it("uses Kemerovo's day across the UTC date boundary", () => {
    const now = new Date("2026-09-06T18:30:00Z");
    expect(kemerovoDate(now)).toBe("2026-09-07");
    expect(validDeliveryDate("2026-09-06", now)).toBe(false);
    expect(validDeliveryDate("2026-09-07", now)).toBe(true);
    expect(validDeliveryDate("2027-02-30", now)).toBe(false);
  });
  it("normalizes Russian numbers and rejects short numbers", () => {
    expect(normalizePhone("8 (900) 123-45-67")).toBe("+79001234567");
    expect(normalizePhone("9001234567")).toBe("+79001234567");
    expect(normalizePhone("1234567")).toBeNull();
    expect(normalizePhone("+1 202 555 0100")).toBeNull();
  });
  it.each([
    null,
    {},
    { number: "" },
    { number: "1", public_token: "" },
    { number: "1", public_token: null },
  ])("does not treat an incomplete order as success", (value) => {
    expect(isConfirmedOrder(value)).toBe(false);
  });
  it("accepts only a receipt with an order number and tracking token", () => {
    expect(
      isConfirmedOrder({ number: "W-123", public_token: "test-token" }),
    ).toBe(true);
  });
});
