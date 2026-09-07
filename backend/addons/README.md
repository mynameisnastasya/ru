# WINK ADD-ONS — integration and release gate

## Current status

The storefront, cart, catalog editor and extension source are in this branch.
SQL was tested against an isolated copy of the existing WINK PostgreSQL schema,
not production. The deployed `winkapi` source is **not in this repository**;
therefore this extension is not mounted in the live API and add-on sales remain
disabled. Do not describe this branch as an operational payment/CRM launch.

The existing main-product ordering contract is retained. Checkout refuses a
legacy price list instead of submitting the uploaded v6 prices to a v4 backend.
Deploy the v6 data migration together with the storefront, not afterwards.

## Files and boundaries

- `lib/wink-addons.ts`: public DTO, compatibility, manual-first recommendations,
  bundle availability, personalization, delivery requirements, search.
- `lib/wink-addon-cart.ts`: separate cart lines, bundle replacement and quantity checks.
- `components/WinkAddons.tsx`: inline cards, quick view, confirmation and analytics.
- `components/WinkAddonAdmin.tsx`: authenticated catalog editor and ordered recommendations.
- `catalog.ts`: explicit public projection, validation and transactional catalog saves.
- `api.ts`: public/admin endpoints; existing JWT verification and rate limiter are dependencies.
- `orders.ts`: immutable item snapshots, reserve/consume/release/refund/cancellation hooks,
  plain-text assembly/Telegram formatter.
- `../migrations/006_addons.sql`: catalog, private finance, stock and reservation functions.
- `../migrations/007_prices_v6.sql`: Direct prices, no palette surcharge, bows 500/800 ₽.
- `../migrations/008_addon_operations.sql`: private supplier/logistics/safety metadata.
- `seeds.sql`: six toys, five bundles and a 300 ₽ personal card; **all DRAFT**.

Money is integer kopecks. Public data never includes cost, supplier prices or
gross margin. Finance and cost history have separate tables, not extra public
order-item columns. All new tables have RLS enabled with no public policies;
only the trusted backend connection may access them. Staff JWT validation must
resolve a currently active staff role server-side, not accept a browser role.

## Mounting in the existing runtime

1. Recover and version the source of the existing `winkapi` deployment.
2. Apply migrations 006, 007, 008 and seeds on a development branch. Each file
   uses `-- @statement` boundaries for a transactional migration runner. Record
   successful migration IDs; 006/008 must not be applied twice.
3. Mount `handleAddonRequest(request, dependencies)` before the existing router.
   A `null` result delegates to the existing router. Preserve its approved-origin
   CORS and OPTIONS handling. Supply its existing `verifyStaff` and rate limiter.
4. Implement `transaction(work)` using one checked-out `pg` connection:
   BEGIN → work(client) → COMMIT; on error ROLLBACK; finally release. Never pass
   `pool.query` as a transactional client. Use READ COMMITTED, short lock and
   statement timeouts; retry deadlocks/serialization failures with bounded retries.
5. Extend `/api/orders`' item discriminator: existing items have `productId`,
   add-ons have `addon_id`, `quantity`, `purchase_context`, `main_slug`,
   `personalization`. Reject unknown fields that affect price/authorization.
6. In the **existing order transaction**, after validating customer, recipient,
   main SKUs and delivery, call `snapshotAddons`. Its subtotal belongs in the
   same order subtotal/total. Pass authoritative main SKU, category, palette,
   quantity and price, not browser values. Return the complete recalculated
   summary before requesting payment. Reuse the existing idempotency key and
   fingerprint protection; snapshot functions must run once per order.
7. In the payment-session transaction, call `reserveForPayment`. A browser cart
   and a draft order reserve nothing. A retry of an active hold does not extend
   its 15-minute expiry. Oversized deliveries require a configured valid tariff;
   never substitute zero or a standard tariff. Delivery before production is rejected.
