import type { Metadata } from "next";
import WinkRouteExperience from "@/components/WinkRouteExperience";

export const metadata: Metadata = { title: "Birthday — WINK", description: "Подарки WINK на день рождения: точные цифры, палитры и производимо-валидные композиции." };
export default function BirthdayPage(){ return <WinkRouteExperience mode="birthday"/>; }
