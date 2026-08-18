# Learn Hungarian

Vite + React PWA for learning Hungarian — live speech-to-English translation and practice via Soniox. Deployed as a Cloudflare Worker with static assets and a Hono API.

**Repository:** [github.com/nomixtio/learn-hungarian](https://github.com/nomixtio/learn-hungarian)

## Self-hosting

You need:

- A [Soniox](https://console.soniox.com) account with an API key (live speech translation)
- A [Cloudflare](https://dash.cloudflare.com) account for Workers and D1
- Node.js 20+

```bash
npm install
cp wrangler.jsonc.example wrangler.jsonc
cp .dev.vars.example .dev.vars
```

Edit `wrangler.jsonc`:

1. Set `VAPID_PUBLIC_KEY` (generate with `npx @pushforge/builder vapid`)
2. Create a D1 database (`npx wrangler d1 create learn-hungarian`) and paste the `database_id`
3. Apply migrations: `npx wrangler d1 migrations apply learn-hungarian --local` (and `--remote` for production)

Edit `.dev.vars`:

1. Set `SONIOX_API_KEY` from the Soniox console (must match `SONIOX_REGION` in `wrangler.jsonc`)
2. Set `VAPID_PRIVATE_KEY` (JWK JSON from the same `vapid` command — keep the value in single quotes in `.dev.vars`)

For production, also set Worker secrets (never commit these):

```bash
./scripts/setup-production-secrets.sh
```

Or set secrets manually (do not paste the VAPID JWK by hand — use the script above):

```bash
npx wrangler secret put SONIOX_API_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
```

Then run locally:

```bash
npm run dev
```

Deploy:

```bash
npm run deploy
```

## Get started (quick)

```bash
npm install
cp wrangler.jsonc.example wrangler.jsonc
cp .dev.vars.example .dev.vars
# Edit both files — see Self-hosting above
npm run dev
```

Open the local Vite URL. The Cloudflare Vite plugin runs the Worker (Hono API) and the SPA together. Microphone access works on `localhost` without HTTPS.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + Worker local development |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Build and preview in the Workers runtime |
| `npm run deploy` | Bump build number, build, and deploy with Wrangler |
| `npm run deploy:website` | Deploy the marketing site Worker (`website/`) |
| `npm run dev:website` | Preview the marketing site locally |
| `npm run build:audio-catalog` | Regenerate `src/lib/audio-catalog.ts` after vocabulary changes |
| `npm run generate:audio` | Generate course MP3s with ElevenLabs (both voices) |
| `npm run generate:audio:female` | Generate female voice MP3s only |
| `npm run generate:audio:male` | Generate male voice MP3s only |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` after Wrangler config changes |

`predeploy` bumps [`src/app-version.json`](src/app-version.json). The client compares that baked-in build to `GET /api/meta` and prompts to refresh when a newer deploy is live (useful for installed PWAs).

## Secrets

The long-lived Soniox API key **never** ships to the browser.

- **Local:** `.dev.vars` (gitignored) — see [`.dev.vars.example`](.dev.vars.example)
- **Wrangler config:** copy [`wrangler.jsonc.example`](wrangler.jsonc.example) to `wrangler.jsonc` (gitignored)
- **Production:** `npx wrangler secret put SONIOX_API_KEY` and `npx wrangler secret put VAPID_PRIVATE_KEY`
- **Region:** set `SONIOX_REGION` in `wrangler.jsonc` (`eu`, `jp`, or omit for US). API keys are region-scoped — an EU project key only works with `SONIOX_REGION=eu`. Local dev: add `SONIOX_REGION=eu` to `.dev.vars` if needed.

The SPA calls `POST /api/soniox/temporary-key`, which mints a short-lived Soniox temporary API key for live speech-to-text translation on the Translate page.

Course vocabulary audio is served from pre-generated MP3 files under `public/audio/` (no Soniox TTS at runtime).

## Regenerating course audio

When vocabulary or voice settings change:

1. Add `ELEVENLABS_API_KEY` to `.dev.vars` (see [`.dev.vars.example`](.dev.vars.example))
2. If course vocabulary changed, regenerate the audio ID catalog:
   ```bash
   npm run build:audio-catalog
   ```
3. Edit voice IDs at the top of [`scripts/generate-audio.ts`](scripts/generate-audio.ts) if you want different actors
4. Run the generator (skips existing files; pass `--force` to regenerate all):

```bash
npm run generate:audio              # both voices
npm run generate:audio:female       # female only
npm run generate:audio:male         # male only
npm run generate:audio -- --force   # regenerate all
```

5. Commit the updated files in `public/audio/` and any changes to `src/lib/audio-catalog.ts`

No ElevenLabs key is needed to run or deploy the app — MP3s are static assets on the CDN.

**Troubleshooting translate / STT errors**

1. Confirm the key works: in [Soniox console](https://console.soniox.com), create or copy an API key with STT access.
2. Re-set the secret: `npx wrangler secret put SONIOX_API_KEY` and paste the key once.
3. After a failed deploy, secrets persist — you do not need to redeploy only for a secret change, but redeploy if Worker code changed.
4. If the app shows *"Soniox API key is invalid or does not match SONIOX_REGION"*, the key is from a different Soniox region than configured (e.g. EU key with US endpoints). Set `SONIOX_REGION` in `wrangler.jsonc` to match your Soniox project.

## API abuse protection

`POST /api/soniox/temporary-key` is protected in the Worker by:

- **Same-site checks** — rejects cross-origin requests without a matching `Origin`/`Referer`
- **Per-IP rate limiting** — 30 requests per minute via the Cache API

For production deployments, also add a [Cloudflare WAF rate limiting rule](https://developers.cloudflare.com/waf/rate-limiting-rules/) on `/api/soniox/*` as defense in depth.

## Deploy to Cloudflare

```bash
npm run deploy
```

Or wire CI to `npm run deploy` with Cloudflare API credentials stored in GitHub Actions secrets (not in source). This project is a **Worker with static assets**, not a Pages-only site.

## Marketing site

The public landing page lives in [`website/`](website/) and deploys as a **separate** Worker (`learn-hungarian-web`). It points visitors to GitHub / self-hosting only — there is no link to a hosted app instance.

```bash
npm run dev:website      # local preview
npm run deploy:website   # deploy marketing Worker
```

Attach a custom domain in the Cloudflare dashboard under the `learn-hungarian-web` Worker (Custom Domains). Keep the app Worker on `*.workers.dev` (or its own domain) separately.

## D1

Wrangler binds `DB` (D1). Create the database when you need schema:

```bash
npx wrangler d1 create learn-hungarian
```

Paste the returned `database_id` into `wrangler.jsonc`, add SQL under [`migrations/`](migrations/), then:

```bash
npx wrangler d1 migrations apply learn-hungarian --local
npx wrangler d1 migrations apply learn-hungarian --remote
```

Use `c.env.DB` from Hono routes.

## Install as PWA

After deploying over HTTPS:

- **Chrome / Edge:** Install icon in the address bar, or **Install app** from the menu
- **Safari (iOS):** Share → **Add to Home Screen**

## Requirements

- HTTPS is required for microphone access in production (Cloudflare provides this)
- Live translation needs a network connection to Soniox
- `SONIOX_API_KEY` must be set for temporary-key minting

## Project structure

```
src/                 # React SPA (TanStack Router + Tailwind)
worker/              # Hono API on Cloudflare Workers
website/             # Marketing site (separate Worker, custom domain)
migrations/          # D1 migrations
public/              # PWA manifest, icons, and course audio (public/audio/)
wrangler.jsonc.example  # Copy to wrangler.jsonc (gitignored)
```
