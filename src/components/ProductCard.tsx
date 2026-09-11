import { useState } from 'react';
import type { Product, ProductVariant } from '../data/types';
import { formatPrice } from '../lib/format';
import { withBase } from '../lib/assets';
import { Link } from '../lib/router';

interface ProductCardProps {
  product: Product;
  className?: string;
  /** Força a variante mostrada (ex.: página de uma cor específica) — sem isso, usa a 1ª cor cadastrada. */
  variant?: ProductVariant;
  /** Mostra o nome da cor abaixo do produto (ex.: categoria por tipo, listando todas as variantes). */
  showVariantColor?: boolean;
  /** Sobrescreve o link padrão (ex.: já abrir o produto com a cor certa selecionada). */
  to?: string;
}

/** Preferidos/Home usam só a 1ª foto (2ª no hover) — o restante da galeria vive na página do produto. */
export function ProductCard({ product, className, variant, showVariantColor, to }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const activeVariant = variant ?? product.variants[0];
  const images = activeVariant?.images ?? [];
  const first = images[0];
  const second = images[1];

  return (
    <Link to={to ?? `/produto/${product.slug}`} className={`group block ${className ?? ''}`}>
      <div
        className="relative aspect-[4/5] overflow-hidden bg-canvas-alt"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {first && (
          <img
            src={withBase(first.src)}
            alt={first.alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {second && (
          <img
            src={withBase(second.src)}
            alt={second.alt}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              hovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 text-sm">{product.name}</h3>
        <p className="flex-none text-sm text-muted">{formatPrice(product.price)}</p>
      </div>
      {showVariantColor && activeVariant ? (
        <p className="mt-1 text-xs text-muted">{activeVariant.color}</p>
      ) : (
        product.variants.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.variants.map((v) => (
              <span
                key={v.color}
                title={v.color}
                className="h-3 w-3 flex-none rounded-full border border-line"
                style={{ backgroundColor: v.hex ?? '#ccc' }}
              />
            ))}
          </div>
        )
      )}
    </Link>
  );
}
