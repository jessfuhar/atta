import { useMemo, useState } from 'react';
import { imageManifest } from '../data/imageManifest';
import { withBase } from '../lib/assets';

interface ImageLibraryModalProps {
  multiple?: boolean;
  onClose: () => void;
  onSelect: (srcs: string[]) => void;
}

/** Biblioteca = só o que já está publicado em public/images (gerado no build) — sem placeholders/SVGs. */
export function ImageLibraryModal({ multiple, onClose, onSelect }: ImageLibraryModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const images = useMemo(() => [...imageManifest].sort((a, b) => b.addedAt - a.addedAt), []);
  const filtered = useMemo(
    () => images.filter((img) => img.src.toLowerCase().includes(query.trim().toLowerCase())),
    [images, query],
  );

  function toggle(src: string) {
    if (!multiple) {
      onSelect([src]);
      return;
    }
    setSelected((prev) => (prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col bg-canvas p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-display text-lg">Fotos já publicadas</p>
          <button type="button" onClick={onClose} className="text-xs uppercase tracking-[0.1em] text-muted">
            Fechar
          </button>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar por nome/caminho..."
          className="mb-3 border border-line bg-canvas px-2 py-1.5 text-sm"
        />

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Nenhuma foto publicada ainda. Use "Enviar novas fotos" para adicionar — elas entram na
            biblioteca assim que a publicação terminar.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 overflow-y-auto">
            {filtered.map((img) => (
              <button
                key={img.src}
                type="button"
                onClick={() => toggle(img.src)}
                title={img.src}
                className={`aspect-square overflow-hidden border ${
                  selected.includes(img.src) ? 'border-ink' : 'border-line'
                }`}
              >
                <img src={withBase(img.src)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {multiple && (
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs text-muted">{selected.length} selecionada(s)</span>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => onSelect(selected)}
              className="border border-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] disabled:opacity-40"
            >
              Adicionar selecionadas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
