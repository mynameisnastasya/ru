import type { Metadata } from "next";
import WinkLanding2026 from "@/components/WinkLanding2026";

export const metadata: Metadata = { title: "Для неё — WINK", description: "Красивые поздравления для девушки, подруги и мамы. Несколько сильных решений вместо бесконечного каталога." };
export default function Page(){ return <WinkLanding2026 mode="for-her"/>; }
