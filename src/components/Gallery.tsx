import { useRef, useState } from 'react';
import { withBase } from '../lib/assets';

interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

/** Galeria da página do produto: miniaturas + navegação, com swipe por toque no mobile.
 * Renderizar com `key` própria por variante/cor no chamador — assim o índice reseta ao trocar de cor. */
export function Gallery({ images }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return <div className="aspect-[4/5] bg-canvas-alt" />;
  }

  const active = images[Math.min(index, images.length - 1)];

  function go(delta: number) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(delta > 0 ? -1 : 1);
    touchStartX.current = null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse">
      <div
        className="relative aspect-[4/5] flex-1 overflow-hidden bg-canvas-alt"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img src={withBase(active.src)} alt={active.alt} className="h-full w-full object-cover" />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-canvas/80 px-2 py-1 text-sm"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-canvas/80 px-2 py-1 text-sm"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-none sm:flex-col sm:overflow-y-auto">
          {images.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`aspect-[4/5] w-16 flex-none overflow-hidden border sm:w-full ${
                i === index ? 'border-ink' : 'border-line'
              }`}
            >
              <img src={withBase(img.src)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
