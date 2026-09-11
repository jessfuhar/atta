import { useMemo } from 'react';
import { useSiteData } from '../data/siteData';
import { ProductCard } from '../components/ProductCard';
import { Link } from '../lib/router';

interface ColorCategoryPageProps {
  id: string;
}

/** Reúne produtos pela cor da variante (sem duplicar dados) — cada card mostra só a variante daquela cor, sem fallback. */
export function ColorCategoryPage({ id }: ColorCategoryPageProps) {
  const { colorCategories, getColorMatches } = useSiteData();
  const category = colorCategories.find((c) => c.id === id);
  const matches = useMemo(
    () => (category ? getColorMatches(category.label) : []),
    [category, getColorMatches],
  );

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl safe-px pb-28 pt-40 text-center">
        <p className="font-display text-3xl">Cor não encontrada.</p>
        <Link to="/" className="mt-6 inline-block border-b border-ink pb-1 text-sm uppercase tracking-[0.12em]">
          Voltar para a home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl safe-px pb-28 pt-28 sm:pt-36">
      <header className="flex items-center gap-3 border-b border-line pb-8">
        <span
          className="h-6 w-6 flex-none rounded-full border border-line"
          style={{ backgroundColor: category.hex }}
        />
        <div>
          <h1 className="font-display text-4xl sm:text-6xl">{category.label}</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
            {matches.length} {matches.length === 1 ? 'peça' : 'peças'}
          </p>
        </div>
      </header>

      {matches.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 py-10 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
          {matches.map(({ product, variant }) => (
            <ProductCard
              key={product.id}
              product={product}
              variant={variant}
              to={`/produto/${product.slug}/${product.variants.indexOf(variant)}`}
            />
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
