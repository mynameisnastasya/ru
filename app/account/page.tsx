import type { Metadata } from "next";
import WinkUtility2026 from "@/components/WinkUtility2026";

export const metadata: Metadata = { title: "Личный WINK", description: "Заказы, избранное, важные люди и даты для повторных красивых поздравлений." };
export default function Page(){ return <WinkUtility2026 mode="account"/>; }
