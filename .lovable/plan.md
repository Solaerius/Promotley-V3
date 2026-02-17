
# Omfattande uppdateringsplan

## 1. Layoutkomprimering (anpassat per sektion)

### Konto och Instaellningar (40% minskning)
**Filer:** `src/components/account/AccountContent.tsx`, `src/pages/AccountPage.tsx`
- Sektions-spacing: `space-y-8` till `space-y-4`, `space-y-5` till `space-y-3`
- Section headers: `text-xl` till `text-lg`, `mb-4` till `mb-2`
- Profilbilds-grid: `p-6` till `p-3`, `gap-6` till `gap-3`
- AI-profil inputs grid: `gap-4` till `gap-2`
- Kreditkort: `p-6` till `p-3`
- Credit packages grid: `py-3` till `py-2`, `text-lg` till `text-base`
- Navigering/Danger zone: `pt-8` till `pt-4`
- AccountPage header: `mb-4` till `mb-2`, TabsList `mb-4` till `mb-2`

### Statistik-rutor (30% minskning)
**Filer:** `src/pages/Analytics.tsx`, `src/components/analytics/AnalyticsContent.tsx`
- Stats-kort padding: `p-3` till `p-2`
- Stats-ikoner: `w-8 h-8` till `w-6 h-6`
- Stats-vaerden: `text-xl` till `text-lg`
- Chart height: `height={200}` till `height={160}`
- Grid gap: `gap-3` till `gap-2`

### AI-analys (30% minskning)
**Filer:** `src/components/ai/AIToolsContent.tsx`, `src/components/analytics/AIAnalysisContent.tsx`
- Samma moenster som statistik: minska paddings, gaps, ikonstorlekar

### Kalender (5% minskning)
**Fil:** `src/pages/Calendar.tsx`
- Minimala justeringar: `min-h-[80px]` till `min-h-[76px]`, marginaler oforaendrade

---

## 2. Instagram till "Kommer snart"

**Fil:** `src/components/ConnectionManager.tsx`
- Flytta Instagram fran aktiva anslutningar till comingSoonPlatforms-listan
- Samma disabled-knapp ("Kommer snart") som LinkedIn, Twitter/X, Facebook, YouTube

---

## 3. Input-outlines i AI-profilen

**Fil:** `src/components/account/AccountContent.tsx`
- Alla AI-profil inputs: byt `className="bg-muted/30 border-0"` till `className="bg-muted/30 border border-border"`
- Standard graa border som fungerar i baade ljust och moerkt laege
- Alla Textarea-faelt: samma aendring
- Kontoinformation-faeltet foer Foeretagsnamn: samma aendring

**Fil:** `src/pages/Onboarding.tsx`
- Granska att inputs redan har synliga borders (de anvaender default Input som nu har --outline-input)

---

## 4. Ta bort Laen-faeltet

**Fil:** `src/components/account/AccountContent.tsx`
- Ta bort raden med "Laen" (rad 432-439)
- Behall `lan` i aiFormData-state men visa det inte i UI

**Fil:** `src/pages/Onboarding.tsx`
- Ta bort "Laen"-inputfaeltet fran steg 1 (rad ca 208-215)
- Behall `lan` i formData men skicka inte med det vid submit

---

## 5. Namnbyten

**Filer:** `src/components/account/AccountContent.tsx`, `src/pages/Onboarding.tsx`
- "Tonalitet" blir "Vilken ton ska Promotely AI ha?"
- "Nyckelord" blir "Era grundprinciper"

---

## 6. Ta bort dubblerat Foeretagsnamn

**Fil:** `src/components/account/AccountContent.tsx`
- Ta bort "Foeretagsnamn"-faeltet i AI-profil-sektionen (rad 396-403)
- AI-profilens foretagsnamn synkas automatiskt fran Kontoinformationens foretagsnamn vid sparning (laeg till i handleSaveAIProfile)

---

## 7. AI-funktioner blockerade utan komplett profil

**Filer:** `src/pages/AIChat.tsx`, `src/components/ai/AIToolsContent.tsx`, `src/components/ai/SalesRadarContent.tsx`, `src/components/ai/AIChatContent.tsx`
- Visa varningsbanner hoegst upp: "Din AI-profil aer inte komplett. Fyll i den foerst foer att anvaenda AI-funktioner." med laenk till /account
- Alla knappar (snabbkommandon, skicka meddelande, verktyg) disabled med opacity-50
- Textarea disabled och placeholder-text aendrad till "Fyll i din AI-profil foerst..."

