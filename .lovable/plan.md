

# 3.2 Quick Wins -- Snabba fixar

## Sammanfattning
Tre snabba forbattringar som kan implementeras direkt: ta bort Kalender fran bottom tab bar, bredda dashboard-layouten, och fixa kontrastproblem med hardkodade vita farger.

---

## Fix 1: Ta bort Kalender fran BottomTabBar

**Fil:** `src/components/BottomTabBar.tsx`

Ta bort Calendar-ikonen fran `tabs`-arrayen. Kalendern finns redan i top-navigationen och quick links pa dashboarden.

Resultat: 4 tabs istallet for 5 (Home, Statistik, AI, Konto).

---

## Fix 2: Bredda dashboard-layout

**Fil:** `src/pages/Dashboard.tsx`

Andra `max-w-4xl` till `max-w-6xl` i huvud-containern for att ge mer utrymme at innehallet, sarskilt pa storre skarmar.

---

## Fix 3: Kontrastfix -- CSS-variabler istallet for hardkodade farger

**Filer:** `src/pages/Dashboard.tsx`, `src/pages/AnalyticsPage.tsx`, `src/pages/AIPage.tsx`

Byt ut hardkodade `text-white` och `text-white/60` mot temavariablerna `dashboard-heading-dark` och `dashboard-subheading-dark` (som redan anvands pa nagra sidor). Detta fixar lasbarhet i ljust lage.

---

## Teknisk sammanfattning

1. BottomTabBar: Ta bort en rad i tabs-arrayen
2. Dashboard: Andra en CSS-klass
3. Kontrastfix: Byt ~10-15 hardkodade fargklasser mot CSS-variabler i 3 filer
4. Ingen databasandring beholvs
5. Ingen backend-andring beholvs

