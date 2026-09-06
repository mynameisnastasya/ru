import type { Metadata } from "next";
import WinkLanding2026 from "@/components/WinkLanding2026";

export const metadata: Metadata = { title: "Подарки — WINK", description: "WINK Gifts: открытки, фотографии, цветы и будущие подарочные категории вокруг красивого момента." };
export default function Page(){ return <WinkLanding2026 mode="gifts"/>; }
