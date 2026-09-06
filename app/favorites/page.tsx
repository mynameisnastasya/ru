import type { Metadata } from "next";
import WinkUtility2026 from "@/components/WinkUtility2026";

export const metadata: Metadata = { title: "Избранное — WINK", description: "Сохранённые композиции WINK." };
export default function Page(){ return <WinkUtility2026 mode="favorites"/>; }
