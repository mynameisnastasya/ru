import type { Metadata } from "next";
import WinkCheckout2026 from "@/components/WinkCheckout2026";

export const metadata: Metadata = {
  title: "Оформление — WINK",
  description: "Оформление подарка WINK: получатель, сюрприз, доставка и контакт покупателя без лишних шагов.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <WinkCheckout2026 />;
}
