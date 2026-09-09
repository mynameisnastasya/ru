# WINK — premium gifting website

WINK is a gift-first ecommerce prototype for a premium balloon and gifting brand. The site is designed around the customer intent — “I need a beautiful gift” — rather than around balloon taxonomy.

## Core journey

`occasion → recipient → budget → curated gift → personalization → gift checkout`

## What is implemented

- full-screen editorial hero;
- interactive Gift Finder / digital concierge;
- curated bestseller grid;
- mood-based palette selection;
- interactive Build Your Gift configurator with live pricing;
- WOW gifting editorial section;
- visual “WINK moments” social-proof block;
- gift-first checkout drawer with recipient, anonymity, message and delivery fields;
- responsive mobile-first flow with a persistent celebration CTA;
- static export for GitHub Pages.

## Important launch note

The checkout UX is implemented, but real payment processing, delivery pricing and order delivery to CRM/Telegram are intentionally not faked. Those integrations require the actual provider/account details.

The current editorial photography uses Pexels-hosted launch placeholders. Replace them with final licensed WINK campaign/product photography before paid traffic at scale.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

GitHub Pages deploys the static export with the `/ru` base path through the existing workflow.

## Publication

Latest manual republish trigger: 2026-09-10.
