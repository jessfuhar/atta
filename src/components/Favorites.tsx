import type { Product } from '../data/types';
import { ProductCard } from './ProductCard';

interface FavoritesProps {
  title: string;
  products: Product[];
}

/** Vitrine curta da Home — título editável em data/home.ts. */
export function Favorites({ title, products }: FavoritesProps) {
  if (products.length === 0) return null;

  return (
    <section className="px-6 py-4 sm:px-10">
      <p className="mb-10 text-xs uppercase tracking-[0.3em] text-muted">{title}</p>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
