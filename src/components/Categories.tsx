import type { CategoryEntry } from '../data/types';
import { withBase } from '../lib/assets';
import { Link } from '../lib/router';

interface CategoriesProps {
  categories: CategoryEntry[];
}

/** Vitrine horizontal: rolagem por toque/mouse com snap, mesma altura de imagem para todas as categorias. */
export function Categories({ categories }: CategoriesProps) {
  return (
    <section id="categorias" className="py-4">
      <p className="mb-8 px-6 text-xs uppercase tracking-[0.3em] text-muted sm:px-10">Categorias</p>

      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:gap-6 sm:px-10">
        {categories.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}

function CategoryTile({ category }: { category: CategoryEntry }) {
  return (
    <Link
      to={`/categoria/${category.id}`}
      className="group flex w-[58vw] flex-none snap-start flex-col sm:w-56 md:w-64 lg:w-72"
    >
      <div className="aspect-[3/4] overflow-hidden bg-canvas-alt">
        <img
          src={withBase(category.image.src)}
          alt={category.image.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <span className="mt-3 font-display text-lg sm:text-xl">{category.label}</span>
    </Link>
  );
}
