import { useMemo } from 'react';
import { useSiteData } from '../data/siteData';
import { ProductCard } from '../components/ProductCard';
import { Link } from '../lib/router';

interface ColorCategoryPageProps {
  id: string;
}

/** Reúne produtos pela cor da variante (sem duplicar dados) — ver getProductsByColorLabel em data/siteData. */
export function ColorCategoryPage({ id }: ColorCategoryPageProps) {
  const { colorCategories, getProductsByColorLabel } = useSiteData();
  const category = colorCategories.find((c) => c.id === id);
  const products = useMemo(
    () => (category ? getProductsByColorLabel(category.label) : []),
    [category, getProductsByColorLabel],
  );

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-28 pt-40 text-center sm:px-10">
        <p className="font-display text-3xl">Cor não encontrada.</p>
        <Link to="/" className="mt-6 inline-block border-b border-ink pb-1 text-sm uppercase tracking-[0.12em]">
          Voltar para a home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
      <header className="flex items-center gap-3 border-b border-line pb-8">
        <span
          className="h-6 w-6 flex-none rounded-full border border-line"
          style={{ backgroundColor: category.hex }}
        />
        <div>
          <h1 className="font-display text-4xl sm:text-6xl">{category.label}</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
            {products.length} {products.length === 1 ? 'peça' : 'peças'}
          </p>
        </div>
      </header>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 py-10 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-sm text-muted">
          Nenhuma peça com essa cor ainda. No admin, o nome da cor precisa bater com a cor cadastrada
          nas variantes do produto.
        </p>
      )}
    </div>
  );
}
