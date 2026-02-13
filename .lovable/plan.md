
# Implementeringsplan: Kvarvarande Gap (6 stycken + justeringar)

## Prioritetsordning

1. AI-sidan: dynamisk default-flik
2. AI-chatt: historik-sidebar + Ny chatt (separata trådar i DB)
3. Grattis-mail + in-app notis vid klar onboarding
4. Notiscenter (dropdown från navbar med sparad lista + sociala felregler)
5. "Lämna dashboarden" (navbar + kontosida)
6. Säljradar: platsbaserade events (AI nu + DB senare) + bevakning med kreditkostnad
7. Demohemsida: byt till "Nordic Hoodies UF"
8. Kontrastgranskning light/dark (full genomgång alla sidor)
9. Analytics-events

UF Knowledge Pack (RAG) skjuts upp till senare.

---

## 1. AI-sidan: dynamisk default-flik

**Vad:** Spara senast anvanda flik i localStorage. Nar anvandaren oppnar /ai, lases det sparade vardet. Om inget finns: default till "verktyg".

**Tekniskt:**
- AIPage.tsx: vid mount, las `localStorage.getItem('promotely_ai_tab')` som default for `activeTab`
- Vid flikbyte, spara `localStorage.setItem('promotely_ai_tab', tab)`
- Fallback: "verktyg"

**Estimat:** S (liten)

---

## 2. AI-chatt: historik-sidebar + Ny chatt

**Vad:** Vanster sidebar i chatten som visar alla tidigare konversationer. "Ny chatt"-knapp skapar ny trad. Varje trad ar en separat conversation i databasen.

**Datamodell:**
- Tabellen `conversations` behover skapas (eller verifiera att den finns) med:
  - `id`, `user_id`, `title`, `created_at`, `updated_at`, `last_message_at`
- Tabellen `chat_messages` (eller `ai_chat_messages`) med:
  - `id`, `conversation_id`, `role`, `message`, `plan` (jsonb), `created_at`
- RLS: Anvandare ser bara egna konversationer och meddelanden

**UI:**
- Vanster sidebar (collapsible pa mobil) med lista av konversationer, sorterade pa last_message_at desc
- Varje konversation visar titel (forsta meddelandet eller auto-genererad)
- "Ny chatt"-knapp hogst upp i sidebaren
- Aktiv konversation markerad visuellt
- Pa mobil: sidebar oppnas via hamburger-ikon, stanger vid val

**Hook:** `useConversations` for att hamta, skapa, ta bort konversationer. `useAIAssistant` uppdateras for att arbeta med conversation_id.

**Estimat:** L (stor) - Krav: DB-migration + ny hook + UI-omstrukturering

---

## 3. Grattis-mail + in-app notis

**Vad:** Nar onboarding_completed satts till true: (1) skicka mail via Resend, (2) visa in-app notis.

**Tekniskt:**
- Ny edge function `send-onboarding-complete` (eller utoka befintlig) som anropas fran Onboarding.tsx efter lyckat `updateProfile`
- Mail-amne: "Du ar igang -- forsta AI-analysen ar gratis"
- Mail-body: CTA-lank till /ai
- In-app: Toast/SlideNotification med samma budskap
- Skydd: Skicka bara om `onboarding_completed` inte redan var true (forsta gangen)

**Estimat:** M (medel)

---

## 4. Notiscenter

**Vad:** Klocka-ikon i DashboardNavbar som oppnar en dropdown med alla notiser (sparade, last/olast). Sociala konton: tysta nar ej kopplade, paminelse ca 1 gang/vecka.

**Datamodell:**
- Tabellen `user_notifications` (eller anvand befintlig notifications edge function):
  - `id`, `user_id`, `title`, `message`, `type`, `read`, `created_at`
- RLS: Anvandare ser bara egna notiser

**UI:**
- Klocka-ikon i DashboardNavbar med badge for olastaantal
- Dropdown: lista av notiser med liten tidsstampel, klickbar for att markera som last
- "Markera alla som lasta"-knapp
- Typer: info, success, warning, chat, social_reminder

