import { useState } from 'react';
import { useSiteData } from '../data/siteData';
import { Gallery } from '../components/Gallery';
import { formatPrice } from '../lib/format';
import { Link } from '../lib/router';

interface ProductPageProps {
  slug: string;
}

export function ProductPage({ slug }: ProductPageProps) {
  const { products } = useSiteData();
  const product = products.find((p) => p.slug === slug);
  const [variantIndex, setVariantIndex] = useState(0);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-28 pt-40 text-center sm:px-10">
        <p className="font-display text-3xl">Produto não encontrado.</p>
        <Link to="/" className="mt-6 inline-block border-b border-ink pb-1 text-sm uppercase tracking-[0.12em]">
          Voltar para a home
        </Link>
      </div>
    );
  }

  const variant = product.variants[Math.min(variantIndex, product.variants.length - 1)] ?? product.variants[0];

  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
        <Gallery key={variant?.color ?? 'sem-cor'} images={variant?.images ?? []} />

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{product.category}</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-lg">{formatPrice(product.price)}</p>

          {product.variants.length > 1 && (
            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Cor</p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v, i) => (
                  <button
                    key={v.color}
                    type="button"
                    onClick={() => setVariantIndex(i)}
                    title={v.color}
                    className={`h-9 w-9 rounded-full border-2 transition-colors ${
                      i === variantIndex ? 'border-ink' : 'border-transparent'
                    }`}
                  >
                    <span
                      className="block h-full w-full rounded-full border border-line"
                      style={{ backgroundColor: v.hex ?? '#ccc' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="flex h-9 min-w-9 items-center justify-center border border-line px-2 text-xs uppercase"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.description && <p className="mt-8 max-w-md text-sm text-muted">{product.description}</p>}
        </div>
      </div>
    </div>
  );
}
