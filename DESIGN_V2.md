# WINK V2 — product, UX and art-direction brief

This document records the decisions behind the second public-site system so the design does not drift back into a generic landing page.

## 1. Product audit

### What WINK sells
WINK is not positioned as a technical balloon catalogue. It is a local occasion-gifting service that turns a person + occasion + space + budget + desired effect into a small number of visually controlled solutions.

### Primary audience
- women who want a beautiful result without assembling it themselves;
- men who want confidence and delegation rather than a long catalogue;
- parents who need a predictable, on-time visual moment;
- remote gifters who cannot personally inspect the order;
- higher-budget buyers who want to transform a room, not simply add more balloons.

### Primary job-to-be-done
An important occasion has a deadline. The customer wants a beautiful and appropriate solution they can trust, without spending time on design decisions or risking a visibly weak result.

### Primary conversion
Complete WINK MATCH or choose a ready solution, personalize it, and submit an order request.

### Secondary conversions
- browse ready solutions;
- save a solution;
- inspect delivery/payment terms;
- contact WINK for help;
- return through important-date memory/CRM routes.

### Main current risks
- category language can collapse the brand back into “a balloon shop”;
- too much catalogue choice transfers professional design work back to the customer;
- new-brand trust cannot be solved with invented testimonials;
- date/delivery ambiguity is emotionally expensive because the occasion cannot move;
- an art-directed site can become an attraction if motion does not serve the decision flow.

### What is preserved
The V2 redesign intentionally preserves the existing catalogue domain model, prices, product-personalization rules, cart, idempotency, checkout validation, demo/live separation, add-ons, delivery intent, analytics hooks, favorites and order status flows.

## 2. New public funnel

1. **Immediate promise** — beautiful congratulations without learning the product category.
2. **Problem/context** — important person + occasion + deadline + fear of choosing badly.
3. **Decision relief** — WINK takes professional choice inside the brand.
4. **WINK MATCH** — four customer answers become up to two recommendations.
5. **Curated product edit** — a small set of ready scenarios for users who already know the occasion.
6. **Taste authority** — explain scale, restraint and palette rather than claiming “premium”.
7. **Personalization** — make the ready format personal without reopening a giant design process.
8. **Operational proof** — request → check → confirm → deliver; no false real-time promises.
9. **Objection handling** — pricing, surprise delivery, date confirmation, help choosing.
10. **Final CTA** — not knowing what to choose is explicitly framed as the intended entry point.

## 3. Reference matrix

| Role | Reference | What is used | Where it appears |
|---|---|---|---|
| Main art direction | Refero Styles — General Intelligence Company | warm parchment, literary serif, quiet sans, hairline structure, atmospheric photography, small radii, restrained UI | global V2 design floor |
| Layout / composition | SiteInspire editorial/e-commerce references | asymmetric editorial rhythm, photography as content rather than card decoration | context, curated edit, taste section |
| Layout / composition | Hoverstat.es — Ballet National de Marseille examples | large type, sticky/layered homepage choreography | WINK MATCH and long-form section pacing |
| Layout / composition | Codrops Webzibition / Creative Hub | staged image movement, perspective and scroll-linked composition changes | context image, personalization image, closing scene |
| Typography | Refero GIC + Typewolf / Fonts In Use editorial references | display serif + disciplined sans + mono metadata, narrow measure and strong scale contrast | headlines, product names, microcopy |
| Motion language | scroll-craft + Motion scroll docs | scroll as timeline, sticky chapters, progressive disclosure, transform-led movement, device-family adaptation | homepage choreography |
| Mobile behavior | GoodUI mobile sticky CTA patterns + product-flow references from Mobbin | preserve the next action near the thumb, remove desktop pinning when it hurts comprehension | product page, checkout, WINK MATCH |
| UX / conversion | WINK audience research + GoodUI multi-step checkout patterns | reduce decision load; staged questions; explicit reassurance before commitment | MATCH, checkout, delivery proof |
| Product interaction | WINK MATCH + Mobbin/Page Flows flow discipline | short question sequence, clear progress, one decision per state | finder |
| Technical implementation | Motion `useScroll`/`useTransform`; scroll-craft validation principles | composited transforms, reduced-motion, responsive states, screenshot QA | implementation + QA |

The references are mechanics, not skins. No complete external site or component is copied.

## 4. Design system

### Type
- Display / editorial: Palatino-family system serif fallback for reliable Cyrillic coverage in the current static stack.
- UI/body: Inter, already shipped locally and used for Cyrillic.
- Metadata: IBM Plex Mono, locally shipped.

Scale is fluid with `clamp()` and deliberately larger in editorial scenes than in commerce controls.

### Colour
- Canvas: `#fbfaf5`
- Paper: `#fffefb`
- Linen surface: `#f2f0e9`
- Ink: `#1c1b18`
- Graphite: `#37342f`
- Muted: `#716c63`
- Hairline: `#d9d5ca`
- Dark chapter: `#1b1a18`

Product palette colour appears where it is meaningful: photography and swatches. Decorative gradients are not the UI language.

### Shape and elevation
- 4–10px radii for controls/media;
- hairline borders;
- no decorative glass cards;
- no default shadow stack; shadows only where a modal or mobile sticky action needs separation.

### Grid and spacing
- content max width: 1320px;
- desktop gutter: fluid up to 68px;
- major section rhythm: roughly 96–190px depending on scene;
- asymmetry is used at page-composition level, not as random card offsets.

### Buttons and inputs
- rectangular/small-radius buttons;
- minimum 48–52px action height;
- strong focus-visible outline;
- inputs use paper surfaces and explicit border change on focus;
- selected chips switch to ink/white rather than relying on a subtle tint.

### Motion character
- patient transform-led movement;
- one strong movement idea per scene;
- no continuous WebGL loop;
- no Theatre.js/Three.js/GSAP dependency unless a later scene demonstrably requires it;
- `prefers-reduced-motion` removes choreography without hiding content.

## 5. Mobile rules

Mobile is not a scaled desktop:
- hero becomes image-first then promise/CTA;
- desktop sticky WINK MATCH becomes a normal sequential chamber;
- sticky editorial images become inline images;
- asymmetric product edit resolves to a simple one/two-column sequence;
- product add-to-cart stays above the bottom nav;
- checkout submit remains reachable without scrolling back through the form;
- large pinned sections are removed when they create dead scroll.

## 6. Social proof policy

The repository currently contains no verified customer reviews/ratings suitable for public presentation. V2 must not invent them. Trust is therefore built with:
- exact product/pricing rules;
- transparent request/confirmation sequence;
- clear delivery status language;
- real product composition data;
- future real UGC/reviews when available.

## 7. QA gate

The PR is not merge-ready until all of the following are complete:
- lint;
- TypeScript;
- domain tests;
- static production build;
- desktop render review;
- tablet render review;
- mobile render review;
- horizontal-overflow scan;
- reduced-motion scan;
- key route scan: home → MATCH/catalogue → product → checkout;
- second art-direction iteration based on the rendered artifact;
- final Pages deployment verification after merge.
