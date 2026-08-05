#!/usr/bin/env bash
# Run after creating a new Soniox API key and copying wrangler.jsonc.example → wrangler.jsonc.
# Requires: wrangler logged in (`npx wrangler login`) or CLOUDFLARE_API_TOKEN set.

set -euo pipefail

if [[ ! -f .dev.vars ]]; then
  echo "Copy .dev.vars.example to .dev.vars and fill in values first." >&2
  exit 1
fi

read_dev_var() {
  node --input-type=module -e "
import { readFileSync } from 'node:fs';

const name = process.argv[1];
const contents = readFileSync('.dev.vars', 'utf8');
const line = contents.split('\n').find((entry) => entry.startsWith(\`\${name}=\`));
if (!line) {
  process.exit(1);
}

let value = line.slice(name.length + 1).trim();
if (
  (value.startsWith(\"'\") && value.endsWith(\"'\")) ||
  (value.startsWith('\"') && value.endsWith('\"'))
) {
  value = value.slice(1, -1);
}

process.stdout.write(value);
" "$1"
}

SONIOX_API_KEY="$(read_dev_var SONIOX_API_KEY)"
VAPID_PRIVATE_KEY="$(read_dev_var VAPID_PRIVATE_KEY)"

if [[ -z "$SONIOX_API_KEY" || "$SONIOX_API_KEY" == "your_soniox_api_key_here" ]]; then
  echo "Set SONIOX_API_KEY in .dev.vars before running this script." >&2
  exit 1
fi

if [[ -z "$VAPID_PRIVATE_KEY" ]]; then
  echo "Set VAPID_PRIVATE_KEY in .dev.vars before running this script." >&2
  exit 1
fi

node --input-type=module -e "JSON.parse(process.argv[1])" "$VAPID_PRIVATE_KEY"

printf '%s' "$SONIOX_API_KEY" | npx wrangler secret put SONIOX_API_KEY
printf '%s' "$VAPID_PRIVATE_KEY" | npx wrangler secret put VAPID_PRIVATE_KEY

echo "Production secrets updated."
echo "VAPID public key in wrangler.jsonc must match this private key pair."
