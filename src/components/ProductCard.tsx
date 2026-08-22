import { useState } from 'react';
import type { Product } from '../data/types';
import { formatPrice } from '../lib/format';
import { withBase } from '../lib/assets';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const images = product.variants[0]?.images ?? [];
  const image = hovered && images[1] ? images[1] : images[0];

  return (
    <article className={className}>
      <div
        className="aspect-[4/5] overflow-hidden bg-canvas-alt"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {image && (
          <img
            src={withBase(image.src)}
            alt={image.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-opacity duration-500"
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
    </article>
  );
}
