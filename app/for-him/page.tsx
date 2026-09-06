import type { Metadata } from "next";
import WinkLanding2026 from "@/components/WinkLanding2026";

export const metadata: Metadata = { title: "Для него — WINK", description: "Спокойные палитры, чистые формы и красивые поздравления для него без лишнего декора." };
export default function Page(){ return <WinkLanding2026 mode="for-him"/>; }
