import type { Metadata } from "next";
import WinkLanding2026 from "@/components/WinkLanding2026";

export const metadata: Metadata = { title: "Доставка и оплата — WINK", description: "Как WINK подтверждает дату, слот, адрес и финальную сумму заказа до оплаты." };
export default function Page(){ return <WinkLanding2026 mode="delivery"/>; }
