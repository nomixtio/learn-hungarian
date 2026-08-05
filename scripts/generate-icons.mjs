import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = join(root, 'website/public/assets/brand-mark.svg');
const svg = readFileSync(svgPath);

const outputs = [
	{ path: join(root, 'website/public/assets/favicon.png'), size: 32 },
	{ path: join(root, 'public/favicon.png'), size: 32 },
	{ path: join(root, 'public/apple-touch-icon.png'), size: 180 },
	{ path: join(root, 'public/logo192.png'), size: 192 },
	{ path: join(root, 'public/logo512.png'), size: 512 },
];

for (const { path, size } of outputs) {
	const png = await sharp(svg, { density: 600 })
		.resize(size, size, { kernel: sharp.kernel.lanczos3 })
		.png()
		.toBuffer();
	writeFileSync(path, png);
	console.log(`wrote ${path} (${size}x${size})`);
}

copyFileSync(svgPath, join(root, 'public/brand-mark.svg'));
console.log('wrote public/brand-mark.svg');
