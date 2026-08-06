import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = join(root, 'website/public/assets/brand-mark.svg');
const sourcePngPath = join(root, 'scripts/icon-source.png');
const svg = readFileSync(svgPath);
const rasterSource = existsSync(sourcePngPath) ? sourcePngPath : svg;

const outputs = [
	{ path: join(root, 'website/public/assets/favicon.png'), size: 32 },
	{ path: join(root, 'website/public/assets/apple-touch-icon.png'), size: 180 },
	{ path: join(root, 'public/favicon.png'), size: 32 },
	{ path: join(root, 'public/apple-touch-icon.png'), size: 180 },
	{ path: join(root, 'public/logo192.png'), size: 192 },
	{ path: join(root, 'public/logo512.png'), size: 512 },
];

for (const { path, size } of outputs) {
	const png = await sharp(rasterSource, { density: 600 })
		.resize(size, size, { kernel: sharp.kernel.lanczos3 })
		.png()
		.toBuffer();
	writeFileSync(path, png);
	console.log(`wrote ${path} (${size}x${size})`);
}

copyFileSync(svgPath, join(root, 'public/brand-mark.svg'));
console.log('wrote public/brand-mark.svg');
console.log(`raster source: ${existsSync(sourcePngPath) ? 'scripts/icon-source.png' : 'brand-mark.svg'}`);
