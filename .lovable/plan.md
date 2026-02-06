

# Förbättra AI-förslag med internetsökning

## Sammanfattning
Ge Promotely AI möjligheten att söka på internet i realtid för att hitta säljtillfällen, event, trender och aktuella händelser som är relevanta för användarens bransch och målgrupp. Detta gör förslagen mycket mer konkreta och tidsaktuella.

## Hur det fungerar

Idag genererar AI:n förslag baserat enbart på:
- Användarens profil (bransch, målgrupp, produkt)
- Kunskapsbasen (UF-regler)
- Sociala medie-statistik

Med denna förbättring kommer AI:n att kunna:
1. Söka på internet efter aktuella event, trender och säljtillfällen
2. Hitta vad som är viralt just nu inom användarens bransch
3. Föreslå innehåll kopplat till aktuella händelser (t.ex. "Black Friday", "UF-mässan", lokala event)
4. Ge tips baserade på vad konkurrenter och framgångsrika konton gör

## Lösning: Perplexity-integration

Perplexity AI är en sökmotor med AI som returnerar strukturerade, källhänvisade svar. Den finns som en connector i Lovable.

```text
Flöde:
  Användare skriver i AI-chatten
       |
       v
  AI-assistenten analyserar frågan
       |
       v
  [Behövs aktuell info?]
     /        \
   Ja          Nej
   |            |
   v            v
  Sök via    Svara direkt
  Perplexity  som vanligt
   |
   v
  Sökresultat inkluderas
  i AI-svaret med källor
```

## Steg-för-steg implementation

### Steg 1: Koppla Perplexity-connectorn
- Koppla Perplexity via Lovable Connectors (du kommer att bli ombedd att välja eller skapa en anslutning)
- PERPLEXITY_API_KEY blir automatiskt tillgänglig som miljövariabel

### Steg 2: Lägga till "web_search" som nytt verktyg i AI-assistenten
Uppdatera `supabase/functions/ai-assistant/index.ts`:
- Lägga till ett nytt OpenAI tool `web_search` som AI:n kan anropa automatiskt
- AI:n avgör själv om en fråga kräver internetsökning (t.ex. "vilka event finns i februari?", "ge mig tips baserat på trender")
- Nyckelord som triggar sökning: "event", "trend", "aktuellt", "säsong", "kampanj", "black friday", "mässa", "inspiration", "vad händer", "säljtillfälle"

### Steg 3: Implementera sökningen i edge function
När AI:n anropar `web_search`-verktyget:
1. Bygg en sökfråga baserad på användarens bransch + fråga (t.ex. "UF-event Sverige februari 2026" eller "trender ungdomsföretagande 2026")
2. Anropa Perplexity API med `sonar`-modellen
3. Returnera resultaten (inklusive källhänvisningar) till AI:n
4. AI:n väver in informationen i sitt svar med tydliga källhänvisningar

### Steg 4: Uppdatera generate-suggestion
Uppdatera `supabase/functions/generate-suggestion/index.ts`:
- Innan AI:n genererar ett innehållsförslag, gör en Perplexity-sökning efter aktuella trender och event
- Inkludera sökresultaten i prompten så att förslaget blir tidsaktuellt
- T.ex. om det är vecka innan Alla Hjärtans Dag, kan förslaget handla om det

### Steg 5: Uppdatera AI-chattens systemprompt
- Instruera AI:n att proaktivt söka på internet när användaren frågar om trender, event eller säljtillfällen
- Instruera AI:n att alltid ange källor när den använder sökresultat
- Lägga till formatering för källhänvisningar i svaren

### Steg 6: Visa sökresultat i UI
Uppdatera `src/components/ai/AIChatContent.tsx`:
- Visa en diskret indikator "Soker pa internet..." medan AI:n soker
- Visa kallhanvisningar i botten av AI-svaret nar sokresultat anvands

## Tekniska detaljer

**Perplexity API-anrop (i edge function):**
- Modell: `sonar` (snabb, billig)
- Parametrar: `search_recency_filter: 'month'` for aktuell info
- Sprak: svenska sokfragor

**Kreditkostnad:**
- Vanlig chatt (utan sokning): 1 kredit (som idag)
- Chatt med internetsokning: 2 krediter (tydligt visat for anvandaren)
- Innehallsforslag med sokning: 2 krediter

**Sakerhetsatgarder:**
- Perplexity-anrop gor enbart fran edge functions (aldrig fran klienten)
- Sokfragor saniteras for att undvika injection
- Rate limiting galler aven for sokningar
- Svar fran Perplexity behandlas som otillforlitlig data och saniteras

## Filer som andras

| Fil | Andring |
|-----|---------|
| `supabase/functions/ai-assistant/index.ts` | Lagger till `web_search` tool, Perplexity-anrop, kallhanvisningar |
| `supabase/functions/generate-suggestion/index.ts` | Lagger till trend-sokning innan forslagsgenerering |
| `src/components/ai/AIChatContent.tsx` | Visar "soker..."-indikator och kallhanvisningar |
| `src/hooks/useAIAssistant.ts` | Hanterar sokstatus i UI |

