import { useState } from 'react';
import { useSiteData } from '../../data/siteData';
import type { Product, ProductVariant } from '../../data/types';
import { ImageListEditor } from '../ImageListEditor';
import { Field, TextArea, TextInput } from '../Field';
import { EditableCard } from '../EditableCard';
import { withBase } from '../../lib/assets';
import { uniqueSlug } from '../../lib/slug';

function move<T>(list: T[], index: number, delta: number): T[] {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function emptyProduct(existingIds: string[]): Product {
  const id = uniqueSlug('novo produto', existingIds);
  return {
    id,
    slug: id,
    name: 'Novo produto',
    category: '',
    price: 0,
    sizes: ['P', 'M', 'G'],
    description: '',
    variants: [{ color: 'Preto', hex: '#111111', images: [] }],
  };
}

function VariantEditor({
  variant,
  onChange,
  onRemove,
}: {
  variant: ProductVariant;
  onChange: (variant: ProductVariant) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border border-line p-3">
      <div className="flex items-end gap-3">
        <Field label="Cor">
          <TextInput value={variant.color} onChange={(e) => onChange({ ...variant, color: e.target.value })} />
        </Field>
        <Field label="Hex">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(variant.hex ?? '') ? (variant.hex as string) : '#111111'}
              onChange={(e) => onChange({ ...variant, hex: e.target.value })}
              className="h-9 w-9 border border-line"
            />
            <TextInput
              value={variant.hex ?? ''}
              placeholder="#111111"
              className="w-28"
              onChange={(e) => onChange({ ...variant, hex: e.target.value })}
            />
          </div>
        </Field>
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto border border-line px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-muted"
        >
          Remover cor
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Fotos desta cor</p>
        <ImageListEditor images={variant.images} onChange={(images) => onChange({ ...variant, images })} />
      </div>
    </div>
  );
}

function ProductForm({ draft, setDraft }: { draft: Product; setDraft: (updater: Product | ((p: Product) => Product)) => void }) {
  const { categories } = useSiteData();
  const [sizesText, setSizesText] = useState(draft.sizes.join(', '));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </Field>
        <Field label="Preço (R$)">
          <TextInput
            type="number"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label="Categoria (tipo de peça)">
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            className="border border-line bg-canvas px-2 py-1.5 text-sm"
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tamanhos (separados por vírgula)">
          <TextInput
            value={sizesText}
            onChange={(e) => setSizesText(e.target.value)}
            onBlur={() =>
              setDraft({ ...draft, sizes: sizesText.split(',').map((s) => s.trim()).filter(Boolean) })
            }
          />
        </Field>
      </div>

      <Field label="Descrição">
        <TextArea value={draft.description} rows={2} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </Field>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Cores e imagens</p>
        <div className="flex flex-col gap-3">
          {draft.variants.map((variant, i) => (
            <VariantEditor
              key={i}
              variant={variant}
              onChange={(v) => {
                const variants = [...draft.variants];
                variants[i] = v;
                setDraft({ ...draft, variants });
              }}
              onRemove={() => setDraft({ ...draft, variants: draft.variants.filter((_, idx) => idx !== i) })}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setDraft({ ...draft, variants: [...draft.variants, { color: 'Nova cor', hex: '#111111', images: [] }] })}
          className="mt-3 w-fit border border-ink px-2 py-1 text-[11px] uppercase tracking-[0.1em]"
        >
          + Adicionar cor
        </button>
      </div>
    </div>
  );
}

function ProductSummary({ product }: { product: Product }) {
  const cover = product.variants[0]?.images[0];
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 flex-none overflow-hidden border border-line bg-canvas-alt">
        {cover && <img src={withBase(cover.src)} alt="" className="h-full w-full object-cover" />}
      </div>
      <div>
        <p className="text-sm">{product.name}</p>
        <p className="text-xs text-muted">
          {product.category || 'sem categoria'} · R$ {product.price} · {product.variants.length} cor(es)
        </p>
      </div>
    </div>
  );
}

export function ProductsTab() {
  const { products, setProducts } = useSiteData();
  const [creating, setCreating] = useState<Product | null>(null);

  function reorder(index: number, delta: number) {
    setProducts(move(products, index, delta));
  }

  function removeProduct(id: string) {
    if (confirm('Excluir este produto? Essa ação não pode ser desfeita.')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted">A ordem da lista define a ordem de exibição nas categorias.</p>

      {products.map((product, i) => (
        <div key={product.id} className="flex items-start gap-2">
          <div className="mt-4 flex flex-col gap-1">
            <button type="button" disabled={i === 0} onClick={() => reorder(i, -1)} className="px-1 text-xs disabled:opacity-30">▲</button>
            <button type="button" disabled={i === products.length - 1} onClick={() => reorder(i, 1)} className="px-1 text-xs disabled:opacity-30">▼</button>
          </div>

          <div className="flex-1">
            <EditableCard<Product>
              title={product.name}
              value={product}
              onSave={(next) => setProducts(products.map((p) => (p.id === product.id ? next : p)))}
              renderSummary={(p) => <ProductSummary product={p} />}
              renderForm={(draft, setDraft) => <ProductForm draft={draft} setDraft={setDraft} />}
            />
          </div>

          <button
            type="button"
            onClick={() => removeProduct(product.id)}
            className="mt-4 border border-line px-2 py-1.5 text-[11px] uppercase tracking-[0.1em] text-muted"
          >
            Excluir
          </button>
        </div>
      ))}

      {creating ? (
        <div className="border border-ink p-4">
          <p className="mb-4 font-display text-lg">Novo produto</p>
          <ProductForm draft={creating} setDraft={(updater) => setCreating((prev) => (prev ? (typeof updater === 'function' ? updater(prev) : updater) : prev))} />
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setCreating(null)}
              className="border border-line px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-muted"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                setProducts([...products, creating]);
                setCreating(null);
              }}
              className="border border-ink bg-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-canvas"
            >
              Salvar alterações
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(emptyProduct(products.map((p) => p.id)))}
          className="w-fit border border-ink px-4 py-2 text-xs uppercase tracking-[0.1em]"
        >
          + Novo produto
        </button>
      )}
    </div>
  );
}
