import { useSiteData, type ColorMatch } from '../data/siteData';
import type { KitItem } from '../data/types';
import { Gallery } from '../components/Gallery';
import { formatPrice } from '../lib/format';
import { withBase } from '../lib/assets';
import { Link } from '../lib/router';

interface KitPageProps {
  slug: string;
}

export function KitPage({ slug }: KitPageProps) {
  const { kits, resolveKitItem } = useSiteData();
  const kit = kits.find((k) => k.slug === slug);

  if (!kit) {
    return (
      <div className="mx-auto max-w-7xl safe-px pb-28 pt-40 text-center">
        <p className="font-display text-3xl">Kit não encontrado.</p>
        <Link to="/" className="mt-6 inline-block border-b border-ink pb-1 text-sm uppercase tracking-[0.12em]">
          Voltar para a home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl safe-px pb-28 pt-28 sm:pt-36">
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
        <Gallery images={kit.images} />

        <div>
          <h1 className="font-display text-3xl sm:text-4xl">{kit.name}</h1>
          <p className="mt-3 text-lg">{formatPrice(kit.price)}</p>
          {kit.description && <p className="mt-6 max-w-md text-sm text-muted">{kit.description}</p>}
        </div>
      </div>

      {kit.items.length > 0 && (
        <div className="mt-20 border-t border-line pt-10">
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-muted">Peças deste kit</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {kit.items.map((item, i) => (
              <KitItemTile key={`${item.productId}-${item.color}-${i}`} item={item} resolve={resolveKitItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KitItemTile({
  item,
  resolve,
}: {
  item: KitItem;
  resolve: (item: KitItem) => ColorMatch | null;
}) {
  const match = resolve(item);
  if (!match) return null;
  const { product, variant } = match;
  const thumb = variant.images[0];

  return (
    <Link to={`/produto/${product.slug}`} className="group flex items-center gap-3">
      <div className="h-16 w-16 flex-none overflow-hidden bg-canvas-alt">
        {thumb && (
          <img
            src={withBase(thumb.src)}
            alt={thumb.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm">{product.name}</p>
        <p className="text-xs text-muted">{item.color}</p>
        <p className="text-xs text-muted">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
