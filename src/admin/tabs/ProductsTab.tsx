import { useState } from 'react';
import { useSiteData } from '../../data/siteData';
import type { Product, ProductVariant } from '../../data/types';
import { ImagePicker } from '../ImagePicker';
import { Field, TextArea, TextInput } from '../Field';

function move<T>(list: T[], index: number, delta: number): T[] {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
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
  function addImage() {
    onChange({ ...variant, images: [...variant.images, { src: '', alt: '' }] });
  }

  function removeImage(index: number) {
    onChange({ ...variant, images: variant.images.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-3 border border-line p-3">
      <div className="flex items-end gap-3">
        <Field label="Cor">
          <TextInput
            value={variant.color}
            onChange={(e) => onChange({ ...variant, color: e.target.value })}
          />
        </Field>
        <Field label="Hex">
          <TextInput
            value={variant.hex ?? ''}
            placeholder="#111111"
            onChange={(e) => onChange({ ...variant, hex: e.target.value })}
          />
        </Field>
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto border border-line px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-muted"
        >
          Remover cor
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {variant.images.map((image, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              <ImagePicker
                value={image.src}
                onChange={(src) => {
                  const images = [...variant.images];
                  images[i] = { ...images[i], src };
                  onChange({ ...variant, images });
                }}
              />
              <div className="mt-2">
                <TextInput
                  value={image.alt}
                  placeholder="Texto alternativo"
                  onChange={(e) => {
                    const images = [...variant.images];
                    images[i] = { ...images[i], alt: e.target.value };
                    onChange({ ...variant, images });
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="border border-line px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-muted"
            >
              Remover imagem
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addImage}
          className="w-fit border border-ink px-2 py-1 text-[11px] uppercase tracking-[0.1em]"
        >
          + Adicionar imagem
        </button>
      </div>
    </div>
  );
}

function ProductEditor({ product, onChange }: { product: Product; onChange: (p: Product) => void }) {
  const { categories } = useSiteData();
  const [sizesText, setSizesText] = useState(product.sizes.join(', '));

  function addVariant() {
    onChange({
      ...product,
      variants: [...product.variants, { color: 'Nova cor', hex: '#111111', images: [] }],
    });
  }

  return (
    <div className="flex flex-col gap-4 border-t border-line p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <TextInput value={product.name} onChange={(e) => onChange({ ...product, name: e.target.value })} />
        </Field>
        <Field label="Preço (R$)">
          <TextInput
            type="number"
            value={product.price}
            onChange={(e) => onChange({ ...product, price: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label="Categoria">
          <select
            value={product.category}
            onChange={(e) => onChange({ ...product, category: e.target.value as Product['category'] })}
            className="border border-line bg-canvas px-2 py-1.5 text-sm"
          >
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
              onChange({
                ...product,
                sizes: sizesText
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>
      </div>

      <Field label="Descrição">
        <TextArea
          value={product.description}
          rows={2}
          onChange={(e) => onChange({ ...product, description: e.target.value })}
        />
      </Field>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Cores e imagens</p>
        <div className="flex flex-col gap-3">
          {product.variants.map((variant, i) => (
            <VariantEditor
              key={i}
              variant={variant}
              onChange={(v) => {
                const variants = [...product.variants];
                variants[i] = v;
                onChange({ ...product, variants });
              }}
              onRemove={() => onChange({ ...product, variants: product.variants.filter((_, idx) => idx !== i) })}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="mt-3 w-fit border border-ink px-2 py-1 text-[11px] uppercase tracking-[0.1em]"
        >
          + Adicionar cor
        </button>
      </div>
    </div>
  );
}

export function ProductsTab() {
  const { products, setProducts } = useSiteData();
  const [openId, setOpenId] = useState<string | null>(null);

  function updateProduct(id: string, next: Product) {
    setProducts(products.map((p) => (p.id === id ? next : p)));
  }

  function reorder(index: number, delta: number) {
    setProducts(move(products, index, delta));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted">
        A ordem da lista abaixo define a ordem de exibição nas categorias e na Home.
      </p>
      {products.map((product, i) => (
        <div key={product.id} className="border border-line">
          <div className="flex items-center gap-3 p-3">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => reorder(i, -1)}
                className="px-1 text-xs disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={i === products.length - 1}
                onClick={() => reorder(i, 1)}
                className="px-1 text-xs disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm">{product.name}</p>
              <p className="text-xs text-muted">
                {product.category} · R$ {product.price}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenId(openId === product.id ? null : product.id)}
              className="border border-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]"
            >
              {openId === product.id ? 'Fechar' : 'Editar'}
            </button>
          </div>
          {openId === product.id && (
            <ProductEditor product={product} onChange={(next) => updateProduct(product.id, next)} />
          )}
        </div>
      ))}
    </div>
  );
}
