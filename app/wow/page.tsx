import type { Metadata } from "next";
import WinkRouteExperience from "@/components/WinkRouteExperience";

export const metadata: Metadata = { title: "WOW — WINK", description: "Большие композиции и ROOM-сценарии WINK без выдуманных SKU." };
export default function WowPage(){ return <WinkRouteExperience mode="wow"/>; }
