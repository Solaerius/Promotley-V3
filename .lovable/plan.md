
# Fix: "permission denied for table users" på admin Swish-sidan

## Problemet
Två RLS-problem blockerar admin-funktionaliteten:

1. **swish_orders-tabellen**: Båda SELECT-policyer är RESTRICTIVE, vilket innebär att ALLA måste vara uppfyllda samtidigt. Policyn "Users can view own orders" innehåller en subquery mot `auth.users`-tabellen som inte är tillgänglig för `authenticated`-rollen — det ger felet "permission denied for table users".

2. **users-tabellen**: När en admin godkänner en order behöver den läsa och uppdatera en annan användares krediter/plan. Nuvarande RLS tillåter bara `auth.uid() = id`, så admins kan inte ändra andra användares konton.

## Lösning

### Steg 1: Fixa swish_orders RLS-policyer
- Ta bort de två befintliga RESTRICTIVE SELECT-policyerna
- Skapa två nya PERMISSIVE SELECT-policyer (där NÅGON av dem räcker):
  - "Admins can view all orders" — `has_role(auth.uid(), 'admin')` 
  - "Users can view own orders" — `auth.uid() = user_id` (utan subquery mot auth.users)

### Steg 2: Lägg till admin-policyer på users-tabellen
- Lägg till en PERMISSIVE SELECT-policy: "Admins can view all users" — `has_role(auth.uid(), 'admin')`
- Lägg till en PERMISSIVE UPDATE-policy: "Admins can update all users" — `has_role(auth.uid(), 'admin')`

Detta ger admins rätt att läsa kreditbalans och uppdatera plan/krediter vid godkännande.

### Steg 3: Fixa swish_orders UPDATE-policy
- Ta bort den befintliga RESTRICTIVE UPDATE-policyn
- Skapa en ny PERMISSIVE UPDATE-policy för admins

### SQL-migration (sammanfattning)
```text
-- Drop restrictive SELECT policies on swish_orders
-- Create permissive SELECT policies (admin + own orders)
-- Drop restrictive UPDATE policy on swish_orders  
-- Create permissive UPDATE policy for admins
-- Add permissive SELECT + UPDATE policies on users for admins
```

Inga frontend-ändringar behövs — all kod i AdminSwishOrders.tsx fungerar redan korrekt, det är bara databasrättigheterna som blockerar.
