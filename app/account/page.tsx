import type { Metadata } from "next";
import WinkUtility2026 from "@/components/WinkUtility2026";

export const metadata: Metadata = {
  title: "Личный WINK",
  description: "Прототип будущего клиентского кабинета WINK.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <WinkUtility2026 mode="account" />;
}
