// alchemy.run.ts — Cloudflare environments as code.
//
// Stages:
//   production  manual deploys from `master` (adopts the existing Worker + D1)
//   staging     auto-deploys from the `staging` branch (long-lived)
//   pr-<n>      ephemeral PR previews, own D1, destroyed on PR close
//   br-<slug>   ephemeral branch previews, own D1, destroyed on branch delete
//
// Local usage (requires `alchemy profile edit --add Cloudflare` once):
//   npx alchemy plan --stage staging
//   npx alchemy deploy --stage staging
//   npx alchemy destroy --stage br-my-feature --yes
//
// First production deploy adopts the Wrangler-managed resources:
//   npx alchemy deploy --stage production --adopt
//
// NOTE: alchemy@2.0.0-beta.77 requires effect@4.0.0-rc.112 (lowercase
// `Config.*` API). Newer effect RCs renamed it (`Config.String`) and break
// the alchemy CLI itself. Re-check when upgrading alchemy.
//
// Required env (see README "Environments"):
//   SONIOX_API_KEY, VAPID_PRIVATE_KEY (secrets)
// Optional env (sane defaults for previews):
//   SONIOX_REGION (default "eu"), VAPID_PUBLIC_KEY (default staging key below)
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { Stack } from "alchemy/Stack";
import * as GitHub from "alchemy/GitHub";
import * as Output from "alchemy/Output";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const COMPATIBILITY_DATE = "2026-08-04";

// Physical names for the long-lived stages. Preview stages use
// Alchemy-generated names so they can never collide.
const PROD_WORKER_NAME = "learn-hungarian";
const PROD_DB_NAME = "learn-hungarian";
const PROD_WEB_NAME = "learn-hungarian-web";
const STAGING_WORKER_NAME = "learn-hungarian-staging";
const STAGING_DB_NAME = "learn-hungarian-staging";
const STAGING_WEB_NAME = "learn-hungarian-web-staging";

// Public key is safe to default (it already ships in the client bundle).
// Override per stage with the VAPID_PUBLIC_KEY env var.
const DEFAULT_VAPID_PUBLIC_KEY =
	"BOuOtsVy_SDYO6QoIa730OzTyASX2xn08FaURQmirtuf-H0Iqf-y1RTD1ZTVsZGyGIqrnLreFbcIPk6DoDoZdOM";

export default Alchemy.Stack(
	"learn-hungarian",
	{
		providers: Layer.mergeAll(GitHub.providers(), Cloudflare.providers()),
		state: Cloudflare.state(),
	},
	Effect.gen(function* () {
		const stack = yield* Stack;
		const stage = stack.stage;

		const isProduction = stage === "production";
		const isStaging = stage === "staging";
		const isPreview = !isProduction && !isStaging;

		// Cron reminders send real push notifications — only on long-lived envs.
		const crons = isPreview ? [] : ["0 * * * *"];

		const db = yield* Cloudflare.D1.Database("db", {
			...(isProduction
				? { name: PROD_DB_NAME }
				: isStaging
					? { name: STAGING_DB_NAME }
					: {}),
			migrations: "./migrations",
		});

		const app = yield* Cloudflare.Worker("app", {
			...(isProduction
				? { name: PROD_WORKER_NAME }
				: isStaging
					? { name: STAGING_WORKER_NAME }
					: {}),
			main: "./worker/index.ts",
			compatibility: { date: COMPATIBILITY_DATE },
			assets: {
				directory: "./dist/client",
				notFoundHandling: "single-page-application",
				runWorkerFirst: ["/api/*"],
			},
			crons,
			env: {
				DB: db,
				// Empty string (unset GitHub var) must fall back too — `??` alone would keep "".
				SONIOX_REGION: process.env.SONIOX_REGION?.trim() || "eu",
				VAPID_PUBLIC_KEY:
					process.env.VAPID_PUBLIC_KEY?.trim() || DEFAULT_VAPID_PUBLIC_KEY,
				SONIOX_API_KEY: Config.redacted("SONIOX_API_KEY"),
				VAPID_PRIVATE_KEY: Config.redacted("VAPID_PRIVATE_KEY"),
			},
		});

		// Marketing site only exists on long-lived envs — previews don't need it.
		if (!isPreview) {
			yield* Cloudflare.Worker("web", {
				name: isProduction ? PROD_WEB_NAME : STAGING_WEB_NAME,
				assets: { directory: "./website/public" },
			});
		}

		// PR previews get an auto-updating comment with the preview URL.
		// Skipped for local/manual deploys (no PR context).
		const github = yield* GitHub.GitHubEnv;
		if (github?.pr) {
			yield* GitHub.Comment("preview-comment", {
				owner: github.owner,
				repository: github.repository,
				issueNumber: github.pr,
				body: Output.interpolate`
					## Preview deployed (${stage})

					**URL:** ${app.url}

					Built from commit ${github.sha.slice(0, 7)}. Isolated D1 database with
					migrations auto-applied. Cron reminders are disabled on previews.

					---
					_This comment updates automatically with each push. Destroyed on PR close._
				`,
			});
		}

		return { url: app.url, stage };
	}),
);