**Felregler sociala:**
- Nar inget konto ar kopplat: inga felmeddelanden. Var 7:e dag (baserat pa senaste paminelse-datum i localStorage): visa en diskret notis "Koppla dina sociala konton for battre insikter"
- Nar kopplat konto fallerar: visa felmeddelande i notiscentret

**Estimat:** M-L

---

## 5. "Lamna dashboarden"

**Vad:** Tva platser: (1) DashboardNavbar - lank "Till startsidan" + "Logga ut", (2) AccountPage - samma.

**Tekniskt:**
- DashboardNavbar.tsx: Lagg till en meny/knappar langst ner eller i en dropdown med "Till startsidan" (navigate('/')) och "Logga ut" (supabase.auth.signOut)
- AccountPage: Lagg till sektion med samma knappar

**Estimat:** S

---

## 6. Saljradar: platsbaserade events + bevakning

**Vad:** AI genererar saljmojligheter baserat pa anvandarens stad/postnummer fran AI-profilen. Bevakning kostar krediter.

**Tekniskt:**
- Uppdatera `sales-radar` edge function: inkludera anvandarens stad/postnummer/lan i prompten for att fa platsanpassade resultat
- Bevakning: ny tabell `sales_radar_watches` med `id`, `user_id`, `result_id`, `notify_date`, `notified`, `created_at`
- Bevaknings-logik: edge function (cron eller vid inloggning) kollar watches + skickar notis till notiscentret. Varje bevakning drar 1 kredit vid skapande.
- UI: "Bevaka"-knapp pa varje lead/event. Visar "Bevakas" efter klick. Tydlig info om kreditkostnad.

**Estimat:** M-L

---

## 7. Demohemsida: byt till "Nordic Hoodies UF"

**Vad:** Andra demoData.ts fran GreenBite UF till Nordic Hoodies UF med anpassad data (keps-/hoodie-foretag).

**Estimat:** S

---

## 8. Kontrastgranskning light/dark

**Vad:** Systematisk genomgang av alla sidor i bade ljust och morkt lage. Fixa problem dar text ar olasbar, knappar osynliga, eller inputs saknar kant.

**Genomgang:**
- Landningssida (Index)
- Dashboard
- AI-sida (alla flikar)
- Statistik
- Kalender
- Kontosida
- Onboarding
- Demo
- Inloggning/Registrering
- Prissattning

**Estimat:** M (manga sma fixar)

---

## 9. Analytics-events

**Vad:** Implementera sparningsevent for nyckelhandelser.

**Events:**
- `onboarding_complete` - Nar anvandaren slutfor onboarding
- `ai_first_analysis` - Forsta AI-analysen
- `sales_opportunities_viewed` - Saljradar oppnad
- `event_click` - Klick pa specifikt saljradarevent
- `watch_created` - Bevakning skapad
- `notification_opened` - Notis oppnad
- `chat_new_thread` - Ny chattrad skapad
- `org_joined` - Gick med i organisation

**Tekniskt:**
- Enkel `trackEvent(name, metadata)` hjalpfunktion som sparar till en `analytics_events` tabell
- Tabell: `id`, `user_id`, `event_name`, `metadata` (jsonb), `created_at`
- RLS: Bara anvandaren och admins kan lasa

**Estimat:** M

---

## Sammanfattad sprint-plan

| Sprint | Innehall | Estimat |
|--------|----------|---------|
| Sprint 1 | 1. Dynamisk AI-flik + 5. Lamna dashboard + 7. Nordic Hoodies | Sma fixar |
| Sprint 2 | 2. Chatthistorik + trad-system | Stort |
| Sprint 3 | 3. Grattis-mail + 4. Notiscenter | Medel-Stort |
| Sprint 4 | 6. Saljradar platsdata + bevakning | Medel-Stort |
| Sprint 5 | 8. Kontrastgranskning + 9. Analytics-events | Medel |

Implementering sker steg for steg med intervju/bekraftelse mellan varje del.
