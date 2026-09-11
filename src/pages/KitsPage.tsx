import { useSiteData } from '../data/siteData';
import { KitCard } from '../components/KitCard';

/** Lista todos os kits ativos — destino do item "Kits" no header e na vitrine circular de categorias. */
export function KitsPage() {
  const { kits } = useSiteData();
  const activeKits = kits.filter((k) => k.active);

  return (
    <div className="mx-auto max-w-7xl safe-px pb-28 pt-28 sm:pt-36">
      <header className="border-b border-line pb-8">
        <h1 className="font-display text-4xl sm:text-6xl">Kits</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
          {activeKits.length} {activeKits.length === 1 ? 'kit' : 'kits'}
        </p>
      </header>

      {activeKits.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 py-10 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
          {activeKits.map((kit) => (
            <KitCard key={kit.id} kit={kit} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-sm text-muted">Nenhum kit disponível no momento.</p>
      )}
    </div>
  );
}
