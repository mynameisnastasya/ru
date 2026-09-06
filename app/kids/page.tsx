import type { Metadata } from "next";
import WinkRouteExperience from "@/components/WinkRouteExperience";

export const metadata: Metadata = { title: "Kids — WINK", description: "Детские подарочные композиции WINK из актуальной производственной матрицы." };
export default function KidsPage(){ return <WinkRouteExperience mode="kids"/>; }
