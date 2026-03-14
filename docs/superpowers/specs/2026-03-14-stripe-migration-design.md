# Stripe Payment Migration Design

**Date:** 2026-03-14
**Status:** Approved
**Replaces:** Swish manual payment system

---

## Overview

Replace the manual Swish QR code payment flow with Stripe Checkout (hosted). Stripe handles card processing, recurring billing, and 3D Secure compliance automatically. Admin no longer manually approves payments — Stripe webhooks trigger automatic plan/credit activation.

---

## Architecture

```
User clicks "Köp plan" in Pricing
        ↓
Frontend calls Edge Function: stripe-checkout
        ↓
Edge Function creates Stripe Checkout Session
        ↓
User redirected to Stripe hosted page (card entry)
        ↓
Stripe processes payment
        ↓
Stripe sends webhook → Edge Function: stripe-webhook
        ↓
Webhook updates: stripe_customers + stripe_subscriptions tables
              + users.plan / users.credits_left / users.max_credits
        ↓
User redirected back to /checkout/success
```

---

## Database Schema

### New table: `stripe_customers`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id             uuid REFERENCES users(id) UNIQUE NOT NULL
stripe_customer_id  text UNIQUE NOT NULL
created_at          timestamptz DEFAULT now()
```

### New table: `stripe_subscriptions`
```sql
id                       uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                  uuid REFERENCES users(id) NOT NULL
stripe_subscription_id   text UNIQUE NOT NULL
stripe_customer_id       text NOT NULL
price_id                 text NOT NULL
plan                     text NOT NULL  -- starter | growth | pro
status                   text NOT NULL  -- active | canceled | past_due | incomplete
current_period_start     timestamptz
current_period_end       timestamptz
cancel_at_period_end     boolean DEFAULT false
created_at               timestamptz DEFAULT now()
updated_at               timestamptz DEFAULT now()
```

### Additions to `users` table
```sql
stripe_customer_id  text  -- denormalized for quick lookup
```

### Preserved
- `swish_orders` table is kept untouched (historical data)

---

## Stripe Products to Create

### Subscription plans (recurring monthly, currency: SEK)
| Plan    | Price   | Stripe Product Name       |
|---------|---------|---------------------------|
| Starter | 29 kr   | Promotely UF Starter      |
| Growth  | 49 kr   | Promotely UF Growth       |
| Pro     | 99 kr   | Promotely UF Pro          |

### One-time credit packages (currency: SEK)
| Package | Credits | Price | Stripe Product Name          |
|---------|---------|-------|------------------------------|
| Mini    | 10      | 9 kr  | Promotely Credits Mini       |
| Liten   | 25      | 19 kr | Promotely Credits Liten      |
| Medium  | 50      | 35 kr | Promotely Credits Medium     |
| Stor    | 100     | 59 kr | Promotely Credits Stor       |

---

## Environment Variables

### Edge Functions (server-side only)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Frontend (not required — no client-side Stripe SDK needed)
- None additional needed for Checkout redirect approach

---

## Frontend Changes

### Files removed / replaced
| Old | New |
|-----|-----|
| `src/lib/swishConfig.ts` | `src/lib/stripeConfig.ts` |
| `src/pages/SwishCheckout.tsx` | `src/pages/CheckoutRedirect.tsx` |
| `src/pages/AdminSwishOrders.tsx` | `src/pages/AdminStripeOrders.tsx` |

### New files
- `src/pages/CheckoutSuccess.tsx` — success confirmation page at `/checkout/success`
- `src/pages/CheckoutCancel.tsx` — cancellation page at `/checkout/cancel`

### Modified files
- `src/App.tsx` — update routes (see Routes section)
- `src/components/Pricing.tsx` — update links from `/swish-checkout?plan=X` to `/checkout?plan=X`
- `src/components/account/AccountContent.tsx` — add "Hantera prenumeration" button (visible when user has active subscription, calls `stripe-portal`)

### `src/lib/stripeConfig.ts`
Replaces swishConfig. Contains:
- Plan definitions with Stripe Price IDs (from env or config)
- Credit package definitions with Stripe Price IDs
- Helper to determine purchase type (subscription vs one-time)

### `src/pages/CheckoutRedirect.tsx`
- Route: `/checkout?plan=growth` or `/checkout?package=mini`
- On mount: calls `stripe-checkout` Edge Function
- Shows loading spinner while waiting
- On success: `window.location.href = url` (redirect to Stripe)
- On error: shows error toast + back-to-pricing button
- No manual form steps — Stripe's hosted page handles everything

### `src/pages/CheckoutSuccess.tsx`
- Route: `/checkout/success`
- Displays: "Tack för ditt köp!" with plan/product name if available
- Note: displays message that plan/credits may take a moment to activate (webhook is async)
- Button: navigate to `/dashboard`

### `src/pages/CheckoutCancel.tsx`
- Route: `/checkout/cancel`
- Displays: "Betalning avbruten"
- Button: navigate back to `/pricing`

### `src/pages/AdminStripeOrders.tsx`
- Route: `/admin/stripe`
- Read-only view of `stripe_subscriptions` table
- Shows: customer email, plan, status, current period dates, cancel_at_period_end
- Filter by status (active / canceled / past_due)
- No approve/reject actions — Stripe handles payment automatically

### Routes (`src/App.tsx`)
```
/checkout              → CheckoutRedirect (ProtectedRoute)
/checkout/success      → CheckoutSuccess (ProtectedRoute)
/checkout/cancel       → CheckoutCancel (public)
/admin/stripe          → AdminStripeOrders (AdminRoute)
/swish-checkout        → <Navigate to="/pricing" replace />
```

---

## Edge Functions

### `stripe-checkout`
**Input:** `{ priceId, planKey, userId, userEmail, type: "subscription" | "one_time" }`

**Logic:**
1. Verify user is authenticated (JWT check)
2. Look up `stripe_customers` for existing Stripe Customer ID
3. If not found: create Stripe Customer with user's email, insert into `stripe_customers`
4. Create Stripe Checkout Session:
   - `mode: "subscription"` for plans, `mode: "payment"` for credit packages
   - `success_url: {SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url: {SITE_URL}/checkout/cancel`
   - `customer`: existing Stripe Customer ID
   - `metadata: { userId, planKey, type }`
5. Return `{ url: session.url }`

### `stripe-webhook`
**Stripe events handled:**

| Event | Action |
|-------|--------|
| `checkout.session.completed` | If `mode=payment` (credits): add credits to user |
| `customer.subscription.created` | Upsert `stripe_subscriptions`, update `users.plan` + credits |
| `customer.subscription.updated` | Upsert `stripe_subscriptions`, sync `users.plan` + credits |
| `customer.subscription.deleted` | Set subscription status to `canceled`, reset user to free plan |
| `invoice.payment_failed` | Update subscription status to `past_due` |

**Security:** Verify Stripe signature using `STRIPE_WEBHOOK_SECRET` before processing any event.

### `stripe-portal`
**Input:** `{ userId }`

**Logic:**
1. Verify user is authenticated
2. Look up `stripe_customer_id` from `stripe_customers` table
3. Create Stripe Billing Portal Session with `return_url: {SITE_URL}/account`
4. Return `{ url: session.url }`

---

## Data Flow: Subscription Purchase

1. User on `/pricing` clicks "Köp Growth"
2. Navigate to `/checkout?plan=growth&type=plan`
3. `CheckoutRedirect` mounts → calls `stripe-checkout` with `{ priceId: GROWTH_PRICE_ID, planKey: "growth", type: "subscription" }`
4. Edge Function creates/finds Stripe Customer → creates Checkout Session → returns URL
5. Frontend redirects to Stripe hosted page
6. User enters card → Stripe processes → redirects to `/checkout/success`
7. Simultaneously: Stripe sends `customer.subscription.created` webhook
8. `stripe-webhook` receives event → upserts `stripe_subscriptions` → updates `users` (plan=growth, credits=100, max_credits=100, renewal_date=+30d)

## Data Flow: Credit Top-up

1. User on account page clicks "Köp 50 krediter"
2. Navigate to `/checkout?package=medium&type=credits`
3. `CheckoutRedirect` calls `stripe-checkout` with `{ priceId: MEDIUM_CREDITS_PRICE_ID, planKey: "medium", type: "one_time" }`
4. Checkout Session created with `mode: "payment"`
5. User pays → redirected to `/checkout/success`
6. `checkout.session.completed` webhook fires → `stripe-webhook` adds 50 credits to `users.credits_left`

## Data Flow: Manage Subscription

1. User on `/account` clicks "Hantera prenumeration"
2. Frontend calls `stripe-portal` Edge Function
3. Edge Function creates portal session → returns URL
4. Frontend redirects to Stripe Customer Portal
5. User cancels/updates payment → redirected back to `/account`

---

## Error Handling

- **Checkout session creation fails**: show toast error, remain on `/checkout` with retry option
- **Webhook signature invalid**: return 400, log error
- **Webhook processing fails**: return 500 so Stripe retries (Stripe retries webhooks for up to 3 days)
- **User has no Stripe customer on portal request**: show toast "Ingen aktiv prenumeration hittades"
- **Checkout success but webhook not yet fired**: success page shows "Din plan aktiveras inom kort" — polling not needed, webhook is near-instant

---

## Migration Notes

- `swish_orders` table and `AdminSwishOrders` page remain accessible at `/admin/swish` for historical order lookup
- All `/swish-checkout` links redirect to `/pricing`
- Existing users are unaffected until they purchase through the new flow
