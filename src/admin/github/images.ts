const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_SIZE = 8 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!(file.type in ALLOWED_TYPES)) return `Formato não suportado (${file.name}). Use JPG, PNG ou WEBP.`;
  if (file.size > MAX_SIZE) return `Arquivo muito grande (${file.name}). Máximo 8MB.`;
  return null;
}

export function imageExt(file: File): string {
  return ALLOWED_TYPES[file.type] ?? 'jpg';
}

export function productImagePath(productSlug: string, colorSlug: string, index: number, ext: string) {
  return `public/images/products/${productSlug}/${colorSlug}-${index + 1}.${ext}`;
}

export function categoryImagePath(categoryId: string, ext: string) {
  return `public/images/categories/${categoryId}.${ext}`;
}

export function colorImagePath(colorId: string, ext: string) {
  return `public/images/colors/${colorId}.${ext}`;
}

export function homeImagePath(kind: 'hero' | 'editorial', ext: string) {
  return `public/images/collections/${kind}.${ext}`;
}

export function toPublicSrc(repoPath: string) {
  return '/' + repoPath.replace(/^public\//, '');
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
