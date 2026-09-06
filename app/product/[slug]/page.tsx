import type { Metadata } from "next";
import WinkRouteExperience from "@/components/WinkRouteExperience";

const SLUGS = ["air16","air30","birthday16-1","birthday16-2","birthday30-1","birthday30-2","love16","love30","hearts7","hearts14","message16","message30","baby-reveal-solo","baby-reveal16"];
const TITLES: Record<string,string> = { air16:"AIR 16",air30:"AIR 30","birthday16-1":"BIRTHDAY 16 + 1","birthday16-2":"BIRTHDAY 16 + 2","birthday30-1":"BIRTHDAY 30 + 1","birthday30-2":"BIRTHDAY 30 + 2",love16:"LOVE 16",love30:"LOVE 30",hearts7:"HEARTS 7",hearts14:"HEARTS 14",message16:"MESSAGE 16",message30:"MESSAGE 30","baby-reveal-solo":"BABY REVEAL","baby-reveal16":"BABY REVEAL 16" };

export function generateStaticParams(){ return SLUGS.map((slug)=>({slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{ const {slug}=await params; const title=TITLES[slug]||"WINK gift"; return { title:`${title} — WINK`, description:`${title}: палитра и персонализация с серверной валидацией WINK.` }; }
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){ const {slug}=await params; return <WinkRouteExperience mode="product" slug={slug}/>; }
