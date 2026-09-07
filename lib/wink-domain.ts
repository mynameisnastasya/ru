export type WINKFamily =
  | "AIR"
  | "BIRTHDAY"
  | "LOVE"
  | "HEARTS"
  | "MESSAGE"
  | "BABY REVEAL";

export type WINKComposition = {
  productionId: string;
  slug: string;
  family: WINKFamily;
  composition: string;
  directPriceMinor: number;
  latexCount: number;
  digitCount: number;
  heartCount: number;
  bubbleCount: number;
  revealCount: number;
};

// Direct channel master: WINK_PRICE_v6_2026. All amounts are integer kopecks.
// Delivery is separate. These are reference direct prices, not live supplier quotations.
export const WINK_COMPOSITIONS: readonly WINKComposition[] = [
  {
    productionId: "AIR16",
    slug: "air16",
    family: "AIR",
    composition: "Два фонтана · 16",
    directPriceMinor: 450000,
    latexCount: 16,
    digitCount: 0,
    heartCount: 0,
    bubbleCount: 0,
    revealCount: 0,
  },
  {
    productionId: "AIR30",
    slug: "air30",
    family: "AIR",
    composition: "Два фонтана · 30",
    directPriceMinor: 750000,
    latexCount: 30,
    digitCount: 0,
    heartCount: 0,
    bubbleCount: 0,
    revealCount: 0,
  },
  {
    productionId: "NUM16_1",
    slug: "birthday16-1",
    family: "BIRTHDAY",
    composition: "16 шаров + одна цифра",
    directPriceMinor: 590000,
    latexCount: 16,
    digitCount: 1,
    heartCount: 0,
    bubbleCount: 0,
    revealCount: 0,
  },
  {
    productionId: "NUM16_2",
    slug: "birthday16-2",
    family: "BIRTHDAY",
    composition: "16 шаров + две цифры",
    directPriceMinor: 720000,
    latexCount: 16,
    digitCount: 2,
    heartCount: 0,
    bubbleCount: 0,
    revealCount: 0,
  },
  {
    productionId: "NUM30_1",
    slug: "birthday30-1",
    family: "BIRTHDAY",
    composition: "30 шаров + одна цифра",
    directPriceMinor: 890000,
    latexCount: 30,
    digitCount: 1,
    heartCount: 0,
    bubbleCount: 0,
    revealCount: 0,
  },
  {
    productionId: "NUM30_2",
    slug: "birthday30-2",
    family: "BIRTHDAY",
    composition: "30 шаров + две цифры",
    directPriceMinor: 990000,
    latexCount: 30,
    digitCount: 2,
    heartCount: 0,
    bubbleCount: 0,
    revealCount: 0,
  },
  {
    productionId: "MIX16",
    slug: "love16",
    family: "LOVE",
    composition: "16 шаров + 2 сердца",
    directPriceMinor: 520000,
    latexCount: 16,
    digitCount: 0,
    heartCount: 2,
    bubbleCount: 0,
    revealCount: 0,
  },
  {
    productionId: "MIX30",
    slug: "love30",
    family: "LOVE",
    composition: "30 шаров + 4 сердца",
    directPriceMinor: 890000,
    latexCount: 30,
    digitCount: 0,
    heartCount: 4,
    bubbleCount: 0,
    revealCount: 0,
  },
  {
    productionId: "HEART7",
    slug: "hearts7",
    family: "HEARTS",
    composition: "Семь сердец",
    directPriceMinor: 320000,
    latexCount: 0,
    digitCount: 0,
    heartCount: 7,
    bubbleCount: 0,
    revealCount: 0,
  },
  {
    productionId: "HEART14",
    slug: "hearts14",
    family: "HEARTS",
    composition: "Четырнадцать сердец",
    directPriceMinor: 590000,
    latexCount: 0,
    digitCount: 0,
    heartCount: 14,
    bubbleCount: 0,
    revealCount: 0,
  },
  {
    productionId: "MSG16",
    slug: "message16",
    family: "MESSAGE",
    composition: "16 шаров + баблс с надписью",
    directPriceMinor: 650000,
    latexCount: 16,
    digitCount: 0,
    heartCount: 0,
    bubbleCount: 1,
    revealCount: 0,
  },
  {
    productionId: "MSG30",
    slug: "message30",
    family: "MESSAGE",
    composition: "30 шаров + баблс с надписью",
    directPriceMinor: 950000,
    latexCount: 30,
    digitCount: 0,
    heartCount: 0,
    bubbleCount: 1,
    revealCount: 0,
  },
  {
    productionId: "REV0",
    slug: "baby-reveal-solo",
    family: "BABY REVEAL",
    composition: "Момент раскрытия",
    directPriceMinor: 350000,
    latexCount: 0,
    digitCount: 0,
    heartCount: 0,
    bubbleCount: 0,
    revealCount: 1,
  },
  {
    productionId: "REV16",
    slug: "baby-reveal16",
    family: "BABY REVEAL",
    composition: "Момент раскрытия + 16 шаров",
    directPriceMinor: 750000,
    latexCount: 16,
    digitCount: 0,
    heartCount: 0,
    bubbleCount: 0,
    revealCount: 1,
  },
] as const;

export const WINK_PALETTES = [
  "MILK",
  "PINK_MILK",
  "PINK_CHROME",
  "BLACK_GOLD",
  "NUDE_GOLD",
  "BLACK_CHROME",
  "FROST",
  "CHERRY_MILK",
] as const;

export const WINK_ACTIVE_ADDONS = ["BOWS_16", "BOWS_30"] as const;
export const WINK_PLANNED_NOT_FOR_SALE = ["PHOTOS", "BUNNY"] as const;

export type PersonalizationInput = {
  number?: string;
  inscription?: string;
  revealResult?: "girl" | "boy" | "P" | "B" | "";
};

export function findComposition(slug: string) {
  return WINK_COMPOSITIONS.find((item) => item.slug === slug) ?? null;
}

export function validatePersonalization(
  product: WINKComposition,
  input: PersonalizationInput,
): string[] {
  const errors: string[] = [];

  if (product.family === "BIRTHDAY") {
    const number = String(input.number ?? "");
    if (!new RegExp(`^\\d{${product.digitCount}}$`).test(number))
      errors.push(`number_must_have_${product.digitCount}_digits`);
  }

  if (product.family === "MESSAGE") {
    const inscription = String(input.inscription ?? "").trim();
    if (!inscription) errors.push("inscription_required");
    if (inscription.length > 40) errors.push("inscription_too_long");
    if (inscription.split(/\r?\n/).length > 3)
      errors.push("inscription_too_many_lines");
  }

  if (
    product.family === "BABY REVEAL" &&
    !["girl", "boy", "P", "B"].includes(String(input.revealResult ?? ""))
  ) {
    errors.push("reveal_result_required");
  }

  return errors;
}

export function bowsAddonFor(product: WINKComposition) {
  if (!["AIR", "BIRTHDAY", "MESSAGE"].includes(product.family)) return null;
  if (product.latexCount === 16)
    return { code: "BOWS_16" as const, count: 8, priceDeltaMinor: 50000 };
  if (product.latexCount === 30)
    return { code: "BOWS_30" as const, count: 14, priceDeltaMinor: 80000 };
  return null;
}
