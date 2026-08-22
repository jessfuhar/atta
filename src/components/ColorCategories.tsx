import type { ColorCategory } from '../data/types';
import { withBase } from '../lib/assets';
import { Link } from '../lib/router';

interface ColorCategoriesProps {
  colorCategories: ColorCategory[];
}

/** Vitrine de categorias por cor — mesmo layout de Categories, mas sem imagem usa um swatch do hex. */
export function ColorCategories({ colorCategories }: ColorCategoriesProps) {
  if (colorCategories.length === 0) return null;

  return (
    <section id="cores" className="py-4">
      <p className="mb-8 px-6 text-xs uppercase tracking-[0.3em] text-muted sm:px-10">Cores</p>

      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:gap-6 sm:px-10">
        {colorCategories.map((category) => (
          <ColorTile key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}

function ColorTile({ category }: { category: ColorCategory }) {
  return (
    <Link
      to={`/cor/${category.id}`}
      className="group flex w-[58vw] flex-none snap-start flex-col sm:w-56 md:w-64 lg:w-72"
    >
      <div className="aspect-[3/4] overflow-hidden bg-canvas-alt">
        {category.image?.src ? (
          <img
            src={withBase(category.image.src)}
            alt={category.image.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <span className="block h-full w-full transition-transform duration-700 group-hover:scale-105" style={{ backgroundColor: category.hex }} />
        )}
      </div>
      <span className="mt-3 font-display text-lg sm:text-xl">{category.label}</span>
    </Link>
  );
}
