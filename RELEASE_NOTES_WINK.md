# WINK storefront refinement — 7 September 2026

## Product and design

The site now uses a shared milk/blush/graphite visual system, one navigation,
responsive cards and clearer Russian copy. The hero keeps the main gift central;
toys do not replace balloons as the first-screen proposition. Product choice,
palette, personalization, cart and checkout use shared pricing and validation.

The latest audience research reinforces a short decision path: WINK MATCH
returns up to two compositions, while add-on recommendations remain limited to
three on product pages and two in cart. Core entry points stay AIR, BIRTHDAY and
MESSAGE. Prices are visible; delivery is explicitly confirmed rather than
promised before a real slot/tariff check. No fabricated reviews, order counts,
discounts or delivery guarantees were added.

Three original optimized mood illustrations replace inconsistent external
images. They are labeled as visualizations, not customer work or exact SKU
photographs. They must be replaced/supplemented with real product proof at launch.

## Included source changes

- Main page, catalog filters, product configurator and size-change draft retention.
- Shared favorites/search/cart, cross-tab updates and safe browser-storage errors.
- Checkout validation, price recheck, idempotent retry and confirmed-receipt handling.
- Public order tracking, important dates, consistent editorial routes and navigation.
- WINK_PRICE_v6_2026 prices and database migration; no palette surcharge.
- Universal add-on engine, gifts page, quick view, separate cart lines, bundle replacement.
- Catalog admin, manual ordering, supplier fields, owner-only finance and cost history.
- SQL reservations and server hooks, immutable snapshots, operational list and analytics.

## Release boundary

Temporary demo mode is now enabled by default for review without the missing
API. See `DEMO_MODE.md`: synthetic add-ons, isolated local cart, and explicitly
unsent checkout confirmation. No payments, inventory writes, notifications or
commerce analytics occur in this storefront mode. The live-release gate below
still applies when building with `NEXT_PUBLIC_WINK_DEMO=false`.

This branch is a reviewable implementation, **not an already deployed release**.
The original running API source is missing from GitHub. Do not merge the static
front end independently of the v6 migration and API integration. The extension
is intentionally gated off until those hooks are installed and sandbox-tested.
All unconfirmed toys and bundles are drafts. Detailed integration and test
evidence are in `backend/addons/README.md`.

## Validation

- 60 unit tests passed.
- Production static export passed: 39 pages, GitHub Pages `/ru` base path.
- PostgreSQL migration and stock scenarios passed on an isolated branch.
- Main mobile flow was inspected at 320/390 px; final add-on interaction QA
  remains unchecked because browser execution was blocked by the environment.
