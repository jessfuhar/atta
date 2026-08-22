import { useState } from 'react';
import { ImageLibraryModal } from './ImageLibraryModal';
import { ImageThumb } from './ImageThumb';
import { pickedImage, uploadedImage, type DraftImageItem } from './DraftImage';
import { validateImageFile } from './github/images';

interface ImagePickerProps {
  value: DraftImageItem;
  onChange: (next: DraftImageItem) => void;
  label?: string;
}

/** Escolhe uma imagem já publicada ou envia uma nova (fica pendente até "Salvar e publicar"). */
export function ImagePicker({ value, onChange, label }: ImagePickerProps) {
  const [open, setOpen] = useState(false);

  function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      alert(err);
      return;
    }
    onChange(uploadedImage(file, value.alt));
  }

  return (
    <div className="flex items-start gap-3">
      <div className="h-20 w-20 flex-none overflow-hidden border border-line bg-canvas-alt">
        <ImageThumb image={value} className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {label && <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>}
        {value.file && (
          <p className="text-[11px] uppercase tracking-[0.1em] text-amber-600">novo — publica ao salvar</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="border border-ink px-2 py-1 text-[11px] uppercase tracking-[0.1em]"
          >
            Escolher publicada
          </button>
          <label className="cursor-pointer border border-line px-2 py-1 text-[11px] uppercase tracking-[0.1em]">
            Enviar nova foto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>
      </div>

      {open && (
        <ImageLibraryModal
          onClose={() => setOpen(false)}
          onSelect={([src]) => {
            onChange(pickedImage(src));
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
