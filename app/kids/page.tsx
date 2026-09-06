import type { Metadata } from "next";
import WinkCuratedRoute2026 from "@/components/WinkCuratedRoute2026";

export const metadata: Metadata = {
  title: "Детям — WINK",
  description: "Детские WINK-композиции: возраст, мягкие палитры и готовые решения без визуального шума.",
};

export default function KidsPage(){
  return <WinkCuratedRoute2026 mode="kids"/>;
}
