# Web PWA (Vite + React SPA, Hono API on Cloudflare Workers)

Vite + React 19 PWA + Hono API in `worker/`, deployed as one Worker with static assets (`dist/client`) + D1. No Expo/RN code. `website/` is a separate static marketing Worker.

## Commands

- `npm run dev` — Vite + Worker together (mic works on localhost, needs `.dev.vars`)
- `npm run build` — typechecks (app, worker, worker tests) + `vite build`. Always run before deploy work.
- `npm run test` / `npm run test:worker` — vitest suites; single file: `npx vitest run <path> --config vitest.config.ts` (or `test/worker/vitest.config.ts` for worker tests)
- `npm run test:e2e` — Playwright; fresh checkouts need `npm run test:e2e:setup` (local D1 migrate) + `npx playwright install --with-deps chromium` first
- `npm run deploy:staging` / `npm run deploy:production` — build + Alchemy deploy (production is manual CI dispatch in practice)
- `npx alchemy plan --stage <name>` — preview infra changes, applies nothing

## Gotchas

- `.npmrc` sets `legacy-peer-deps=true` (Alchemy wants Vite 8, app uses Vite 6). Always use `npm ci`, never switch resolvers.
- **Pinned versions, do not "fix"**: `alchemy` + `effect` + `@effect/platform-*` are exact-pinned (`2.0.0-beta.77` / `4.0.0-rc.112`, lowercase `Config.*` API — newer RCs renamed to `Config.String` and break the Alchemy CLI itself; ranged `^` once resolved alchemy to an unpublished `pipeline-v2-test` tag). `dependabot.yml` ignores this cluster. React must stay `^19.2.7` (dedupes Alchemy's nested copy; duplicates crash its CLI). `@testing-library/dom` is an explicit dep because legacy-peer-deps skips peers.
- `wrangler.jsonc` and `.dev.vars` are gitignored; bootstrap from the `.example` files. `vite build` needs `wrangler.jsonc` present.
- `tsconfig.scripts.json` has pre-existing jest-dom matcher errors in test files — only `alchemy.run.ts` errors in that project are actionable.
- `src/app-version.json` `build` must be bumped by hand in release PRs (CI deploy path skips the old `predeploy` bump; the PWA update prompt keys off it).
- Alchemy secrets come from process env (`Config.redacted` fails fast if missing). `SONIOX_REGION`/`VAPID_PUBLIC_KEY` use `||` fallbacks, not `??` — empty string must mean unset.

## Infra (Alchemy, `alchemy.run.ts`)

- Stages: `production` (manual, from `master`), `staging` (auto from `staging` branch), `pr-<n>` / `br-<slug>` (ephemeral, share the staging D1). Stage names must match `[a-z0-9]+([-_a-z0-9]+)*`.
- Previews share the staging D1 (writes affect staging data; previews never run migrations) and get **no cron** (cron sends real push notifications — only staging/production set `crons`). Marketing site deploys to long-lived stages only.
- CI (`ci.yml`): `test` → `deploy-staging` (staging ref only) / `deploy-preview` (PRs + other branches). `preview.yml` is destroy-only. Never add `--adopt` to any workflow — one-time production adoption is done.
- `alchemy destroy` evaluates the full stack, so destroy jobs need the app secrets too, not just Cloudflare creds.
- D1 migrations live in `migrations/` and auto-apply on deploy; local worker tests use isolated D1, E2E uses `--local`.
