import type { Metadata } from "next";
import WinkCuratedRoute2026 from "@/components/WinkCuratedRoute2026";

export const metadata: Metadata = {
  title: "WOW — WINK",
  description:
    "Большие композиции из шаров WINK для особенных поздравлений. Подбор оформления комнаты в Кемерово.",
};

export default function WowPage() {
  return <WinkCuratedRoute2026 mode="wow" />;
}
