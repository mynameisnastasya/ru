import type { Metadata } from "next";
import WinkOrderStatus from "@/components/WinkOrderStatus";

export const metadata: Metadata = {
  title: "Статус заказа — WINK",
  robots: { index: false, follow: false },
};

export default function OrderStatusPage() {
  return <WinkOrderStatus />;
}
