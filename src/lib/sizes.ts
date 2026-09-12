import type { Product, ProductVariant } from '../data/types';

/** Único conjunto de tamanhos do site — toda cor de todo produto usa esta mesma lista. */
export const STANDARD_SIZES = ['P', 'M', 'G', 'GG'] as const;

/** Tamanhos padrão disponíveis nesta cor — sem sizes definido na variante, cai no fallback dos tamanhos gerais do produto. */
export function availableSizesFor(product: Pick<Product, 'sizes'>, variant: Pick<ProductVariant, 'sizes'>): string[] {
  const base = variant.sizes ?? product.sizes;
  return STANDARD_SIZES.filter((size) => base.includes(size));
}
