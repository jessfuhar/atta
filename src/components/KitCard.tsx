import { useState } from 'react';
import type { Kit } from '../data/types';
import { formatPrice } from '../lib/format';
import { withBase } from '../lib/assets';
import { Link } from '../lib/router';

interface KitCardProps {
  kit: Kit;
  className?: string;
}

/** Card do kit: capa/hover próprios do kit, nome e preço do kit — nunca os produtos individuais. */
export function KitCard({ kit, className }: KitCardProps) {
  const [hovered, setHovered] = useState(false);
  const first = kit.images[0];
  const second = kit.images[1];

  return (
    <Link to={`/kit/${kit.slug}`} className={`group block ${className ?? ''}`}>
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
        <h3 className="text-sm">{kit.name}</h3>
        <p className="text-sm text-muted">{formatPrice(kit.price)}</p>
      </div>
    </Link>
  );
}
