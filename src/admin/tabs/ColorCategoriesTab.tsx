import { useSiteData } from '../../data/siteData';
import type { ColorCategory } from '../../data/types';
import { ImagePicker } from '../ImagePicker';
import { Field, TextInput } from '../Field';
import { EditableCard } from '../EditableCard';
import { uniqueSlug } from '../../lib/slug';

function move<T>(list: T[], index: number, delta: number): T[] {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function ColorCategoriesTab() {
  const { colorCategories, setColorCategories } = useSiteData();

  return (
    <EditableCard<ColorCategory[]>
      title="Categorias por cor"
      value={colorCategories}
      onSave={setColorCategories}
      renderSummary={(list) => (
        <ul className="flex flex-col gap-1 text-sm">
          {list.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-muted">
              <span className="h-3 w-3 rounded-full border border-line" style={{ backgroundColor: c.hex }} />
              {c.label}
            </li>
          ))}
        </ul>
      )}
      renderForm={(draft, setDraft) => (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted">
            O nome (label) precisa bater com a cor cadastrada nas variantes dos produtos para reunir as
            peças em <code>#/cor/{'{id}'}</code>.
          </p>

          {draft.map((color, i) => (
            <div key={color.id} className="flex flex-col gap-3 border border-line p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">{color.id}</p>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={i === 0} onClick={() => setDraft(move(draft, i, -1))} className="px-1 text-xs disabled:opacity-30">▲</button>
                  <button type="button" disabled={i === draft.length - 1} onClick={() => setDraft(move(draft, i, 1))} className="px-1 text-xs disabled:opacity-30">▼</button>
                  <button
                    type="button"
                    onClick={() => setDraft(draft.filter((_, idx) => idx !== i))}
                    className="border border-line px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-muted"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Field label="Nome da cor">
                  <TextInput
                    value={color.label}
                    onChange={(e) => {
                      const next = [...draft];
                      next[i] = { ...color, label: e.target.value };
                      setDraft(next);
                    }}
                  />
                </Field>
                <Field label="Hex">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={/^#[0-9a-f]{6}$/i.test(color.hex) ? color.hex : '#111111'}
                      onChange={(e) => {
                        const next = [...draft];
                        next[i] = { ...color, hex: e.target.value };
                        setDraft(next);
                      }}
                      className="h-9 w-9 border border-line"
                    />
                    <TextInput
                      value={color.hex}
                      onChange={(e) => {
                        const next = [...draft];
                        next[i] = { ...color, hex: e.target.value };
                        setDraft(next);
                      }}
                      className="w-28"
                    />
                  </div>
                </Field>
              </div>

              <ImagePicker
                label="Imagem de capa (opcional — sem imagem usa o hex como fundo)"
                value={color.image?.src ?? ''}
                onChange={(src) => {
                  const next = [...draft];
                  next[i] = { ...color, image: src ? { src, alt: color.label } : undefined };
                  setDraft(next);
                }}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const id = uniqueSlug('nova cor', draft.map((c) => c.id));
              setDraft([...draft, { id, label: 'Nova cor', hex: '#111111' }]);
            }}
            className="w-fit border border-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]"
          >
            + Adicionar cor
          </button>
        </div>
      )}
    />
  );
}
