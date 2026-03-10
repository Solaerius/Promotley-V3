# Comprehensive Platform Update Plan

This is a large implementation covering 8 distinct workstreams. Here is the full plan organized by priority and dependency order.

---

## 1. Tutorial Bug Fix (Global Overlay)

**Problem**: `OnboardingTutorial` is rendered inside `DashboardLayout`, which unmounts/remounts on route changes, resetting the `currentStep` state.

**Solution**: Move the tutorial rendering to `App.tsx` level, outside of page routes. The tutorial component will be wrapped in a new `GlobalTutorialProvider` that:

- Checks `ai_profiles.tutorial_seen` once on auth
- Renders the overlay at the root level so it persists across route changes
- Only renders when inside protected/dashboard routes (not on `/auth`, `/`, etc.)

**Files**: `src/App.tsx`, new `src/components/GlobalTutorial.tsx` (moves logic from DashboardLayout), `src/components/layouts/DashboardLayout.tsx` (remove tutorial rendering)

---

## 2. Remove Subscription/Renewal Text

Remove the "Förnyas" date and any subscription-related buttons from:

- `CreditsDisplay.tsx` (lines 84-92): Remove the renewal date text entirely for all plans
- `DashboardNavbar.tsx` (lines 284-287): Remove "Förnyas" row from profile dropdown, keep only "Köp krediter" button

**Files**: `src/components/CreditsDisplay.tsx`, `src/components/DashboardNavbar.tsx`

---

## 3. Remove Emoji from Welcome Notification

In `supabase/functions/send-onboarding-complete/index.ts` line 115, change:

```
"Välkommen till Promotely! 🎉"  →  "Välkommen till Promotely!"
```

**Files**: `supabase/functions/send-onboarding-complete/index.ts`

---

## 4. Clickable Notifications with Spotlight

### 4a. Add `action_url` column to notifications table

Database migration to add an optional `action_url` text column and optional `action_type` text column to the `notifications` table.

### 4b. Update notification creation

Update `send-onboarding-complete` to include `action_url: '/ai'` and `action_type: 'spotlight_ai_analysis'`.

### 4c. Clickable notification items in DashboardNavbar

When a notification has `action_url`, clicking it navigates to that route. If it has `action_type === 'spotlight_ai_analysis'`, pass a query param like `?spotlight=ai-analysis`.

### 4d. Spotlight animation component

Create a reusable `SpotlightHighlight` component that:

- Takes a CSS selector to highlight
- Shows a dark overlay with a cutout around the target element
- Pulses/glows for 3 seconds then auto-dismisses
- Used on the AI page when `?spotlight=ai-analysis` query param is present

**Files**: Migration (add columns), `supabase/functions/send-onboarding-complete/index.ts`, `src/components/DashboardNavbar.tsx`, new `src/components/SpotlightHighlight.tsx`, `src/pages/AIPage.tsx`

---

## 5. Automated Emails (Onboarding Complete + Re-engagement)

### 5a. Onboarding complete email to org members

New edge function `send-team-onboarding-email` triggered when a user completes their AI profile. Sends email to all organization members notifying them that the profile is ready and encouraging platform usage.

### 5b. Re-engagement email system

- New database table `email_automation_settings` with columns:
  - `id`, `email_type` (enum: 'inactive_reminder', 'reengagement'), `enabled` (boolean), `delay_days` (integer), `updated_at`, `updated_by`
- New database table `email_automation_logs` to track sent automated emails (prevents duplicates):
  - `id`, `user_id`, `email_type`, `sent_at`
- New edge function `send-reengagement-email` that:
  - Queries users with no activity (no `ai_chat_messages`, no `suggestions`, no `calendar_posts`) within the configured delay period
  - Checks `email_automation_logs` to avoid re-sending
  - Sends branded re-engagement email via Resend
- Cron job (pg_cron) to invoke this function daily

### 5c. Admin UI for email automation

New page `/admin/email-automation` with:

- Toggle to enable/disable each email type
- Input field for delay (days) per email type
- Log viewer showing recent automated sends

**Files**: 2 migrations, 2 new edge functions, new `src/pages/AdminEmailAutomation.tsx`, update `src/App.tsx` routing, update admin dashboard quick links

---

## 6. Free Tier Implementation

### 6a. Database changes

- Add `free_trial` back to the plan enum (it already exists as default)
- New table `free_tier_usage`:
  - `id`, `user_id`, `usage_type` ('ai_analysis' | 'calendar'), `used_at`, `period_start` (date)
  - Unique constraint on `(user_id, usage_type, period_start)`
- Update `handle_new_user()` function: set `credits_left = 0`, `max_credits = 0` for new users

### 6b. Frontend gating

