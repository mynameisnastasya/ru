# WINK backend

WINK uses a server-side runtime + PostgreSQL as the single source of truth. Telegram is an operational notification/action channel, not order storage.

## Live contract

Public:
- `GET /health` — runtime/database health.
- `POST /api/orders` — validates checkout, recalculates prices server-side, writes immutable order snapshots. Requires an `idempotency_key`; repeated submission returns the same order.
- `GET /api/orders/public/:token` — safe public tracking; intentionally excludes phones, full address and personal message.

Payments:
- `POST /api/webhooks/payments/:provider` — server webhook entry point. Amount/currency are checked against the order and provider event IDs are idempotent.
- A successful verified event is the only path that moves an order to `PAID`.

Telegram / operations:
- `POST /api/telegram/webhook` — verifies `X-Telegram-Bot-Api-Secret-Token`.
- `POST /api/jobs/outbox` — retry worker entry point.
- `POST /api/admin/staff/:id/telegram-bind-token` — creates a one-time 10-minute staff binding code.
- `/bind CODE` in the bot associates a Telegram user ID with a WINK staff user.
- Inline Telegram actions use the same server-side state rules as admin actions and apply role checks.

Admin API (temporary internal auth boundary until staff web sessions are wired):
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `POST /api/admin/orders/:id/transition`

## Order state machine

`AWAITING_PAYMENT → PAID → CONFIRMED → ASSEMBLY → QUALITY_CHECK → READY → OUT_FOR_DELIVERY → DELIVERED`

Additional states supported by the model: `NEEDS_CLARIFICATION`, `COURIER_ASSIGNED`, `CANCELED`, `REFUNDED`.

Transitions are server-side and append both status history and audit records.

## Reliability

`ORDER_PAID` creates an outbox event. Telegram delivery is retried rather than being coupled to the payment transaction. Integration delivery state and Telegram message IDs are persisted in PostgreSQL.

## Secrets

Never commit real values. Runtime values belong in the hosting secret store only:

- `DATABASE_URL`
- `PAYMENT_SECRET_KEY`
- `PAYMENT_WEBHOOK_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ORDERS_CHAT_ID`
- `TELEGRAM_WEBHOOK_SECRET`
- `WINK_ADMIN_KEY`
- `WINK_TEST_KEY`

See `/.env.example` for names only.

## Still requiring launch inputs

The specification intentionally does not define WINK's final payment provider credentials, delivery zones/fees/cutoffs, production capacity, OTP/SMS provider, legal copy, or production object-storage credentials. Those values must be configured before launch rather than invented in code.
