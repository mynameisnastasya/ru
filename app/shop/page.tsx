import type { Metadata } from "next";
import WinkCatalog2026 from "@/components/WinkCatalog2026";

export const metadata: Metadata = {
  title: "Каталог — WINK",
  description: "Выберите красивое: curated-каталог WINK по человеку, поводу, формату, палитре и бюджету.",
};

export default function ShopPage(){
  return <WinkCatalog2026 />;
}
