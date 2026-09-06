import type { Metadata } from "next";
import WinkLanding2026 from "@/components/WinkLanding2026";

export const metadata: Metadata = { title: "Корпоративным клиентам — WINK", description: "Регулярные поздравления сотрудников и клиентов, открытия и события в едином визуальном стандарте WINK." };
export default function Page(){ return <WinkLanding2026 mode="corporate"/>; }
