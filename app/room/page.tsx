import type { Metadata } from "next";
import WinkLanding2026 from "@/components/WinkLanding2026";

export const metadata: Metadata = { title: "Оформление комнаты — WINK", description: "Акцент, Комната или Вау: оформление пространства из производимых WINK-композиций без выдуманных пакетов." };
export default function Page(){ return <WinkLanding2026 mode="room"/>; }
