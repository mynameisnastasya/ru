import type { Metadata } from "next";
import WinkSearch2026 from "@/components/WinkSearch2026";

export const metadata: Metadata = {
  title: "Поиск — WINK",
  description: "Поиск красивых поздравлений WINK по человеку, формату, бюджету и поводу.",
};

export default function Page() {
  return <WinkSearch2026 />;
}
