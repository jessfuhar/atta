import { useState } from 'react';
import { useSiteData } from '../data/siteData';
import { Gallery } from '../components/Gallery';
import { formatPrice } from '../lib/format';
import { Link } from '../lib/router';
import { STANDARD_SIZES, availableSizesFor } from '../lib/sizes';

interface ProductPageProps {
  slug: string;
  /** Cor inicial vinda de um link de categoria/cor (ex.: /produto/:slug/2) — undefined usa a 1ª cor. */
  initialVariantIndex?: number;
}

export function ProductPage({ slug, initialVariantIndex }: ProductPageProps) {
  const { products } = useSiteData();
  const product = products.find((p) => p.slug === slug);
  const [variantIndex, setVariantIndex] = useState(initialVariantIndex ?? 0);
  const [sizeSelection, setSizeSelection] = useState<{ variantIndex: number; size: string } | null>(null);
  const selectedSize = sizeSelection?.variantIndex === variantIndex ? sizeSelection.size : null;

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl safe-px pb-28 pt-40 text-center">
        <p className="font-display text-3xl">Produto não encontrado.</p>
        <Link to="/" className="mt-6 inline-block border-b border-ink pb-1 text-sm uppercase tracking-[0.12em]">
          Voltar para a home
        </Link>
      </div>
    );
  }

  const variant = product.variants[Math.min(variantIndex, product.variants.length - 1)] ?? product.variants[0];
  const availableSizes = availableSizesFor(product, variant ?? { sizes: undefined });
  const description = variant?.description?.trim() || product.description;

  return (
    <div className="mx-auto max-w-6xl safe-px pb-28 pt-28 sm:pt-36">
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

          <div className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Tamanho</p>
            <div className="flex flex-wrap gap-2">
              {STANDARD_SIZES.map((size) => {
                const isAvailable = availableSizes.includes(size);
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable}
                    aria-pressed={isSelected}
                    onClick={() => setSizeSelection({ variantIndex, size })}
                    className={`relative flex h-9 min-w-9 items-center justify-center overflow-hidden border px-2 text-xs uppercase transition-colors ${
                      !isAvailable
                        ? 'cursor-not-allowed border-line text-muted/60'
                        : isSelected
                          ? 'border-ink bg-ink text-canvas'
                          : 'border-line text-ink hover:border-ink'
                    }`}
                  >
                    {size}
                    {!isAvailable && (
                      <span className="pointer-events-none absolute inset-0" aria-hidden="true">
                        <span className="absolute left-1/2 top-1/2 h-px w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-muted" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {description && <p className="mt-8 max-w-md text-sm text-muted">{description}</p>}
        </div>
      </div>
    </div>
  );
}
