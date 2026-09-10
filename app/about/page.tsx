import type { Metadata } from "next";
import WinkLanding2026 from "@/components/WinkLanding2026";

export const metadata: Metadata = {
  title: "О WINK — красивое поздравление без сложного выбора",
  description:
    "WINK делает красивое поздравление простым: готовые решения, отобранные палитры, персонализация и согласованная доставка в Кемерово.",
};
export default function Page() {
  return <WinkLanding2026 mode="about" />;
}
