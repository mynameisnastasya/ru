import type { Metadata } from "next";
import WinkRouteExperience from "@/components/WinkRouteExperience";

export const metadata: Metadata = { title: "Shop — WINK", description: "Все актуальные композиции WINK: AIR, BIRTHDAY, LOVE, HEARTS, MESSAGE и BABY REVEAL." };
export default function ShopPage(){ return <WinkRouteExperience mode="shop"/>; }
