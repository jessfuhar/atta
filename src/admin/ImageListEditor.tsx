import { useState } from 'react';
import { withBase } from '../lib/assets';
import { ImageLibraryModal } from './ImageLibraryModal';
import { TextInput } from './Field';

export interface ImageItem {
  src: string;
  alt: string;
}

interface ImageListEditorProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

function move<T>(list: T[], index: number, delta: number): T[] {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Várias fotos por variante: envio em lote, miniaturas, reordenar e remover uma a uma. */
export function ImageListEditor({ images, onChange }: ImageListEditorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {images.map((image, i) => (
        <div key={i} className="flex items-start gap-2 border border-line p-2">
          <div className="h-16 w-16 flex-none overflow-hidden border border-line bg-canvas-alt">
            {image.src && <img src={withBase(image.src)} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1">
            <TextInput
              value={image.alt}
              placeholder="Texto alternativo"
              onChange={(e) => {
                const next = [...images];
                next[i] = { ...next[i], alt: e.target.value };
                onChange(next);
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => onChange(move(images, i, -1))}
              className="px-1 text-xs disabled:opacity-30"
            >
              ▲
            </button>
            <button
              type="button"
              disabled={i === images.length - 1}
              onClick={() => onChange(move(images, i, 1))}
              className="px-1 text-xs disabled:opacity-30"
            >
              ▼
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange(images.filter((_, idx) => idx !== i))}
            className="border border-line px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-muted"
          >
            Remover
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit border border-ink px-2 py-1 text-[11px] uppercase tracking-[0.1em]"
      >
        + Adicionar imagens
      </button>

      {open && (
        <ImageLibraryModal
          multiple
          onClose={() => setOpen(false)}
          onSelect={(srcs) => {
            onChange([...images, ...srcs.map((src) => ({ src, alt: '' }))]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
