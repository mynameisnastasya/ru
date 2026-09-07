import type { Metadata } from "next";
import WinkGifts2026 from "@/components/WinkGifts2026";

export const metadata: Metadata = {
  title: "Подарки — WINK",
  description:
    "Личные детали для поздравления: надпись на шаре, текст открытки и банты для композиций WINK.",
};
export default function Page() {
  return <WinkGifts2026 />;
}
