const DIACRITICS = new RegExp('[̀-ͯ]', 'g');

export function slugify(input: string): string {
  const base = input
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'item';
}

export function uniqueSlug(input: string, taken: string[]): string {
  const base = slugify(input);
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
