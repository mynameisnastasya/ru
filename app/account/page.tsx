import type { Metadata } from "next";
import WinkDates2026 from "@/components/WinkDates2026";

export const metadata: Metadata = {
  title: "Важные даты — WINK",
  description: "Сохраните важные даты на этом устройстве, чтобы не держать все поводы в голове.",
};

export default function AccountPage() {
  return <WinkDates2026 />;
}
