import { useState } from 'react';
import { imageManifest } from '../data/imageManifest';
import { withBase } from '../lib/assets';

interface ImagePickerProps {
  value: string;
  onChange: (src: string) => void;
  label?: string;
}

/** Seleciona uma imagem já existente em public/images ou envia um arquivo local (pré-visualização apenas, ver aviso no painel de exportação). */
export function ImagePicker({ value, onChange, label }: ImagePickerProps) {
  const [open, setOpen] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-start gap-3">
      <div className="h-20 w-20 flex-none overflow-hidden border border-line bg-canvas-alt">
        {value && (
          <img src={withBase(value)} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {label && <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-line bg-canvas px-2 py-1 text-xs"
          placeholder="/images/..."
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="border border-ink px-2 py-1 text-[11px] uppercase tracking-[0.1em]"
          >
            Escolher da biblioteca
          </button>
          <label className="cursor-pointer border border-line px-2 py-1 text-[11px] uppercase tracking-[0.1em]">
            Enviar imagem (preview)
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        </div>

        {open && (
          <div className="mt-2 grid max-h-56 grid-cols-4 gap-2 overflow-y-auto border border-line p-2">
            {imageManifest.map((src) => (
              <button
                key={src}
                type="button"
                title={src}
                onClick={() => {
                  onChange(src);
                  setOpen(false);
                }}
                className={`aspect-square overflow-hidden border ${
                  src === value ? 'border-ink' : 'border-line'
                }`}
              >
                <img src={withBase(src)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
