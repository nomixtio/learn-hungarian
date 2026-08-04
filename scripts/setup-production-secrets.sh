#!/usr/bin/env bash
# Run after creating a new Soniox API key and copying wrangler.jsonc.example → wrangler.jsonc.
# Requires: wrangler logged in (`npx wrangler login`) or CLOUDFLARE_API_TOKEN set.

set -euo pipefail

if [[ ! -f .dev.vars ]]; then
  echo "Copy .dev.vars.example to .dev.vars and fill in values first." >&2
  exit 1
fi

# shellcheck disable=SC1091
source .dev.vars

if [[ -z "${SONIOX_API_KEY:-}" || "${SONIOX_API_KEY}" == "your_soniox_api_key_here" ]]; then
  echo "Set SONIOX_API_KEY in .dev.vars before running this script." >&2
  exit 1
fi

printf '%s' "$SONIOX_API_KEY" | npx wrangler secret put SONIOX_API_KEY
printf '%s' "$VAPID_PRIVATE_KEY" | npx wrangler secret put VAPID_PRIVATE_KEY

echo "Production secrets updated. Deploy with: npm run deploy"
