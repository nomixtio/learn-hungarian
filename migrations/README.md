# D1 migrations

Schema for client settings, push subscriptions, spaced-repetition progress, and quiz attempts (`0001_init.sql`).

1. Create the remote database:

```bash
npx wrangler d1 create learn-hungarian
```

2. Paste the returned `database_id` into `wrangler.jsonc` under `d1_databases`.

3. Add a migration SQL file here (e.g. `0001_init.sql`), then apply:

```bash
npx wrangler d1 migrations apply learn-hungarian --local
npx wrangler d1 migrations apply learn-hungarian --remote
```

Access the binding from Hono as `c.env.DB`.
