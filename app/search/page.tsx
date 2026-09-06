import type { Metadata } from "next";
import WinkUtility2026 from "@/components/WinkUtility2026";

export const metadata: Metadata = { title: "Поиск — WINK", description: "Поиск красивых поздравлений WINK по человеку, формату, бюджету и поводу." };
export default function Page(){ return <WinkUtility2026 mode="search"/>; }
