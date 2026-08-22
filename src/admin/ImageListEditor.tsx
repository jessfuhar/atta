import { useState } from 'react';
import { ImageLibraryModal } from './ImageLibraryModal';
import { ImageThumb } from './ImageThumb';
import { TextInput } from './Field';
import { pickedImage, uploadedImage, type DraftImageItem } from './DraftImage';
import { validateImageFile } from './github/images';

interface ImageListEditorProps {
  images: DraftImageItem[];
  onChange: (images: DraftImageItem[]) => void;
}

function move<T>(list: T[], index: number, delta: number): T[] {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** 1ª foto = capa, 2ª = hover, demais = galeria da página do produto — ordem aqui decide isso. */
export function ImageListEditor({ images, onChange }: ImageListEditorProps) {
  const [open, setOpen] = useState(false);

  function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next: DraftImageItem[] = [];
    for (const file of Array.from(files)) {
      const err = validateImageFile(file);
      if (err) {
        alert(err);
        continue;
      }
      next.push(uploadedImage(file));
    }
    if (next.length > 0) onChange([...images, ...next]);
  }

  return (
    <div className="flex flex-col gap-3">
      {images.map((image, i) => (
        <div key={i} className="flex items-start gap-2 border border-line p-2">
          <div className="h-16 w-16 flex-none overflow-hidden border border-line bg-canvas-alt">
            <ImageThumb image={image} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="mb-1 text-[10px] uppercase tracking-[0.1em] text-muted">
              {i === 0 ? 'Capa' : i === 1 ? 'Hover' : 'Galeria'}
              {image.file && <span className="ml-2 text-amber-600">novo — publica ao salvar</span>}
            </p>
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
            <button type="button" disabled={i === 0} onClick={() => onChange(move(images, i, -1))} className="px-1 text-xs disabled:opacity-30">▲</button>
            <button type="button" disabled={i === images.length - 1} onClick={() => onChange(move(images, i, 1))} className="px-1 text-xs disabled:opacity-30">▼</button>
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-fit border border-ink px-2 py-1 text-[11px] uppercase tracking-[0.1em]"
        >
          Escolher publicadas
        </button>
        <label className="cursor-pointer border border-line px-2 py-1 text-[11px] uppercase tracking-[0.1em]">
          Enviar novas fotos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
      </div>

      {open && (
        <ImageLibraryModal
          multiple
          onClose={() => setOpen(false)}
          onSelect={(srcs) => {
            onChange([...images, ...srcs.map(pickedImage)]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
