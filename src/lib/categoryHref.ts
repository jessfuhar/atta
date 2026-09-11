/** Id reservado: essa categoria não filtra produtos — aponta para a listagem de kits. */
export const KITS_CATEGORY_ID = 'kits';

export function categoryHref(id: string): string {
  return id === KITS_CATEGORY_ID ? '/kits' : `/categoria/${id}`;
}
