import { useSiteData } from '../../data/siteData';
import { ImagePicker } from '../ImagePicker';
import { Field, TextInput } from '../Field';

export function CategoriesTab() {
  const { categories, setCategories } = useSiteData();

  function patch(id: string, patch: Partial<(typeof categories)[number]>) {
    setCategories(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  return (
    <div className="flex flex-col gap-8">
      {categories.map((category) => (
        <div key={category.id} className="flex flex-col gap-3 border border-line p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">{category.id}</p>
          <div className="max-w-xs">
            <Field label="Nome exibido">
              <TextInput
                value={category.label}
                onChange={(e) => patch(category.id, { label: e.target.value })}
              />
            </Field>
          </div>
          <ImagePicker
            label="Imagem da categoria"
            value={category.image.src}
            onChange={(src) => patch(category.id, { image: { ...category.image, src } })}
          />
        </div>
      ))}
    </div>
  );
}
