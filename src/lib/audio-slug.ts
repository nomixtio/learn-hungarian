const DIACRITICS: Record<string, string> = {
	á: 'a',
	é: 'e',
	í: 'i',
	ó: 'o',
	ö: 'o',
	ő: 'o',
	ú: 'u',
	ü: 'u',
	ű: 'u',
	Á: 'a',
	É: 'e',
	Í: 'i',
	Ó: 'o',
	Ö: 'o',
	Ő: 'o',
	Ú: 'u',
	Ü: 'u',
	Ű: 'u',
};

/** ASCII slug for audio filenames — stable across platforms. */
export function slugifyHungarian(text: string): string {
	let normalized = text.normalize('NFC');
	for (const [from, to] of Object.entries(DIACRITICS)) {
		normalized = normalized.split(from).join(to);
	}

	return normalized
		.toLowerCase()
		.replace(/…/g, '')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}
