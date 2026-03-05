

# AI Council — Intelligent modellrouting

## Tillgängliga modeller

Lovable AI Gateway ger **INTE** tillgång till Anthropic (Claude). Däremot finns ett brett utbud:

**Google Gemini**: gemini-2.5-pro, gemini-3-pro-preview, gemini-3-flash-preview, gemini-2.5-flash, gemini-2.5-flash-lite
**OpenAI**: gpt-5, gpt-5-mini, gpt-5-nano, gpt-5.2

Det är 10 modeller — mer än tillräckligt för intelligent routing.

---

## Koncept: AI Council

Istället för att användaren manuellt väljer modell, analyserar en snabb "router-modell" varje förfrågan och väljer optimal modell baserat på:

1. **Komplexitet** — enkel fråga vs djup strategi
2. **Användarens valda nivå** (Snabb/Standard/Premium) — sätter taket
3. **Typ av uppgift** — chatt, analys, marknadsplan, kalender etc.
4. **Företagsprofil** — mer data = bättre routing

### Routinglogik (server-side i ai-assistant)

```text
Användaren väljer nivå → sätter "modellpool"

Snabb (⚡):  gemini-2.5-flash-lite, gpt-5-nano
Standard (✨): gemini-3-flash-preview, gemini-2.5-flash, gpt-5-mini
Premium (🧠):  gemini-2.5-pro, gemini-3-pro-preview, gpt-5, gpt-5.2
```

En snabb classifier (gemini-2.5-flash-lite, ~0 extra kostnad) analyserar meddelandet och returnerar:
- `complexity`: low / medium / high
- `task_type`: chat / analysis / strategy / creative / data
- `recommended_model`: bästa modellen från poolen

### Exempel

| Förfrågan | Nivå | Router väljer |
|-----------|------|--------------|
| "Vad är CTR?" | Snabb | gemini-2.5-flash-lite |
| "Ge mig 5 content-idéer" | Standard | gemini-3-flash-preview |
| "Skapa en 30-dagars marknadsplan" | Standard | gemini-2.5-flash (mer context) |
| "Djupanalys av min konkurrent" | Premium | gpt-5.2 (bäst resonering) |
| "Skriv en kreativ caption" | Premium | gemini-3-pro-preview |

---

## Implementering

### 1. Uppdatera `src/lib/modelTiers.ts`
- Byt från en fast modell per nivå till en **modellpool** per nivå
- Exportera poolkonfigurationen

### 2. Uppdatera `supabase/functions/ai-assistant/index.ts`
- Lägg till en `routeRequest()`-funktion som:
  1. Skickar meddelandet + kontextmetadata till `gemini-2.5-flash-lite` med en kort prompt: "Klassificera detta meddelande..."
  2. Tar emot strukturerat svar (complexity + recommended_model)
  3. Använder den rekommenderade modellen för huvudanropet
- Fallback: om routern misslyckas, använd standardmodellen för nivån
- Logga vald modell för debugging

### 3. Uppdatera `src/components/ai/ModelTierSelector.tsx`
- Ändra labels till att kommunicera "nivå" snarare än specifik modell
- Lägg till tooltip: "AI:n väljer automatiskt bästa modellen för din förfrågan"

### 4. Kreditberäkning
- Behåll samma multiplikatorer (0.5x / 1x / 2x) baserat på vald nivå
- Routinganropet kostar inget extra (flash-lite är försumbart billigt)

---

## Sammanfattning

| Fil | Ändring |
|-----|---------|
| `src/lib/modelTiers.ts` | Modellpooler istället för enskild modell |
| `supabase/functions/ai-assistant/index.ts` | `routeRequest()` classifier + dynamiskt modellval |
| `src/components/ai/ModelTierSelector.tsx` | Uppdaterade labels/tooltips |

Ingen DB-migration krävs. Routern lägger till ~200ms latens men ger signifikant bättre svar genom att matcha rätt modell till rätt uppgift.

