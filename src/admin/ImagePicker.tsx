import { useState } from 'react';
import { withBase } from '../lib/assets';
import { ImageLibraryModal } from './ImageLibraryModal';

interface ImagePickerProps {
  value: string;
  onChange: (src: string) => void;
  label?: string;
}

/** Seleciona uma imagem (capa de categoria, hero, editorial). Aceita caminho manual ou biblioteca. */
export function ImagePicker({ value, onChange, label }: ImagePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-start gap-3">
      <div className="h-20 w-20 flex-none overflow-hidden border border-line bg-canvas-alt">
        {value && <img src={withBase(value)} alt="" className="h-full w-full object-cover" />}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {label && <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-line bg-canvas px-2 py-1 text-xs"
          placeholder="/images/... ou selecione abaixo"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-fit border border-ink px-2 py-1 text-[11px] uppercase tracking-[0.1em]"
        >
          Escolher da biblioteca
        </button>
      </div>

      {open && (
        <ImageLibraryModal
          onClose={() => setOpen(false)}
          onSelect={([src]) => {
            onChange(src);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
