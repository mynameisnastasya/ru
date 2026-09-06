import type { Metadata } from "next";
import WinkFavorites2026 from "@/components/WinkFavorites2026";

export const metadata: Metadata = {
  title: "Избранное — WINK",
  description: "Сохранённые композиции WINK на этом устройстве.",
};

export default function Page() {
  return <WinkFavorites2026 />;
}
