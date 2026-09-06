import type { Metadata } from "next";
import WinkCuratedRoute2026 from "@/components/WinkCuratedRoute2026";

export const metadata: Metadata = {
  title: "WOW — WINK",
  description: "Большие WINK-композиции и сценарии оформления комнаты без выдуманных SKU и ложной доступности.",
};

export default function WowPage(){
  return <WinkCuratedRoute2026 mode="wow"/>;
}
