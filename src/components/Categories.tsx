import type { CategoryEntry } from '../data/types';
import { Link } from '../lib/router';

interface CategoriesProps {
  categories: CategoryEntry[];
}

/** Nav compacta por tipo de peça — texto, sem fotos: rápida de escanear e não domina a tela no mobile. */
export function Categories({ categories }: CategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="safe-px py-4">
      <p className="mb-5 text-xs uppercase tracking-[0.3em] text-muted">Categorias</p>

      <div className="flex flex-wrap gap-2.5">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categoria/${category.id}`}
            className="border border-line px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors hover:border-ink"
          >
            {category.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
