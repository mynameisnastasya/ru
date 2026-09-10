# WINK V6 — Gift choreography

## Product thesis
WINK is not a balloon catalogue. It is a gifting service for people who have a person, a reason and a deadline, but do not want to become experts in balloon combinations. The product promise is reduced uncertainty: four answers, up to two strong directions, one personal detail and a confirmed delivery moment.

## Art direction
The visual idea is the choreography of a gift: context → edit → personal detail → moment. The site should feel like a premium brand campaign wrapped around a very clear commerce flow.

The interface is nearly monochrome: near-white, ink black and one deep berry accent. Product photography carries the emotional colour. Large sans typography creates confidence; Cormorant Garamond italic is reserved for a few emotional turns rather than repeated as a generic luxury cue. IBM Plex Mono is limited to utility labels and system information.

No glassmorphism, noisy gradients, generic bento grids, ornamental 3D, fake social proof or decorative cards.

## Reference synthesis
Current Behance luxury/e-commerce work repeatedly combines campaign-scale imagery with quiet commerce UI rather than making every component expressive. Useful examples include ÉRRA Atelier, ReStory, Ophelia, Primally Pure, OROE, OlivAthos and Unusual. The shared mechanics used here are product-first imagery, editorial grid rhythm, oversized typography, asymmetry, restrained chrome and a frictionless path into product/checkout.

Codrops and scroll-craft are used as motion references only: scroll should reveal state and relationship. The implementation stays on Motion already present in the codebase; no GSAP, Theatre.js, Three.js or WebGL is added because the product does not need their weight to explain the experience.

## Page architecture
1. Brand/object hero: the product sits inside the oversized WINK wordmark, while the offer remains immediately actionable.
2. Positioning: WINK does not sell more choice; it takes choice off the customer.
3. Sticky gift choreography: four meaningful stages with product imagery changing as the narrative progresses.
4. WINK MATCH: the primary conversion tool, four questions, up to two recommendations.
5. Curated edit: one dominant product and two supporting scenarios instead of a product wall.
6. Personalization: one precise detail on top of a designer-made base.
7. Checkout certainty: composition, price, delivery and surprise conditions are clear before payment.
8. FAQ and image-led close.

## Motion language
Motion is concentrated in hero depth, the sticky choreography scene, product image hover, MATCH state changes and one personalization parallax. No section gets animation merely to look animated.

Reduced-motion removes scroll choreography and long transitions. Mobile collapses the desktop sticky story into a short readable sequence rather than reproducing a desktop pinning experience.

## Conversion and measurement
Primary action: start WINK MATCH. Secondary: open a ready-made composition. All finder-entry buttons use an explicit `data-wink-finder-open` analytics hook so the main funnel can be measured independently of CSS class names.

## Final release audit
The actual GitHub Pages artifact was inspected after the mandatory second design pass at 1440×900, 834×1112 and 390×844.

- Document scroll width equals viewport width at all three sizes.
- Mobile homepage intentionally removes the duplicate fixed bottom navigation while internal routes keep it.
- Hero headline, offer and CTA remain within their layout bounds; low-height desktop has a compact hero treatment.
- Sticky story uses a separate non-pinned mobile sequence and collapses to normal flow under `prefers-reduced-motion`.
- Reduced-motion audit reports no CSS animations and `scroll-behavior: auto`.
- WINK MATCH fits all audited viewports and retains the existing ranking logic.
- Product edit was rebuilt in the second pass to remove accidental dead space: one dominant product plus two supporting objects.
- Repeated italic-serif treatment was reduced so it remains an accent rather than a template-like luxury device.
- Checkout and internal shell were checked for document-level horizontal overflow at desktop and mobile widths.
- No temporary generated-image URLs, new animation frameworks or QA-only runtime code are included in the release.

## Release rule
Merge only after lint, TypeScript, domain tests and production static build are green on the final head, and the final Pages artifact has passed desktop/tablet/mobile visual review.