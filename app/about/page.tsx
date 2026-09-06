import type { Metadata } from "next";
import WinkLanding2026 from "@/components/WinkLanding2026";

export const metadata: Metadata = { title: "О WINK", description: "WINK — современный бренд красивых поздравлений. Меньше выбора, больше вкуса и меньше хлопот." };
export default function Page(){ return <WinkLanding2026 mode="about"/>; }
