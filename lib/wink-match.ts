import { findComposition, type WINKComposition } from "./wink-domain";
import { displayPrice, paletteIds, type Product } from "./wink-shop";

export type WinkMatchAnswers = {
  recipient: "her" | "him" | "kids" | "mom" | "friend";
  occasion: "birthday" | "love" | "any" | "baby";
  space: "bedroom" | "living" | "venue" | "unsure";
  mood: "PINK_MILK" | "PINK_CHROME" | "MILK" | "BLACK_CHROME" | "choose";
  /** Composition budget in roubles. Delivery and optional additions are separate. */
  budget: 5000 | 7500 | "any";
};

export type WinkMatchRecommendation = {
  product: Product;
  palette: string;
  reason: string;
};

function occasionScore(
  composition: WINKComposition,
  occasion: WinkMatchAnswers["occasion"],
) {
  if (occasion === "birthday" && composition.family === "BIRTHDAY") return 1000;
  if (occasion === "love" && ["LOVE", "HEARTS"].includes(composition.family))
    return 1000;
  return {
    AIR: 40,
    MESSAGE: 35,
    LOVE: 25,
    HEARTS: 20,
    BIRTHDAY: 10,
    "BABY REVEAL": 0,
  }[composition.family];
}

function spaceScore(
  composition: WINKComposition,
  space: WinkMatchAnswers["space"],
) {
  const larger =
    composition.latexCount === 30 ||
    composition.heartCount === 14 ||
    (composition.family === "BABY REVEAL" && composition.latexCount === 16);
  const spacious = space === "living" || space === "venue";
  return larger === spacious ? 60 : 0;
}

function choosePalette(
  product: Product,
  composition: WINKComposition,
  answers: WinkMatchAnswers,
) {
  // HEARTS is a single foil colour, not a mixed latex palette; BABY stays neutral.
  if (composition.family === "HEARTS" || composition.family === "BABY REVEAL")
    return "MILK";
  const preferred =
    answers.mood === "choose"
      ? answers.occasion === "love"
        ? "PINK_MILK"
        : "MILK"
      : answers.mood;
  const supported = paletteIds(product);
  return supported.includes(preferred)
    ? preferred
    : supported.includes("MILK")
      ? "MILK"
      : supported[0] || "MILK";
}

function explain(composition: WINKComposition, answers: WinkMatchAnswers) {
  let occasion: string;
  if (composition.family === "BABY REVEAL")
    occasion = "Чёрный шар-сюрприз для момента раскрытия";
  else if (composition.family === "BIRTHDAY")
    occasion = "Цифры делают день рождения главным акцентом";
  else if (composition.family === "HEARTS")
    occasion = `${composition.heartCount} сердец одного цвета — поздравление без лишних слов`;
  else if (composition.family === "LOVE")
    occasion = "Сердца добавляют личный акцент к воздушному сету";
  else if (composition.family === "MESSAGE")
    occasion =
      answers.recipient === "mom"
        ? "Ваши слова для мамы на прозрачном шаре"
        : "Ваши слова на прозрачном шаре делают поздравление личным";
  else
    occasion =
      answers.occasion === "birthday"
        ? "Поздравление с днём рождения без цифр, в выбранном бюджете"
        : "Два фонтана для красивого поздравления без привязки к возрасту";

  if (composition.family === "BABY REVEAL" && composition.latexCount === 0)
    return `${occasion}. SOLO — один шар, без боковых фонтанов.`;
  const spacious = answers.space === "living" || answers.space === "venue";
  const larger = composition.latexCount === 30 || composition.heartCount === 14;
  const quantity = composition.latexCount
    ? `${composition.latexCount} латексных шаров`
    : `${composition.heartCount} сердец`;
  const space = larger
    ? `${quantity} создают более объёмную композицию${spacious ? " для просторной комнаты" : ""}`
    : `${quantity} — ${spacious ? "более сдержанный объём для выбранного пространства" : answers.space === "bedroom" ? "компактный формат для небольшой комнаты" : "компактный формат без лишнего объёма"}`;
  return `${occasion}. ${space[0].toUpperCase()}${space.slice(1)}.`;
}

/**
 * A small, deterministic edit of the approved catalogue, not an availability engine.
 * Occasion comes first, then room scale. Never substitutes a non-reveal for BABY.
 * Prices are read from the supplied catalogue; delivery is not included in the budget.
 */
export function recommendWinkMatch(
  products: readonly Product[],
  answers: WinkMatchAnswers,
): WinkMatchRecommendation[] {
  const ceiling = answers.budget === "any" ? Infinity : answers.budget * 100;
  const seen = new Set<string>();
  return products
    .flatMap((product, index) => {
      const composition = findComposition(product.slug);
      if (
        !composition ||
        seen.has(product.slug) ||
        !Number.isSafeInteger(product.base_price_minor) ||
        product.base_price_minor <= 0 ||
        (composition.family === "BABY REVEAL") !== (answers.occasion === "baby")
      )
        return [];
      const palette = choosePalette(product, composition, answers);
      const price = displayPrice(product, palette);
      if (!Number.isSafeInteger(price) || price <= 0 || price > ceiling)
        return [];
      seen.add(product.slug);
      return [
        {
          product,
          composition,
          palette,
          index,
          score:
            occasionScore(composition, answers.occasion) +
            spaceScore(composition, answers.space),
        },
      ];
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 2)
    .map(({ product, composition, palette }) => ({
      product,
      palette,
      reason: explain(composition, answers),
    }));
}
