

# Fix: Clickable Notifications

## Problem

The notification items in `DashboardNavbar.tsx` use `DropdownMenuItem` with `onClick`, but Radix UI's `DropdownMenuItem` can swallow click events or close the dropdown before the handler completes. Additionally, notifications without `action_url` have no click feedback or action, and the `(notification as any)` type cast suggests the types aren't properly connected.

## Fix

### 1. Replace `onClick` with `onSelect` on `DropdownMenuItem`

Radix `DropdownMenuItem` uses `onSelect` as its primary interaction handler, not `onClick`. Switch both notification dropdown instances (horizontal and vertical navbar) to use `onSelect` with `e.preventDefault()` to keep the dropdown open during navigation.

### 2. Remove `(notification as any)` casts

The `Notification` interface in `useNotifications.ts` already includes `action_url` and `action_type`. Remove the unnecessary `as any` casts in `DashboardNavbar.tsx`.

### 3. Add visual click affordance

- Add a hover highlight and subtle arrow icon for notifications that have an `action_url`
- All notifications should mark as read on click regardless of `action_url`

**Files to edit**: `src/components/DashboardNavbar.tsx` (two notification list sections around lines 232-258 and 449-475)

