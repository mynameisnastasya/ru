# GuruDreads — editorial concept site

A responsive one-page concept for GuruDreads, built around the visual language in the supplied Instagram references: loose-end dread extensions, tonal ombré work, raw wood, dried botanicals, linen and earthy neutrals.

**Live:** https://mynameisnastasya.github.io/ru/

## Release direction

- Premium editorial art direction rather than generic hair-store UI
- Signature focus on loose ends, movement and dimensional colour
- Interactive custom-order brief builder with copy-to-clipboard flow
- English / Russian interface with remembered language preference
- Keyboard-friendly mobile navigation, focus states and reduced-motion support
- SEO/social metadata, canonical URL and structured data
- First-party local image assets; no dependency on third-party image hosts
- Lightweight vanilla HTML/CSS/JS with no framework runtime

## QA

Release layout and interactions were checked at 1440×900, 834×1112, 390×844 and 320×700. The audited build has no document-level horizontal overflow at those viewports, and the custom-order flow, language switcher and mobile menu were exercised before release.

The production entry point is `index.html`. GitHub Pages deployment is handled by `.github/workflows/pages.yml`.
