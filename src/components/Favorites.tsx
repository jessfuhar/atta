import type { Product, ProductVariant } from '../data/types';
import { ProductCard } from './ProductCard';

export interface FavoriteItem {
  product: Product;
  variant: ProductVariant;
  variantIndex: number;
}

interface FavoritesProps {
  title: string;
  items: FavoriteItem[];
}

/** Vitrine curta da Home — título editável em data/home.ts; cor de cada produto vem de home.favoriteVariantColor. */
export function Favorites({ title, items }: FavoritesProps) {
  if (items.length === 0) return null;

  return (
    <section className="safe-px py-4">
      <p className="mb-10 text-xs uppercase tracking-[0.3em] text-muted">{title}</p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-8">
        {items.map(({ product, variant, variantIndex }) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={variant}
            to={`/produto/${product.slug}/${variantIndex}`}
          />
        ))}
      </div>
    </section>
  );
}
