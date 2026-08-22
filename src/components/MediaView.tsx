import type { Media } from '../data/types';
import { withBase } from '../lib/assets';

interface MediaViewProps {
  media: Media;
  className?: string;
  eager?: boolean;
}

/** Renderiza imagem ou vídeo a partir do mesmo dado — trocar `type` em data/ já basta. */
export function MediaView({ media, className, eager }: MediaViewProps) {
  if (media.type === 'video') {
    return (
      <video
        className={className}
        src={withBase(media.src)}
        poster={withBase(media.poster)}
        aria-label={media.alt}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return (
    <img
      className={className}
      src={withBase(media.src)}
      alt={media.alt}
      loading={eager ? 'eager' : 'lazy'}
    />
  );
}
