import type { Metadata } from "next";
import { Suspense } from "react";
import WinkCatalog2026 from "@/components/WinkCatalog2026";

export const metadata: Metadata = {
  title: "Каталог — WINK",
  description:
    "Композиции из шаров в Кемерово. Выберите набор по формату, палитре и бюджету, добавьте цифры или личную надпись.",
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={<p style={{ padding: 40 }}>Открываем композиции WINK…</p>}
    >
      <WinkCatalog2026 />
    </Suspense>
  );
}
