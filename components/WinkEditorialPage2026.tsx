"use client";
import Link from "next/link";
import Image from "next/image";
import WinkPageFrame2026 from "./WinkPageFrame2026";
type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  blocks?: { title: string; text: string }[];
  cards?: {
    kicker?: string;
    title: string;
    text: string;
    href: string;
    cta: string;
  }[];
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  note?: string;
};
export default function WinkEditorialPage2026({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  blocks = [],
  cards = [],
  primary,
  secondary,
  note,
}: Props) {
  return (
    <WinkPageFrame2026>
      <main>
        <section className="wk-editorial-hero">
          <div>
            <p className="wk-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{intro}</p>
            <div className="wk-actions">
              {primary && (
                <Link className="wk-button" href={primary.href}>
                  {primary.label}
                </Link>
              )}
              {secondary && (
                <Link className="wk-text-link" href={secondary.href}>
                  {secondary.label} →
                </Link>
              )}
            </div>
          </div>
          <figure>
            <Image
              src={image}
              alt={imageAlt}
              width={1024}
              height={1280}
              unoptimized
              priority
              sizes="(max-width: 700px) 100vw, 50vw"
            />
            <figcaption>Визуализация WINK</figcaption>
          </figure>
        </section>
        {blocks.length > 0 && (
          <section className="wk-section">
            <div className="wk-info-grid">
              {blocks.map((b, i) => (
                <article key={b.title}>
                  <span className="wk-eyebrow">0{i + 1}</span>
                  <h2>{b.title}</h2>
                  <p>{b.text}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        {cards.length > 0 && (
          <section className="wk-section wk-info-cards">
            {cards.map((c) => (
              <Link href={c.href} key={c.title}>
                <p className="wk-eyebrow">{c.kicker || "WINK"}</p>
                <h2>{c.title}</h2>
                <p>{c.text}</p>
                <span>{c.cta} →</span>
              </Link>
            ))}
          </section>
        )}
        {note && (
          <section className="wk-section wk-editorial-note">
            <p>{note}</p>
          </section>
        )}
      </main>
    </WinkPageFrame2026>
  );
}