---

## 8. Kalender: AI-plan med loading bar och bakgrundsprocessing

**Fil:** `src/pages/Calendar.tsx`
- Nar anvaendaren klickar "Skapa plan med AI":
  1. Visa en Progress-bar med text: "Du kan fortsaetta kolla runt i Promotely medan vi skapar din personliga marknadsfoeringsplan"
  2. Spara genereringstillstand i localStorage sa processen fortsaetter vid navigering bort
  3. Skicka notis till `notifications`-tabellen nar planen boerjar genereras
  4. Nar planen aer klar: toast-popup + notis i notiscentret med laenk till /calendar

**Fil:** `src/hooks/useCalendar.ts` (eller ny hook)
- Lagg till logik foer asynkron plangenerering med polling/status-check

---

## 9. Kalender: "Laeg till haendelse" och fler typer

**Fil:** `src/pages/Calendar.tsx`
- Knapp: "Laeg till" blir "Laeg till haendelse"
- Knappfaerg: `variant="secondary"` (graa/muted)
- Dialogtitel: "Nytt inlaeg" blir "Ny haendelse"
- Byt "Plattform"-Select till "Typ"-Select med:
  - Inlaeg (socialt mediainlaeg)
  - UF-marknad
  - Event/aktivitet
  - Deadline
  - Oevrigt
- Faergkodning per typ:
  - Inlaeg: rosa (befintlig Instagram-faerg)
  - UF-marknad: groent
  - Event/aktivitet: blatt
  - Deadline: roett/orange
  - Oevrigt: gratt

---

## 10. Fixa registrering: "Ga med i foretag" och "Skapa foretag"

**Fil:** `src/pages/Auth.tsx`
- "Skapa foretag" blir "Registrera nytt foretag"
- Nar "Ga med i foretag" valjs: visa ett inputfaelt foer "Inbjudningskod" (valfritt)
- Koden sparas i user metadata vid signup
- Efter e-postverifiering anvands koden automatiskt foer att gaa med i organisationen
- Anvaendaren kan ocksa fylla i koden senare via /join/:code

**Fil:** `src/hooks/useAuth.tsx`
- Uppdatera signUp foer att ta emot inviteCode som parameter
- Spara invite_code i user_metadata
- Lagg till retry-logik foer company_name-uppdatering (triggern kanske inte hunnit skapa raden)

**Fil:** `src/pages/AuthCallback.tsx` eller onboarding-floedet
- Kontrollera om user metadata innehaller invite_code
- Om ja: anvaend koden foer att gaa med i organisationen automatiskt

---

## 11. Prenumerationstext foer gratisanvaendare

**Fil:** `src/components/CreditsDisplay.tsx`
- Rad 84-88: Visa "Foernyas"-datum BARA om planen aer starter, growth eller pro
- Foer free_trial: visa "Gratis plan -- uppgradera foer mer" istallet

---

## Sammanfattning av filaendringar

| Fil | Aendringar |
|-----|------------|
| `src/components/account/AccountContent.tsx` | 40% komprimering, ta bort Laen, ta bort dubblett-foretagsnamn, input-outlines, namnbyten |
| `src/pages/AccountPage.tsx` | 40% komprimering |
| `src/pages/Analytics.tsx` | 30% komprimering |
| `src/components/analytics/AnalyticsContent.tsx` | 30% komprimering |
| `src/components/ai/AIToolsContent.tsx` | 30% komprimering + AI-blockering |
| `src/components/ai/SalesRadarContent.tsx` | AI-blockering |
| `src/components/ai/AIChatContent.tsx` | AI-blockering |
| `src/pages/AIChat.tsx` | AI-blockering + bannervarning |
| `src/pages/Calendar.tsx` | 5% komprimering, loading bar, haendelsetyper, knappbyte |
| `src/components/ConnectionManager.tsx` | Instagram till "Kommer snart" |
| `src/pages/Onboarding.tsx` | Ta bort Laen, namnbyten |
| `src/pages/Auth.tsx` | Rename, inbjudningskod-faelt, fixa registrering |
| `src/hooks/useAuth.tsx` | invite_code-parameter, retry-logik |
| `src/components/CreditsDisplay.tsx` | Prenumerationstext foer gratis |

Inga nya databastabeller behoevs. Befintlig `calendar_posts`-tabell kan behoeva en `event_type`-kolumn (TEXT) foer att stoedja de nya haendelsetyperna.
