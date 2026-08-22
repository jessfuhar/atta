import { withBase } from '../lib/assets';
import type { DraftImageItem } from './DraftImage';

interface ImageThumbProps {
  image: DraftImageItem | undefined;
  className?: string;
}

/** Mostra preview local (arquivo pendente) ou a imagem já publicada, sem distinguir a origem na URL. */
export function ImageThumb({ image, className }: ImageThumbProps) {
  if (!image?.src) return <div className={className} />;
  const src = image.file ? image.src : withBase(image.src);
  return <img src={src} alt="" className={className} />;
}
