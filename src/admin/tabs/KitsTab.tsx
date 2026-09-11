import { useEffect, useRef, useState } from 'react';
import { useSiteData } from '../../data/siteData';
import type { Kit, KitItem, Product } from '../../data/types';
import { ImageListEditor } from '../ImageListEditor';
import { ImageThumb } from '../ImageThumb';
import { Field, TextArea, TextInput } from '../Field';
import { EditableCard } from '../EditableCard';
import { PublishStatusPill } from '../PublishStatusPill';
import type { DraftImageItem } from '../DraftImage';
import { uniqueSlug } from '../../lib/slug';
import { formatPrice } from '../../lib/format';
import { useGithubAuth } from '../github/auth';
import { publishChanges, type PublishStatus } from '../github/publish';
import { PUBLISH_SUCCESS_MESSAGE } from '../useDraft';
import { serializeKits } from '../github/serialize';
import { imageExt, kitImagePath, toPublicSrc } from '../github/images';

function move<T>(list: T[], index: number, delta: number): T[] {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function emptyKit(existingIds: string[]): Kit {
  const id = uniqueSlug('novo kit', existingIds);
  return {
    id,
    slug: id,
    name: 'Novo kit',
    description: '',
    price: 0,
    active: true,
    showOnHome: false,
    images: [],
    items: [],
  };
}

function validateKit(k: Kit): string | null {
  if (!k.name.trim()) return 'Nome é obrigatório.';
  if (k.price <= 0) return 'Preço deve ser maior que zero.';
  if (k.items.length === 0) return 'Selecione ao menos uma peça para o kit.';
  return null;
}

/** Resolve os arquivos pendentes das imagens do kit para caminhos publicados e devolve o kit limpo. */
function extractKitImages(kit: Kit): { cleaned: Kit; images: { path: string; file: File }[] } {
  const images: { path: string; file: File }[] = [];
  const cleanedImages = (kit.images as DraftImageItem[]).map((img, i) => {
    if (img.file) {
      const path = kitImagePath(kit.slug, i, imageExt(img.file));
      images.push({ path, file: img.file });
      return { src: toPublicSrc(path), alt: img.alt };
    }
    return { src: img.src, alt: img.alt };
  });
  return { cleaned: { ...kit, images: cleanedImages }, images };
}

function ItemsEditor({
  items,
  products,
  onChange,
}: {
  items: KitItem[];
  products: Product[];
  onChange: (items: KitItem[]) => void;
}) {
  const [addProductId, setAddProductId] = useState('');
  const addProduct = products.find((p) => p.id === addProductId);
  const [addColor, setAddColor] = useState('');

  function selectProduct(id: string) {
    setAddProductId(id);
    setAddColor(products.find((p) => p.id === id)?.variants[0]?.color ?? '');
  }

  function addItem() {
    if (!addProduct || !addColor) return;
    onChange([...items, { productId: addProduct.id, color: addColor }]);
    setAddProductId('');
    setAddColor('');
  }

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && <p className="text-xs text-muted">Nenhuma peça adicionada ainda.</p>}

      <div className="flex flex-col gap-2">
        {items.map((item, i) => {
          const product = products.find((p) => p.id === item.productId);
          return (
            <div key={`${item.productId}-${item.color}-${i}`} className="flex flex-wrap items-center gap-2 border border-line p-2">
              <span className="flex-1 text-sm">
                {product?.name ?? 'produto removido'} <span className="text-xs text-muted">— {item.color}</span>
              </span>
              <button type="button" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} className="px-1 text-xs disabled:opacity-30">▲</button>
              <button type="button" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))} className="px-1 text-xs disabled:opacity-30">▼</button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="border border-line px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-muted"
              >
                Remover
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-2 border border-line p-3">
        <Field label="Produto">
          <select
            value={addProductId}
            onChange={(e) => selectProduct(e.target.value)}
            className="w-full border border-line bg-canvas px-2 py-1.5 text-sm sm:w-auto"
          >
            <option value="">Selecione...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cor">
          <select
            value={addColor}
            onChange={(e) => setAddColor(e.target.value)}
            disabled={!addProduct}
            className="w-full border border-line bg-canvas px-2 py-1.5 text-sm disabled:opacity-40 sm:w-auto"
          >
            {(addProduct?.variants ?? []).map((v) => (
              <option key={v.color} value={v.color}>
                {v.color}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="button"
          disabled={!addProduct || !addColor}
          onClick={addItem}
          className="border border-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] disabled:opacity-40"
        >
          + Adicionar peça
        </button>
      </div>
    </div>
  );
}

function KitForm({ draft, setDraft }: { draft: Kit; setDraft: (updater: Kit | ((k: Kit) => Kit)) => void }) {
  const { products, getKitPricing } = useSiteData();
  const { original, hasDiscount } = getKitPricing(draft);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </Field>
        <div>
          <Field label="Preço do kit (R$)">
            <TextInput
              type="number"
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
            />
          </Field>
          <p className="mt-1 text-[11px] text-muted">
            Valor normal (soma das peças, calculado automaticamente): {formatPrice(original)}
            {!hasDiscount && draft.items.length > 0 && ' — igual ou menor que o do kit, "De" não aparece no site'}
          </p>
        </div>
      </div>

      <Field label="Descrição">
        <TextArea value={draft.description} rows={2} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="flex w-fit items-center gap-2 text-xs uppercase tracking-[0.12em]">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
          />
          Kit ativo (visível no site)
        </label>
        <label className="flex w-fit items-center gap-2 text-xs uppercase tracking-[0.12em]">
          <input
            type="checkbox"
            checked={draft.showOnHome ?? false}
            onChange={(e) => setDraft({ ...draft, showOnHome: e.target.checked })}
          />
          Mostrar na Home
        </label>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Fotos do kit</p>
        <ImageListEditor images={draft.images} onChange={(images) => setDraft({ ...draft, images })} />
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Peças do kit</p>
        <ItemsEditor items={draft.items} products={products} onChange={(items) => setDraft({ ...draft, items })} />
      </div>
    </div>
  );
}

function KitSummary({ kit, products }: { kit: Kit; products: Product[] }) {
  const cover = kit.images[0];
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 flex-none overflow-hidden border border-line bg-canvas-alt">
        <ImageThumb image={cover} className="h-full w-full object-cover" />
      </div>
      <div>
        <p className="text-sm">
          {kit.name} {!kit.active && <span className="text-xs text-muted">(inativo)</span>}
          {kit.showOnHome && <span className="text-xs text-muted"> · na Home</span>}
        </p>
        <p className="text-xs text-muted">
          {formatPrice(kit.price)} · {kit.items.length} peça(s):{' '}
          {kit.items.map((i) => products.find((p) => p.id === i.productId)?.name ?? '—').join(', ') || '—'}
        </p>
      </div>
    </div>
  );
}

