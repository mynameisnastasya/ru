import type { Metadata } from "next";
import WinkCuratedRoute2026 from "@/components/WinkCuratedRoute2026";

export const metadata: Metadata = {
  title: "Любовь — WINK",
  description: "Романтические WINK-решения: сердца, композиции и личные слова без лишнего каталожного шума.",
};

export default function LovePage(){
  return <WinkCuratedRoute2026 mode="love"/>;
}
