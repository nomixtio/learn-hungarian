/** Soniox REST API base URL for the project's data-residency region. */
export function sonioxApiOrigin(region?: string): string {
	const normalized = region?.trim().toLowerCase();
	if (!normalized || normalized === 'us') {
		return 'https://api.soniox.com';
	}
	return `https://api.${normalized}.soniox.com`;
}

export function sonioxTemporaryKeyUrl(region?: string): string {
	return `${sonioxApiOrigin(region)}/v1/auth/temporary-api-key`;
}
