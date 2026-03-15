# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the Vite React app. Use `src/pages/` for route-level screens, `src/components/` for reusable UI and feature blocks, `src/hooks/` for shared React hooks, `src/lib/` for helpers and config, and `src/integrations/supabase/` for client types and setup. Static files live in `public/`; bundled images and app assets live in `src/assets/`. Database migrations and Edge Functions are in `supabase/migrations/` and `supabase/functions/`. Design and rollout notes belong in `docs/superpowers/specs/`.

## Build, Test, and Development Commands
Install dependencies with `npm install`.

- `npm run dev` starts the local Vite dev server.
- `npm run build` creates the production bundle in `dist/`.
- `npm run build:dev` builds with development settings for debugging deploy issues.
- `npm run preview` serves the latest build locally.
- `npm run lint` runs ESLint across the TypeScript codebase.

## Coding Style & Naming Conventions
Use TypeScript with React function components and 2-space indentation, matching the existing files in `src/`. Prefer PascalCase for components and page files (`CheckoutSuccess.tsx`), `useX` for hooks (`useOrganization.ts`), and camelCase for utilities. Import shared modules through the configured `@/` alias instead of deep relative paths when practical. Styling is Tailwind-first; keep shadcn UI primitives in `src/components/ui/` and feature-specific composition outside that folder.

## Testing Guidelines
There is currently no automated test runner configured in `package.json`. Until one is added, every change should pass `npm run lint`, a local smoke test through `npm run dev`, and any relevant Supabase flow you touched. If you introduce tests, colocate them with the feature as `*.test.ts` or `*.test.tsx` and add the corresponding script to `package.json`.

## Commit & Pull Request Guidelines
Recent history uses short imperative subjects, sometimes with Conventional Commit prefixes such as `feat:` and `docs:`. Prefer concise messages like `feat: add Stripe checkout redirect` or `fix pricing redirect`. PRs should include a brief summary, linked issue or spec when available, screenshots for visible UI changes, and notes for any `.env`, Stripe, or Supabase migration impact.

## Security & Configuration Tips
Start from `.env.example`; never commit live secrets from `.env`. Review `EXTERNAL_SETUP_REQUIRED.md` before changing third-party integrations, and document payment or auth changes alongside the related spec in `docs/superpowers/specs/`.
