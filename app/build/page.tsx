import type { Metadata } from "next";
import WinkRouteExperience from "@/components/WinkRouteExperience";

export const metadata: Metadata = { title: "Build your gift — WINK", description: "Конструктор WINK показывает только производимо-валидные комбинации из актуальной матрицы." };
export default function BuildPage(){ return <WinkRouteExperience mode="build"/>; }
