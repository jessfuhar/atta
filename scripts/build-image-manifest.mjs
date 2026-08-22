// Gera src/data/imageManifest.ts a partir dos arquivos em public/images.
// Roda antes de dev/build (ver package.json) — não editar o arquivo gerado manualmente.
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']);
const ROOT = join(process.cwd(), 'public', 'images');
const OUT = join(process.cwd(), 'src', 'data', 'imageManifest.ts');

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, files);
    } else if (IMAGE_EXT.has(entry.slice(entry.lastIndexOf('.')).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

let paths = [];
try {
  paths = walk(ROOT)
    .map((full) => '/images/' + relative(ROOT, full).split(sep).join('/'))
    .sort();
} catch {
  paths = [];
}

const content = `// Gerado automaticamente por scripts/build-image-manifest.mjs — não editar manualmente.
export const imageManifest: string[] = ${JSON.stringify(paths, null, 2)};
`;

mkdirSync(join(process.cwd(), 'src', 'data'), { recursive: true });
writeFileSync(OUT, content, 'utf8');
console.log(`imageManifest.ts gerado com ${paths.length} imagem(ns).`);
