import type { Metadata } from "next";
import WinkCuratedRoute2026 from "@/components/WinkCuratedRoute2026";

export const metadata: Metadata = {
  title: "День рождения — WINK",
  description: "Готовые WINK-решения на день рождения: цифры, композиции и личные детали без сложного выбора.",
};

export default function BirthdayPage(){
  return <WinkCuratedRoute2026 mode="birthday"/>;
}
