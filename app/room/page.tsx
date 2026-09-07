import type { Metadata } from "next";
import WinkLanding2026 from "@/components/WinkLanding2026";

export const metadata: Metadata = {
  title: "Оформление комнаты — WINK",
  description:
    "Оформление комнаты к празднику в Кемерово. Подберём композиции, палитру и масштаб под ваше пространство и бюджет.",
};
export default function Page() {
  return <WinkLanding2026 mode="room" />;
}
