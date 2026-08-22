import type { HomeContent } from '../data/types';
import { MediaView } from './MediaView';
import { withBase, LOGO_WHITE } from '../lib/assets';

interface HeroProps {
  hero: HomeContent['hero'];
}

export function Hero({ hero }: HeroProps) {
  return (
    <section className="relative flex h-screen min-h-[640px] items-end overflow-hidden bg-ink">
      <MediaView media={hero} eager className="absolute inset-0 h-full w-full object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 sm:px-10 sm:pb-28">
        <img
          src={withBase(LOGO_WHITE)}
          alt="atta."
          className="h-auto w-44 sm:w-56 lg:w-[280px]"
        />
        {hero.subline && (
          <p className="mt-6 max-w-sm text-base text-canvas/85 sm:text-lg">{hero.subline}</p>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 h-12 w-px -translate-x-1/2 bg-canvas/60 sm:bottom-10" />
    </section>
  );
}