8. Keep existing provider signature, amount, currency and event-ID verification.
   Call `consumePaidAddons` in the same transaction that marks payment PAID and
   appends the existing outbox event. Duplicate callbacks cannot decrement twice.
   On failure/expiration, call `releasePayment`.
9. Late provider success after expiry is **not** permission to oversell. If
   `addon_reservation_expired` occurs, persist the verified provider event in a
   reconciliation path and void/refund or obtain a replacement agreement. Do not
   discard the paid event or tell the customer the payment failed. If the provider
   supports authorization/capture, validate the active hold before capture.
10. The existing outbox worker must read all order items, including bundles and
    personalization. Use `addonPackingLines` in its normal message formatter;
    omit Telegram `parse_mode` for untrusted text. Retain message deduplication
    and retries. No test Telegram messages were sent in this task.
11. On cancellation, identify physically unused lines before calling
    `restockCanceledAddons`. Non-returnable personalized lines stay off stock.
    For a verified partial provider refund, call `recordAddonRefund`. Monetary
    refund and physical restocking are separate decisions; restocking is capped
    at purchased quantity. A refund must not cancel unrelated main items.
12. After sandbox end-to-end verification, set `checkoutEnabled: true`.

## Recommendation rules

Manual lists are directional, ordered and authoritative. An explicitly saved
empty list disables recommendations for that composition. Unavailable/manual
incompatible positions can be replaced by compatible automatic candidates;
deliberately short lists stay short. Product cards show at most three; cart at
most two. Auto scores: palette 30, occasion 25, category 20, audience 10,
budget 10, bestseller 5. Unknown context cannot satisfy a restrictive rule.

The existing composition names are AIR/BIRTHDAY/LOVE/HEARTS/MESSAGE/BABY REVEAL,
not the illustrative ROOM CLOUD names in the brief. Configure relationships to
real slugs. Occasion and audience targeting require those values to be carried
from MATCH to the authoritative order context; do not invent them from gender.

Bundles are composed of leaf products, not nested bundles. Required component
personalization must also exist on the bundle using the same field key (e.g.
`message` or `name`); the bundle controls its displayed personalization surcharge.
This avoids charging the same personalization twice. Conflicting field names
across components require separate bundle configuration before publication.

## Evidence and remaining acceptance checks

Passed locally: TypeScript and 60 unit tests covering prices, cart integrity,
manual priority, unavailable replacement, limits, bundle quantities, duplicates,
personalization, snapshots, shipping and public/financial access separation.

Passed on isolated Neon branch `codex/wink-addons-v6`
(`br-dark-pine-aycsz76h`, project `misty-waterfall-64903953`):

- additive migrations and draft seeds against the existing schema;
- reserve/retry, expiry/release, two-component deduction and duplicate callback;
- old order name/price survives catalog changes;
- two simultaneous requests for one unit: one hold, one `addon_out_of_stock`;
- subsequent double consume leaves stock/reserved/available at 0/0/0.

`inventory-test.sql` rolls its fixtures back. The separate concurrency fixture
is hidden; its two synthetic orders are canceled in the development branch.
Production records and production functions were not changed.

Before merge/launch, still verify:

- the mounted extension with the real staff-session boundary;
- browser add → remove → required personalization → bundle replacement on mobile;
- signed sandbox payment, late callback reconciliation and partial refund;
- complete CRM/Telegram/assembly output from the actual outbox worker;
- real approved photos, stock, toy safety records, costs and bundle prices;
- main-product v6 MONO recipes/variants and digit foil options in the original API;
- SKU-specific product photography replacing mood visualizations.

Browser navigation for the final add-on UI pass was blocked by the environment's
approval/usage limit. It was not bypassed. Earlier main-storefront checks covered
desktop, 320/390 px layouts, mobile menu, filtering, palette transfer, validation,
cart quantity and editing. Temporary QA pages are removed from the deliverable.

Reference for the stock-locking model:
https://www.postgresql.org/docs/current/explicit-locking.html