- Update `CreditsDisplay` to show "0 / 0" for free tier
- Update AI analysis page: before creating, check `free_tier_usage` for current month. If already used, block with modal. If not used, show warning modal explaining "1 per month, choose analysis OR calendar"
- Update Calendar page: same logic as above
- Model tier selector: free users locked to cheapest tier. Clicking Standard/Premium shows full-screen upgrade prompt
- New `UpgradePromptOverlay` component: full-screen overlay with plan comparison and CTA to pricing
- Introduce "Free Tier" name into the different tiers available adn implement it across the frontend.

### 6c. AI recommendation in the warning modal

When showing the "choose analysis or calendar" warning, make a lightweight AI call (cheapest model) that analyzes the user's `ai_profiles` data and connected social accounts to recommend which option would benefit them more.

**Files**: Migration, `src/components/ai/ModelTierSelector.tsx`, new `src/components/FreeTierWarningModal.tsx`, new `src/components/UpgradePromptOverlay.tsx`, `src/pages/AIPage.tsx`, `src/pages/Calendar.tsx`, `src/hooks/useFreeTierUsage.ts`

---

## 7. Credits-Depleted Warning Banner

### Implementation

New `CreditWarningBanner` component rendered inside `DashboardLayout` (inline alert under content):

- **Free plan users** (0/0 credits): "Du har inga krediter -- uppgradera for att anvanda AI-verktyg"
- **Paid plan users** (0/X credits): "Dina krediter ar slut -- uppgradera eller kop fler krediter"
- Links to `/pricing` and `/buy-credits` (Swish checkout)
- Only shows when `credits_left === 0`
- Dismissible per session (sessionStorage)

**Files**: New `src/components/CreditWarningBanner.tsx`, `src/components/layouts/DashboardLayout.tsx`

---

## 8. Admin Portal Overhaul

### 8a. Redesigned dashboard layout

Replace current admin dashboard with a professional grid layout:

- **Top row**: Key metrics cards (total users, active today, total revenue from approved Swish, pending orders, total AI requests)
- **Middle row**: Quick status indicators (notification channels, system health)
- **Bottom**: Quick action grid (existing links, cleaned up)

### 8b. New admin tools

- **System stats**: Query aggregate data from `users`, `swish_orders`, `ai_chat_messages`, `suggestions` tables
- **User detail panel**: On `/admin/users`, clicking a user opens a detail sheet showing their profile, plan, credits, organization, connections, and recent activity. Allow inline editing of plan and credits.
- **Email automation settings**: (covered in section 5c above)
- **Activity log**: Recent security events and user actions in a scrollable feed

### 8c. UI cleanup

- Consistent button styling (primary for main actions, outline for secondary)
- Remove the verbose "how to add admin" instructions (replace with a single-line note)
- Add breadcrumbs for admin sub-pages
- Better mobile responsiveness for admin grid

**Files**: `src/pages/AdminDashboard.tsx` (major rewrite), `src/pages/AdminUserManagement.tsx` (add detail panel), new `src/pages/AdminEmailAutomation.tsx`

---

## Dashboard Note

You mentioned that the dashboard page will be overhauled separately. The following items from this plan touch the dashboard area but are minimal and won't conflict:

- Credit warning banner (added via DashboardLayout, not Dashboard.tsx itself)
- Tutorial overlay (moved to App.tsx level)

These are layout-level changes that will persist regardless of dashboard content changes.

---

## Summary of Database Changes


| Change                                             | Type      |
| -------------------------------------------------- | --------- |
| Add `action_url`, `action_type` to `notifications` | Migration |
| Create `free_tier_usage` table                     | Migration |
| Create `email_automation_settings` table           | Migration |
| Create `email_automation_logs` table               | Migration |
| Update `handle_new_user()` for 0/0 credits         | Migration |


## Summary of New Edge Functions


| Function                     | Purpose                                     |
| ---------------------------- | ------------------------------------------- |
| `send-team-onboarding-email` | Notify org members when profile is complete |
| `send-reengagement-email`    | Re-engage inactive users (cron-triggered)   |


&nbsp;

## 9. Introduce a new animation

- Create a glass like animation when switching in between "snabb", "normal" and "premium" in the model section across the whole back end. It should be lik a glass buble that has a little glass bubble animation from when switching across the different model selection.  

## 8. (again) Summary of New Components


| Component                  | Purpose                                |
| -------------------------- | -------------------------------------- |
| `GlobalTutorial.tsx`       | Root-level tutorial overlay            |
| `SpotlightHighlight.tsx`   | Reusable 3-second spotlight animation  |
| `FreeTierWarningModal.tsx` | Monthly usage warning for free users   |
| `UpgradePromptOverlay.tsx` | Full-screen upgrade prompt             |
| `CreditWarningBanner.tsx`  | Inline credits-depleted alert          |
| `AdminEmailAutomation.tsx` | Admin page for email automation config |
