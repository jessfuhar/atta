import { useSiteData } from '../../data/siteData';
import type { CategoryEntry } from '../../data/types';
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

export function CategoriesTab() {
  const { categories, setCategories } = useSiteData();

  return (
    <EditableCard<CategoryEntry[]>
      title="Categorias por tipo de peça"
      value={categories}
      onSave={setCategories}
      renderSummary={(list) => (
        <ul className="flex flex-col gap-1 text-sm">
          {list.map((c) => (
            <li key={c.id} className="text-muted">
              {c.label} <span className="text-xs">({c.id})</span>
            </li>
          ))}
        </ul>
      )}
      renderForm={(draft, setDraft) => (
        <div className="flex flex-col gap-4">
          {draft.map((category, i) => (
            <div key={category.id} className="flex flex-col gap-3 border border-line p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">{category.id}</p>
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
              <div className="max-w-xs">
                <Field label="Nome exibido">
                  <TextInput
                    value={category.label}
                    onChange={(e) => {
                      const next = [...draft];
                      next[i] = { ...category, label: e.target.value };
                      setDraft(next);
                    }}
                  />
                </Field>
              </div>
              <ImagePicker
                label="Imagem da categoria"
                value={category.image.src}
                onChange={(src) => {
                  const next = [...draft];
                  next[i] = { ...category, image: { ...category.image, src } };
                  setDraft(next);
                }}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const id = uniqueSlug('nova categoria', draft.map((c) => c.id));
              setDraft([...draft, { id, label: 'Nova categoria', image: { src: '', alt: '' } }]);
            }}
            className="w-fit border border-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]"
          >
            + Adicionar categoria
          </button>
        </div>
      )}
    />
  );
}
