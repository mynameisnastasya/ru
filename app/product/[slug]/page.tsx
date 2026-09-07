import type { Metadata } from "next";
import { Suspense } from "react";
import WinkProduct2026 from "@/components/WinkProduct2026";

const SLUGS = [
  "air16",
  "air30",
  "birthday16-1",
  "birthday16-2",
  "birthday30-1",
  "birthday30-2",
  "love16",
  "love30",
  "hearts7",
  "hearts14",
  "message16",
  "message30",
  "baby-reveal-solo",
  "baby-reveal16",
];
const TITLES: Record<string, string> = {
  air16: "Воздушный сет · 16 шаров",
  air30: "Воздушный сет · 30 шаров",
  "birthday16-1": "16 шаров + 1 цифра",
  "birthday16-2": "16 шаров + 2 цифры",
  "birthday30-1": "30 шаров + 1 цифра",
  "birthday30-2": "30 шаров + 2 цифры",
  love16: "16 шаров + 2 сердца",
  love30: "30 шаров + 4 сердца",
  hearts7: "7 шаров в форме сердца",
  hearts14: "14 шаров в форме сердца",
  message16: "16 шаров + личная надпись",
  message30: "30 шаров + личная надпись",
  "baby-reveal-solo": "Шар-сюрприз",
  "baby-reveal16": "Шар-сюрприз + 16 шаров",
};

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = TITLES[slug] || "Подарок WINK";
  return {
    title: `${title} — WINK`,
    description: `${title}. Готовая композиция WINK: выберите палитру и личные детали без сложного конструктора.`,
  };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense fallback={<p style={{ padding: 40 }}>Открываем композицию…</p>}>
      <WinkProduct2026 slug={slug} />
    </Suspense>
  );
}
