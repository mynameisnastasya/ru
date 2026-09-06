import type { Metadata } from "next";
import WinkLanding2026 from "@/components/WinkLanding2026";

export const metadata: Metadata = { title: "FAQ — WINK", description: "Ответы про выбор, цифры, палитры, сюрприз, срочный заказ и доставку WINK." };
export default function Page(){ return <WinkLanding2026 mode="faq"/>; }
