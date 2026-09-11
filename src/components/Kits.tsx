import { useRef } from 'react';
import type { Kit } from '../data/types';
import { KitCard } from './KitCard';

interface KitsProps {
  kits: Kit[];
}

/** Carrossel de kits em destaque na Home — só kits marcados "Mostrar na Home", na ordem do admin. */
export function Kits({ kits }: KitsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const featured = kits.filter((k) => k.active && k.showOnHome);
  if (featured.length === 0) return null;

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  }

  return (
    <section className="safe-px py-4">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Kits</p>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-320)}
            aria-label="Kits anteriores"
            className="border border-line px-3 py-1.5 text-sm transition-colors hover:border-ink"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollBy(320)}
            aria-label="Próximos kits"
            className="border border-line px-3 py-1.5 text-sm transition-colors hover:border-ink"
          >
            ›
          </button>
        </div>
      </div>

      <div ref={scrollerRef} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:gap-8">
        {featured.map((kit) => (
          <KitCard key={kit.id} kit={kit} className="w-[58vw] flex-none snap-start sm:w-64 md:w-72" />
        ))}
      </div>
    </section>
  );
}
