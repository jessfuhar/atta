import type { Kit } from '../data/types';
import { KitCard } from './KitCard';

interface KitsProps {
  kits: Kit[];
}

/** Vitrine de kits na Home — só kits ativos, na ordem definida no admin. */
export function Kits({ kits }: KitsProps) {
  const activeKits = kits.filter((k) => k.active);
  if (activeKits.length === 0) return null;

  return (
    <section className="safe-px py-4">
      <p className="mb-10 text-xs uppercase tracking-[0.3em] text-muted">Kits</p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-8">
        {activeKits.map((kit) => (
          <KitCard key={kit.id} kit={kit} />
        ))}
      </div>
    </section>
  );
}
