import { useMemo, useState } from 'react';
import { getLibraryImages, addUpload, filesToDataUrls, type LibraryImage } from '../lib/imageLibrary';
import { withBase } from '../lib/assets';

interface ImageLibraryModalProps {
  multiple?: boolean;
  onClose: () => void;
  onSelect: (srcs: string[]) => void;
}

/** Biblioteca local: mostra só fotos reais (manifesto) + uploads desta sessão — sem placeholders/SVGs de exemplo. */
export function ImageLibraryModal({ multiple, onClose, onSelect }: ImageLibraryModalProps) {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<LibraryImage[]>(() => getLibraryImages());
  const [selected, setSelected] = useState<string[]>([]);

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

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const dataUrls = await filesToDataUrls(fileList);
    const added = dataUrls.map((d) => addUpload(d));
    setImages(getLibraryImages());
    if (multiple) setSelected((prev) => [...prev, ...added.map((a) => a.src)]);
    else if (added[0]) onSelect([added[0].src]);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col bg-canvas p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-display text-lg">Biblioteca de imagens</p>
          <button type="button" onClick={onClose} className="text-xs uppercase tracking-[0.1em] text-muted">
            Fechar
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por nome/caminho..."
            className="flex-1 border border-line bg-canvas px-2 py-1.5 text-sm"
          />
          <label className="cursor-pointer border border-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]">
            Enviar imagem(ns)
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Nenhuma foto real na biblioteca ainda. Envie fotos aqui ou adicione arquivos em
            public/images e rode o build.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 overflow-y-auto">
            {filtered.map((img) => {
              const isSelected = selected.includes(img.src);
              return (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => toggle(img.src)}
                  title={img.src}
                  className={`relative aspect-square overflow-hidden border ${
                    isSelected ? 'border-ink' : 'border-line'
                  }`}
                >
                  <img src={withBase(img.src)} alt="" className="h-full w-full object-cover" />
                  {img.isUpload && (
                    <span className="absolute left-1 top-1 bg-ink px-1 text-[9px] uppercase text-canvas">
                      novo
                    </span>
                  )}
                </button>
              );
            })}
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
