// Secrets are not declared in wrangler.jsonc; augment generated Env.
declare namespace Cloudflare {
	interface Env {
		DB: D1Database;
		SONIOX_API_KEY: string;
		/** Soniox data-residency region: `eu`, `jp`, or omit/`us` for United States. */
		SONIOX_REGION?: string;
		/** VAPID public key for web push (base64url). */
		VAPID_PUBLIC_KEY: string;
		/** VAPID private key (JWK JSON string). Set via `wrangler secret put VAPID_PRIVATE_KEY`. */
		VAPID_PRIVATE_KEY: string;
	}
}

export type Env = Cloudflare.Env;
