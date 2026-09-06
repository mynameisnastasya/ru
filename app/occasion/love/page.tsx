import type { Metadata } from "next";
import WinkRouteExperience from "@/components/WinkRouteExperience";

export const metadata: Metadata = { title: "Love — WINK", description: "Романтические подарки WINK: LOVE, HEARTS и MESSAGE без лишнего каталожного шума." };
export default function LovePage(){ return <WinkRouteExperience mode="love"/>; }
