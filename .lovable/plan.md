

# Uppdatera e-postmallarnas footer-lankar och signup-text

## Problem

1. **Footer-lankar leder till 404**: Mejlen lankar till `/help`, `/privacy`, `/terms` -- men appens rutter ar `/privacy-policy` och `/terms-of-service`. Ingen `/help`-sida finns.
2. **Signup-mejlet**: Texten "Bekrafta din e-postadress sa kor vi igang:" ska andras till "Bekrafta din e-postadress: {recipient}" (visar anvandarens e-post).

## Andringar

### 1. Footer i alla 6 mallar

Byt ut de tre lankarna till:

| Nuvarande | Nytt |
|-----------|------|
| `${SITE_URL}/help` → "Hjalp" | Ta bort |
| `${SITE_URL}/privacy` → "Integritetspolicy" | `${SITE_URL}/privacy-policy` → "Integritetspolicy" |
| `${SITE_URL}/terms` → "Villkor" | `${SITE_URL}/terms-of-service` → "Villkor" |

Lagg till en rad under lankarna med `support@promotley.se` som en klickbar mailto-lank.

Ny footer-lankar-sektion:
```tsx
<Text style={footerLinks}>
  <Link href={`${SITE_URL}/privacy-policy`} style={footerLink}>Integritetspolicy</Link>
  {' · '}
  <Link href={`${SITE_URL}/terms-of-service`} style={footerLink}>Villkor</Link>
</Text>
<Text style={footerContact}>
  <Link href="mailto:support@promotley.se" style={footerLink}>support@promotley.se</Link>
</Text>
```

### 2. Signup-mejlet -- visa e-post i bekraftelse-text

Rad 72 i `signup.tsx` andras fran:
```
Bekräfta din e-postadress så kör vi igång:
```
till:
```
Bekräfta din e-postadress: {recipient}
```

### 3. Filer som andras

- `supabase/functions/_shared/email-templates/signup.tsx` (footer + text)
- `supabase/functions/_shared/email-templates/recovery.tsx` (footer)
- `supabase/functions/_shared/email-templates/magic-link.tsx` (footer)
- `supabase/functions/_shared/email-templates/invite.tsx` (footer)
- `supabase/functions/_shared/email-templates/email-change.tsx` (footer)
- `supabase/functions/_shared/email-templates/reauthentication.tsx` (footer)

### 4. Deploy

Deploya `auth-email-hook` efter andringar.

