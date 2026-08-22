import type { HomeContent } from '../data/types';
import { MediaView } from './MediaView';

interface EditorialProps {
  editorial: HomeContent['editorial'];
}

/** Bloco grande final da Home — imagem ou vídeo, conteúdo definido depois em data/home.ts. */
export function Editorial({ editorial }: EditorialProps) {
  return (
    <section className="relative h-[80vh] min-h-[420px] overflow-hidden bg-ink">
      <MediaView media={editorial} className="h-full w-full object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
      {editorial.caption && (
        <p className="absolute bottom-8 left-6 max-w-xs font-display text-2xl text-canvas sm:bottom-12 sm:left-10 sm:text-3xl">
          {editorial.caption}
        </p>
      )}
    </section>
  );
}
