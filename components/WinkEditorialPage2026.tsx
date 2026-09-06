"use client";

import Link from "next/link";
import WinkPageFrame2026 from "@/components/WinkPageFrame2026";

type EditorialBlock = { title: string; text: string };
type EditorialCard = { kicker?: string; title: string; text: string; href: string; cta: string };

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  blocks?: EditorialBlock[];
  cards?: EditorialCard[];
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  note?: string;
};

export default function WinkEditorialPage2026({ eyebrow, title, intro, image, imageAlt, blocks = [], cards = [], primary, secondary, note }: Props) {
  return <WinkPageFrame2026>
    <main className="wed26">
      <section className="wed26-hero">
        <div className="wed26-copy"><p>{eyebrow}</p><h1>{title}</h1><div className="wed26-intro">{intro}</div><div className="wed26-actions">{primary && <Link href={primary.href} className="wed26-primary">{primary.label}</Link>}{secondary && <Link href={secondary.href} className="wed26-secondary">{secondary.label}</Link>}</div></div>
        <div className="wed26-image"><img src={image} alt={imageAlt}/></div>
      </section>

      {blocks.length > 0 && <section className="wed26-principles">{blocks.map((block, index) => <article key={block.title}><span>0{index + 1}</span><h2>{block.title}</h2><p>{block.text}</p></article>)}</section>}

      {cards.length > 0 && <section className="wed26-cardSection"><div className="wed26-sectionHead"><p>WINK edit</p><h2>Не всё подряд.<br/><em>Только понятные решения.</em></h2></div><div className="wed26-cards">{cards.map((card) => <Link href={card.href} className="wed26-card" key={`${card.href}-${card.title}`}><div><small>{card.kicker || "WINK"}</small><h3>{card.title}</h3><p>{card.text}</p></div><span>{card.cta} →</span></Link>)}</div></section>}

      {note && <section className="wed26-note"><span>WINK / важно</span><p>{note}</p></section>}
    </main>
    <style jsx global>{`
      .wed26{--ink:#242222;--milk:#f7f3ee;--white:#fffdfc;--blush:#e5c8ce;--cocoa:#5a403e;--line:rgba(36,34,34,.13);background:var(--milk);color:var(--ink)}
      .wed26-hero{min-height:720px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);border-bottom:1px solid var(--line)}
      .wed26-copy{display:flex;flex-direction:column;justify-content:center;padding:100px max(48px,calc((100vw - 1400px)/2)) 90px max(48px,calc((100vw - 1400px)/2));padding-right:7vw}
      .wed26-copy>p,.wed26-sectionHead>p{margin:0 0 22px;font:500 10px/1 Inter,Arial,sans-serif;text-transform:uppercase;letter-spacing:.16em;color:#81756f}
      .wed26-copy h1{margin:0;font:400 clamp(58px,7vw,112px)/.88 "Instrument Serif",Georgia,serif;letter-spacing:-.055em;max-width:780px}
      .wed26-intro{font-size:18px;line-height:1.55;max-width:620px;margin-top:32px;color:#605855}
      .wed26-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:34px}
      .wed26-primary,.wed26-secondary{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 20px;border-radius:999px;text-decoration:none;font-size:12px}
      .wed26-primary{background:var(--ink);color:white!important}.wed26-secondary{border:1px solid rgba(36,34,34,.28);color:var(--ink)!important}
      .wed26-image{min-height:720px;overflow:hidden;background:#d8cbc4}.wed26-image img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.88)}
      .wed26-principles{padding:90px max(48px,calc((100vw - 1400px)/2));display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--line)}
      .wed26-principles article{background:var(--milk);padding:32px 30px;min-height:270px}.wed26-principles span{font-size:10px;color:#93847e;letter-spacing:.1em}.wed26-principles h2{font:400 34px/1 "Instrument Serif",Georgia,serif;letter-spacing:-.035em;margin:45px 0 14px}.wed26-principles p{font-size:13px;line-height:1.65;color:#6b625e;margin:0}
      .wed26-cardSection{padding:105px max(48px,calc((100vw - 1400px)/2))}.wed26-sectionHead{display:flex;justify-content:space-between;align-items:flex-end;gap:40px;margin-bottom:40px}.wed26-sectionHead h2{font:400 clamp(42px,5vw,72px)/.95 "Instrument Serif",Georgia,serif;letter-spacing:-.045em;margin:0}.wed26-sectionHead em{font-weight:400;color:#8d6a70}.wed26-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.wed26-card{min-height:320px;background:var(--white);border:1px solid var(--line);padding:30px;display:flex;flex-direction:column;justify-content:space-between;color:inherit!important;text-decoration:none;transition:transform .2s ease,background .2s ease}.wed26-card:hover{transform:translateY(-2px);background:#fff}.wed26-card small{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:#8a7e78}.wed26-card h3{font:400 42px/1 "Instrument Serif",Georgia,serif;letter-spacing:-.04em;margin:45px 0 14px}.wed26-card p{max-width:520px;margin:0;font-size:13px;line-height:1.6;color:#6b625e}.wed26-card>span{font-size:12px;margin-top:28px}
      .wed26-note{margin:0 max(48px,calc((100vw - 1400px)/2)) 110px;padding:34px;border:1px solid var(--line);background:#efe5e3;display:grid;grid-template-columns:180px 1fr;gap:30px}.wed26-note span{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:#836f6c}.wed26-note p{font:400 28px/1.18 "Instrument Serif",Georgia,serif;letter-spacing:-.025em;margin:0;max-width:900px}
      @media(max-width:900px){.wed26-hero{grid-template-columns:1fr;min-height:0}.wed26-copy{padding:74px 18px 48px}.wed26-copy h1{font-size:58px}.wed26-intro{font-size:16px}.wed26-image{min-height:500px}.wed26-principles{padding:54px 18px;grid-template-columns:1fr 1fr}.wed26-cardSection{padding:72px 18px}.wed26-cards{grid-template-columns:1fr}.wed26-card{min-height:270px}.wed26-note{margin:0 18px 72px;grid-template-columns:1fr}.wed26-sectionHead{display:block}.wed26-sectionHead>p{margin-bottom:14px}}
      @media(max-width:560px){.wed26-principles{grid-template-columns:1fr}.wed26-image{min-height:420px}.wed26-card h3{font-size:36px}.wed26-note p{font-size:24px}}
    `}</style>
  </WinkPageFrame2026>;
}
