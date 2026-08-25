import { useEffect, useRef, useState } from 'react';
import { useSiteData } from '../../data/siteData';
import type { Product, ProductVariant } from '../../data/types';
import { ImageListEditor } from '../ImageListEditor';
import { ImageThumb } from '../ImageThumb';
import { Field, TextArea, TextInput } from '../Field';
import { EditableCard } from '../EditableCard';
import { PublishStatusPill } from '../PublishStatusPill';
import type { DraftImageItem } from '../DraftImage';
import { uniqueSlug, slugify } from '../../lib/slug';
import { useGithubAuth } from '../github/auth';
import { publishChanges, type PublishStatus } from '../github/publish';
import { PUBLISH_SUCCESS_MESSAGE } from '../useDraft';
import { serializeProducts } from '../github/serialize';
import { imageExt, productImagePath, toPublicSrc } from '../github/images';

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

function validateProduct(p: Product): string | null {
  if (!p.name.trim()) return 'Nome é obrigatório.';
  if (!p.category) return 'Selecione uma categoria (tipo de peça).';
  if (p.price <= 0) return 'Preço deve ser maior que zero.';
  if (p.variants.length === 0) return 'Adicione ao menos uma cor.';
  return null;
}

/** Resolve os arquivos pendentes das variantes para caminhos publicados e devolve o produto limpo. */
function extractProductImages(product: Product): { cleaned: Product; images: { path: string; file: File }[] } {
  const images: { path: string; file: File }[] = [];
  const variants = product.variants.map((variant) => {
    const colorSlug = slugify(variant.color || 'cor');
    const imgs = (variant.images as DraftImageItem[]).map((img, i) => {
      if (img.file) {
        const path = productImagePath(product.slug, colorSlug, i, imageExt(img.file));
        images.push({ path, file: img.file });
        return { src: toPublicSrc(path), alt: img.alt };
      }
      return { src: img.src, alt: img.alt };
    });
    return { ...variant, images: imgs };
  });
  return { cleaned: { ...product, variants }, images };
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
        <ImageThumb image={cover} className="h-full w-full object-cover" />
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
  const { token } = useGithubAuth();
  const [creating, setCreating] = useState<Product | null>(null);
  const [createStatus, setCreateStatus] = useState<PublishStatus>('idle');
  const [createError, setCreateError] = useState<string | null>(null);
  const [listStatus, setListStatus] = useState<PublishStatus>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(feedbackTimer.current), []);

  function showFeedback(msg: string) {
    setFeedbackMessage(msg);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedbackMessage(null), 5000);
  }

  async function publishList(next: Product[], message: string) {
    setBusy(true);
    setListError(null);
    setFeedbackMessage(null);
    try {
      await publishChanges({
        token: token!,
        files: [{ path: 'src/data/products.ts', content: serializeProducts(next) }],
        images: [],
        message,
        onStatus: setListStatus,
      });
      setProducts(next);
      // Concluído assim que o commit + main forem confirmados — não espera Actions/Pages.
      setListStatus('idle');
      showFeedback(PUBLISH_SUCCESS_MESSAGE);
    } catch (e) {
      setListStatus('error');
      setListError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function reorder(index: number, delta: number) {
    const next = move(products, index, delta);
    if (next !== products) publishList(next, `admin: reordena produtos`);
  }

  function removeProduct(product: Product) {
    if (!confirm(`Excluir "${product.name}"? Essa ação publica no GitHub e não pode ser desfeita.`)) return;
    publishList(products.filter((p) => p.id !== product.id), `admin: remove produto ${product.name}`);
  }

  async function saveCreate() {
    if (!creating) return;
    const validationError = validateProduct(creating);
    if (validationError) {
      setCreateError(validationError);
      return;
    }
    setCreateError(null);
    const { cleaned, images } = extractProductImages(creating);
    try {
      await publishChanges({
        token: token!,
        files: [{ path: 'src/data/products.ts', content: serializeProducts([...products, cleaned]) }],
        images,
        message: `admin: novo produto ${cleaned.name}`,
        onStatus: setCreateStatus,
      });
      setProducts([...products, cleaned]);
      // Concluído assim que o commit + main forem confirmados — não espera Actions/Pages.
      setCreating(null);
      setCreateStatus('idle');
      showFeedback(PUBLISH_SUCCESS_MESSAGE);
    } catch (e) {
      setCreateStatus('error');
      setCreateError(e instanceof Error ? e.message : String(e));
    }
  }

  const creatingBusy = createStatus !== 'idle' && createStatus !== 'error';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted">A ordem da lista define a ordem de exibição nas categorias.</p>
        <PublishStatusPill status={listStatus} />
      </div>
      {listError && <p className="text-sm text-red-600">{listError}</p>}
      {feedbackMessage && <p className="text-sm text-emerald-600">{feedbackMessage}</p>}

      {products.map((product, i) => (
        <div key={product.id} className="flex items-start gap-2">
          <div className="mt-4 flex flex-col gap-1">
            <button type="button" disabled={i === 0 || busy} onClick={() => reorder(i, -1)} className="px-1 text-xs disabled:opacity-30">▲</button>
            <button type="button" disabled={i === products.length - 1 || busy} onClick={() => reorder(i, 1)} className="px-1 text-xs disabled:opacity-30">▼</button>
          </div>

          <div className="flex-1">
            <EditableCard<Product>
              title={product.name}
              value={product}
              onSave={async (draft, report) => {
                const validationError = validateProduct(draft);
                if (validationError) throw new Error(validationError);
                const { cleaned, images } = extractProductImages(draft);
                const nextProducts = products.map((p) => (p.id === product.id ? cleaned : p));
                await publishChanges({
                  token: token!,
                  files: [{ path: 'src/data/products.ts', content: serializeProducts(nextProducts) }],
                  images,
                  message: `admin: atualiza produto ${cleaned.name}`,
                  onStatus: report,
                });
                setProducts(nextProducts);
              }}
              renderSummary={(p) => <ProductSummary product={p} />}
              renderForm={(draft, setDraft) => <ProductForm draft={draft} setDraft={setDraft} />}
            />
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => removeProduct(product)}
            className="mt-4 border border-line px-2 py-1.5 text-[11px] uppercase tracking-[0.1em] text-muted disabled:opacity-40"
          >
            Excluir
          </button>
        </div>
      ))}

      {creating ? (
        <div className="border border-ink p-4">
          <div className="mb-4 flex items-center gap-3">
            <p className="font-display text-lg">Novo produto</p>
            <PublishStatusPill status={createStatus} />
          </div>
          {createError && <p className="mb-3 text-sm text-red-600">{createError}</p>}
          <ProductForm draft={creating} setDraft={(updater) => setCreating((prev) => (prev ? (typeof updater === 'function' ? updater(prev) : updater) : prev))} />
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={creatingBusy}
              onClick={() => {
                setCreating(null);
                setCreateError(null);
                setCreateStatus('idle');
              }}
              className="border border-line px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-muted disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={creatingBusy}
              onClick={saveCreate}
              className="border border-ink bg-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-canvas disabled:opacity-40"
            >
              Salvar e publicar
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
