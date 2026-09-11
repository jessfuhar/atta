import type { CategoryEntry } from '../data/types';
import { withBase } from '../lib/assets';
import { categoryHref } from '../lib/categoryHref';
import { Link } from '../lib/router';

interface CategoriesProps {
  categories: CategoryEntry[];
}

/** Vitrine circular por tipo de peça (inclui Kits) — rolagem horizontal com swipe, sem limite de itens. */
export function Categories({ categories }: CategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="safe-px py-4">
      <p className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">Categorias</p>

      <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1 sm:gap-8">
        {categories.map((category) => (
          <CategoryCircle key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}

function CategoryCircle({ category }: { category: CategoryEntry }) {
  return (
    <Link
      to={categoryHref(category.id)}
      className="group flex w-20 flex-none snap-start flex-col items-center gap-3 sm:w-24"
    >
      <div className="aspect-square w-20 overflow-hidden rounded-full bg-canvas-alt sm:w-24">
        {category.image?.src ? (
          <img
            src={withBase(category.image.src)}
            alt={category.image.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-xl text-muted">
            {category.label.charAt(0)}
          </span>
        )}
      </div>
      <span className="text-center text-xs uppercase tracking-[0.1em]">{category.label}</span>
    </Link>
  );
}
