// Gera src/data/imageManifest.ts a partir das fotos reais em public/images.
// Roda antes de dev/build (ver package.json) — não editar o arquivo gerado manualmente.
//
// Fica de fora da biblioteca do admin (propositalmente):
// - arquivos .svg (hoje são todos placeholders temporários);
// - a pasta public/images/brand (logo oficial, não deve ser trocada por aqui).
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const REAL_IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const EXCLUDED_DIRS = new Set(['brand']);
const ROOT = join(process.cwd(), 'public', 'images');
const OUT = join(process.cwd(), 'src', 'data', 'imageManifest.ts');

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry)) continue;
      walk(full, files);
    } else {
      const ext = entry.slice(entry.lastIndexOf('.')).toLowerCase();
      if (REAL_IMAGE_EXT.has(ext)) files.push({ full, mtimeMs: stat.mtimeMs });
    }
  }
  return files;
}

let entries = [];
try {
  entries = walk(ROOT)
    .map(({ full, mtimeMs }) => ({
      src: '/images/' + relative(ROOT, full).split(sep).join('/'),
      addedAt: Math.round(mtimeMs),
    }))
    .sort((a, b) => b.addedAt - a.addedAt);
} catch {
  entries = [];
}

const content = `// Gerado automaticamente por scripts/build-image-manifest.mjs — não editar manualmente.
export interface ManifestImage {
  src: string;
  addedAt: number;
}

export const imageManifest: ManifestImage[] = ${JSON.stringify(entries, null, 2)};
`;

mkdirSync(join(process.cwd(), 'src', 'data'), { recursive: true });
writeFileSync(OUT, content, 'utf8');
console.log(`imageManifest.ts gerado com ${entries.length} foto(s) real(is) (SVGs de placeholder e /brand ficam fora).`);
