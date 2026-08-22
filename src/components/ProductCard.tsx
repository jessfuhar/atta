import { useState } from 'react';
import type { Product } from '../data/types';
import { formatPrice } from '../lib/format';
import { withBase } from '../lib/assets';
import { Link } from '../lib/router';

interface ProductCardProps {
  product: Product;
  className?: string;
}

/** Preferidos/Home usam só a 1ª foto (2ª no hover) — o restante da galeria vive na página do produto. */
export function ProductCard({ product, className }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const images = product.variants[0]?.images ?? [];
  const first = images[0];
  const second = images[1];

  return (
    <Link to={`/produto/${product.slug}`} className={`group block ${className ?? ''}`}>
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
        <h3 className="text-sm">{product.name}</h3>
        <p className="text-sm text-muted">{formatPrice(product.price)}</p>
      </div>
      {product.variants.length > 1 && (
        <div className="mt-2 flex gap-1.5">
          {product.variants.map((variant) => (
            <span
              key={variant.color}
              title={variant.color}
              className="h-3 w-3 rounded-full border border-line"
              style={{ backgroundColor: variant.hex ?? '#ccc' }}
            />
          ))}
        </div>
      )}
    </Link>
  );
}
