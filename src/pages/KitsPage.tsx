import { useSiteData } from '../data/siteData';
import { KitCard } from '../components/KitCard';
import { Link } from '../lib/router';

interface KitsPageProps {
  /** Presente em /kits/categoria/:id — filtra a listagem só pelos kits dessa categoria. */
  categoryId?: string;
}

/** Lista os kits ativos — destino do item "Kits" no header e na vitrine circular de categorias; filtrável por categoria de kit. */
export function KitsPage({ categoryId }: KitsPageProps) {
  const { kits, kitCategories } = useSiteData();
  const activeKits = kits.filter((k) => k.active);
  const category = categoryId ? kitCategories.find((c) => c.id === categoryId) : undefined;
  const visibleKits = category ? activeKits.filter((k) => k.categoryId === category.id) : activeKits;

  return (
    <div className="mx-auto max-w-7xl safe-px pb-28 pt-28 sm:pt-36">
      <header className="border-b border-line pb-8">
        <h1 className="font-display text-4xl sm:text-6xl">{category ? category.label : 'Kits'}</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
          {visibleKits.length} {visibleKits.length === 1 ? 'kit' : 'kits'}
        </p>
      </header>

      {kitCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 py-6">
          <Link
            to="/kits"
            className={`border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
              !category ? 'border-ink bg-ink text-canvas' : 'border-line text-ink'
            }`}
          >
            Todos
          </Link>
          {kitCategories.map((c) => (
            <Link
              key={c.id}
              to={`/kits/categoria/${c.id}`}
              className={`border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
                category?.id === c.id ? 'border-ink bg-ink text-canvas' : 'border-line text-ink'
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}

      {visibleKits.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 py-10 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
          {visibleKits.map((kit) => (
            <KitCard key={kit.id} kit={kit} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-sm text-muted">Nenhum kit disponível no momento.</p>
      )}
    </div>
  );
}
