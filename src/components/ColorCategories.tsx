import type { ColorCategory } from '../data/types';
import { Link } from '../lib/router';

interface ColorCategoriesProps {
  colorCategories: ColorCategory[];
}

/** Nav compacta por cor: bolinha + nome, quebra linha livremente — nunca limitada a um número fixo de cores. */
export function ColorCategories({ colorCategories }: ColorCategoriesProps) {
  if (colorCategories.length === 0) return null;

  return (
    <section className="safe-px py-4">
      <p className="mb-5 text-xs uppercase tracking-[0.3em] text-muted">Cores</p>

      <div className="flex flex-wrap gap-x-5 gap-y-4">
        {colorCategories.map((category) => (
          <Link key={category.id} to={`/cor/${category.id}`} className="group flex items-center gap-2">
            <span
              className="h-7 w-7 flex-none rounded-full border border-line"
              style={{ backgroundColor: category.hex }}
            />
            <span className="whitespace-nowrap text-xs uppercase tracking-[0.1em] text-muted transition-colors group-hover:text-ink">
              {category.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
