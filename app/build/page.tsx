import type { Metadata } from "next";
import WinkCuratedRoute2026 from "@/components/WinkCuratedRoute2026";

export const metadata: Metadata = {
  title: "Собрать свой — WINK",
  description: "Короткий конструктор WINK: формат, масштаб и личная деталь — только из реально производимых сочетаний.",
};

export default function BuildPage(){
  return <WinkCuratedRoute2026 mode="build"/>;
}