export function KitsTab() {
  const { kits, setKits, products } = useSiteData();
  const { token } = useGithubAuth();
  const [creating, setCreating] = useState<Kit | null>(null);
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

  async function publishList(next: Kit[], message: string) {
    setBusy(true);
    setListError(null);
    setFeedbackMessage(null);
    try {
      await publishChanges({
        token: token!,
        files: [{ path: 'src/data/kits.ts', content: serializeKits(next) }],
        images: [],
        message,
        onStatus: setListStatus,
      });
      setKits(next);
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
    const next = move(kits, index, delta);
    if (next !== kits) publishList(next, 'admin: reordena kits');
  }

  function removeKit(kit: Kit) {
    if (!confirm(`Excluir o kit "${kit.name}"? Essa ação publica no GitHub e não pode ser desfeita.`)) return;
    publishList(
      kits.filter((k) => k.id !== kit.id),
      `admin: remove kit ${kit.name}`,
    );
  }

  async function saveCreate() {
    if (!creating) return;
    const validationError = validateKit(creating);
    if (validationError) {
      setCreateError(validationError);
      return;
    }
    setCreateError(null);
    const { cleaned, images } = extractKitImages(creating);
    try {
      await publishChanges({
        token: token!,
        files: [{ path: 'src/data/kits.ts', content: serializeKits([...kits, cleaned]) }],
        images,
        message: `admin: novo kit ${cleaned.name}`,
        onStatus: setCreateStatus,
      });
      setKits([...kits, cleaned]);
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
        <p className="text-xs text-muted">A ordem da lista define a ordem de exibição na área de kits.</p>
        <PublishStatusPill status={listStatus} />
      </div>
      {listError && <p className="text-sm text-red-600">{listError}</p>}
      {feedbackMessage && <p className="text-sm text-emerald-600">{feedbackMessage}</p>}

      {kits.map((kit, i) => (
        <div key={kit.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex gap-1 sm:mt-4 sm:flex-col">
            <button type="button" disabled={i === 0 || busy} onClick={() => reorder(i, -1)} className="px-1 text-xs disabled:opacity-30">▲</button>
            <button type="button" disabled={i === kits.length - 1 || busy} onClick={() => reorder(i, 1)} className="px-1 text-xs disabled:opacity-30">▼</button>
          </div>

          <div className="flex-1">
            <EditableCard<Kit>
              title={kit.name}
              value={kit}
              onSave={async (draft, report) => {
                const validationError = validateKit(draft);
                if (validationError) throw new Error(validationError);
                const { cleaned, images } = extractKitImages(draft);
                const nextKits = kits.map((k) => (k.id === kit.id ? cleaned : k));
                await publishChanges({
                  token: token!,
                  files: [{ path: 'src/data/kits.ts', content: serializeKits(nextKits) }],
                  images,
                  message: `admin: atualiza kit ${cleaned.name}`,
                  onStatus: report,
                });
                setKits(nextKits);
              }}
              renderSummary={(k) => <KitSummary kit={k} products={products} />}
              renderForm={(draft, setDraft) => <KitForm draft={draft} setDraft={setDraft} />}
            />
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => removeKit(kit)}
            className="border border-line px-2 py-1.5 text-[11px] uppercase tracking-[0.1em] text-muted disabled:opacity-40 sm:mt-4"
          >
            Excluir
          </button>
        </div>
      ))}

      {creating ? (
        <div className="border border-ink p-4">
          <div className="mb-4 flex items-center gap-3">
            <p className="font-display text-lg">Novo kit</p>
            <PublishStatusPill status={createStatus} />
          </div>
          {createError && <p className="mb-3 text-sm text-red-600">{createError}</p>}
          <KitForm draft={creating} setDraft={(updater) => setCreating((prev) => (prev ? (typeof updater === 'function' ? updater(prev) : updater) : prev))} />
          <div className="mt-4 flex flex-wrap gap-3">
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
          onClick={() => setCreating(emptyKit(kits.map((k) => k.id)))}
          className="w-fit border border-ink px-4 py-2 text-xs uppercase tracking-[0.1em]"
        >
          + Novo kit
        </button>
      )}
    </div>
  );
}
