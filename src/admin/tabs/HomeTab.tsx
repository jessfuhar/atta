import { useSiteData } from '../../data/siteData';
import type { HeroAnnouncement, HomeContent, Media } from '../../data/types';
import { ImagePicker } from '../ImagePicker';
import { ImageThumb } from '../ImageThumb';
import { Field, TextInput } from '../Field';
import { EditableCard } from '../EditableCard';
import type { DraftImageItem } from '../DraftImage';
import { useGithubAuth } from '../github/auth';
import { publishChanges } from '../github/publish';
import { serializeHome } from '../github/serialize';
import { homeImagePath, imageExt, toPublicSrc } from '../github/images';

type MediaDraft = Media & { caption?: string; poster?: string; file?: File };

interface HeroDraft {
  desktop: DraftImageItem;
  mobile: DraftImageItem;
  announcement: HeroAnnouncement;
}

function MediaForm({
  media,
  onChange,
  captionField,
}: {
  media: MediaDraft;
  onChange: (media: MediaDraft) => void;
  captionField?: 'caption';
}) {
  const currentSrc = media.type === 'video' ? (media.poster ?? '') : media.src;

  return (
    <div className="flex flex-col gap-4">
      <Field label="Tipo de mídia">
        <select
          value={media.type}
          onChange={(e) => {
            const type = e.target.value as 'image' | 'video';
            onChange(type === 'video' ? { ...media, type, poster: media.poster ?? '' } : { ...media, type });
          }}
          className="border border-line bg-canvas px-2 py-1.5 text-sm"
        >
          <option value="image">Imagem</option>
          <option value="video">Vídeo</option>
        </select>
      </Field>

      <ImagePicker
        label={media.type === 'video' ? 'Poster do vídeo' : 'Imagem'}
        value={{ src: currentSrc, alt: media.alt, file: media.file }}
        onChange={(next) =>
          onChange(
            media.type === 'video'
              ? { ...media, poster: next.src, file: next.file }
              : { ...media, src: next.src, file: next.file },
          )
        }
      />

      {media.type === 'video' && (
        <Field label="URL do vídeo (mp4)">
          <TextInput value={media.src} onChange={(e) => onChange({ ...media, src: e.target.value })} />
        </Field>
      )}

      <Field label="Texto alternativo (alt)">
        <TextInput value={media.alt} onChange={(e) => onChange({ ...media, alt: e.target.value })} />
      </Field>

      {captionField && (
        <Field label="Legenda">
          <TextInput
            value={media[captionField] ?? ''}
            onChange={(e) => onChange({ ...media, [captionField]: e.target.value })}
          />
        </Field>
      )}
    </div>
  );
}

/** Resolve o arquivo pendente da mídia (se houver) para o caminho final publicado, e devolve o objeto limpo. */
function resolveMedia(media: MediaDraft, kind: 'editorial') {
  const images: { path: string; file: File }[] = [];
  const { file, ...clean } = media;

  if (file) {
    const path = homeImagePath(kind, imageExt(file));
    images.push({ path, file });
    const publicSrc = toPublicSrc(path);
    if (clean.type === 'video') clean.poster = publicSrc;
    else clean.src = publicSrc;
  }

  return { media: clean, images };
}

/** Resolve uma imagem do Hero (desktop/mobile) para o caminho final publicado. */
function resolveHeroImage(img: DraftImageItem, kind: 'hero-desktop' | 'hero-mobile') {
  const images: { path: string; file: File }[] = [];
  if (img.file) {
    const path = homeImagePath(kind, imageExt(img.file));
    images.push({ path, file: img.file });
    return { image: { src: toPublicSrc(path), alt: img.alt }, images };
  }
  return { image: { src: img.src, alt: img.alt }, images };
}

function AnnouncementForm({
  announcement,
  onChange,
}: {
  announcement: HeroAnnouncement;
  onChange: (announcement: HeroAnnouncement) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border border-line p-3">
      <label className="flex w-fit items-center gap-2 text-xs uppercase tracking-[0.12em]">
        <input
          type="checkbox"
          checked={announcement.enabled}
          onChange={(e) => onChange({ ...announcement, enabled: e.target.checked })}
        />
        Mostrar anúncio sobre o Hero
      </label>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Título">
            <TextInput
              className="w-full sm:w-auto"
              value={announcement.title}
              onChange={(e) => onChange({ ...announcement, title: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 pb-2 text-[11px] uppercase tracking-[0.1em] text-muted">
            <input
              type="checkbox"
              checked={announcement.titleEnabled}
              onChange={(e) => onChange({ ...announcement, titleEnabled: e.target.checked })}
            />
            Ativo
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Field label="Texto complementar">
            <TextInput
              className="w-full sm:w-auto"
              value={announcement.subtitle}
              onChange={(e) => onChange({ ...announcement, subtitle: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 pb-2 text-[11px] uppercase tracking-[0.1em] text-muted">
            <input
              type="checkbox"
              checked={announcement.subtitleEnabled}
              onChange={(e) => onChange({ ...announcement, subtitleEnabled: e.target.checked })}
            />
            Ativo
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Field label="WhatsApp (só número, ainda sem link)">
            <TextInput
              className="w-full sm:w-auto"
              value={announcement.whatsapp}
              onChange={(e) => onChange({ ...announcement, whatsapp: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 pb-2 text-[11px] uppercase tracking-[0.1em] text-muted">
            <input
              type="checkbox"
              checked={announcement.whatsappEnabled}
              onChange={(e) => onChange({ ...announcement, whatsappEnabled: e.target.checked })}
            />
            Ativo
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Field label="Instagram (@)">
            <TextInput
              className="w-full sm:w-auto"
              value={announcement.instagram}
              onChange={(e) => onChange({ ...announcement, instagram: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 pb-2 text-[11px] uppercase tracking-[0.1em] text-muted">
            <input
              type="checkbox"
              checked={announcement.instagramEnabled}
              onChange={(e) => onChange({ ...announcement, instagramEnabled: e.target.checked })}
            />
            Ativo
          </label>
        </div>
      </div>
    </div>
  );
}

function HeroForm({ draft, setDraft }: { draft: HeroDraft; setDraft: (updater: HeroDraft | ((h: HeroDraft) => HeroDraft)) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <ImagePicker
          label="Imagem desktop — recomendado 1920×1080px (paisagem) ou maior"
          value={draft.desktop}
          onChange={(next) => setDraft({ ...draft, desktop: { src: next.src, alt: draft.desktop.alt, file: next.file } })}
        />
        <Field label="Texto alternativo (alt)">
          <TextInput
            className="mt-2 max-w-xs"
            value={draft.desktop.alt}
            onChange={(e) => setDraft({ ...draft, desktop: { ...draft.desktop, alt: e.target.value } })}
          />
        </Field>
      </div>

      <div>
        <ImagePicker
          label="Imagem mobile — recomendado 1080×1350px (retrato); opcional, usa a desktop se vazio"
          value={draft.mobile}
          onChange={(next) => setDraft({ ...draft, mobile: { src: next.src, alt: draft.mobile.alt, file: next.file } })}
        />
        <Field label="Texto alternativo (alt)">
          <TextInput
            className="mt-2 max-w-xs"
            value={draft.mobile.alt}
            onChange={(e) => setDraft({ ...draft, mobile: { ...draft.mobile, alt: e.target.value } })}
          />
        </Field>
      </div>

      <AnnouncementForm
        announcement={draft.announcement}
        onChange={(announcement) => setDraft({ ...draft, announcement })}
      />
    </div>
  );
}

export function HomeTab() {
  const { homeContent, products, setHomeContent } = useSiteData();
  const { token } = useGithubAuth();

  return (
    <div className="flex flex-col gap-8">
      <EditableCard<HeroDraft>
        title="Hero"
        value={{
          desktop: homeContent.hero.desktop,
          mobile: homeContent.hero.mobile ?? { src: '', alt: '' },
          announcement: homeContent.hero.announcement,
        }}
        onSave={async (draft, report) => {
          const desktop = resolveHeroImage(draft.desktop, 'hero-desktop');
          const mobile = draft.mobile.src ? resolveHeroImage(draft.mobile, 'hero-mobile') : null;
          const nextHome: HomeContent = {
            ...homeContent,
            hero: {
              desktop: desktop.image,
              mobile: mobile?.image,
              announcement: draft.announcement,
            },
          };
          await publishChanges({
            token: token!,
            files: [{ path: 'src/data/home.ts', content: serializeHome(nextHome) }],
            images: [...desktop.images, ...(mobile?.images ?? [])],
            message: 'admin: atualiza hero',
            onStatus: report,
          });
          setHomeContent(nextHome);
        }}
        renderSummary={(hero) => (
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 flex-none overflow-hidden border border-line bg-canvas-alt">
              <ImageThumb image={hero.desktop} className="h-full w-full object-cover" />
            </div>
            <div className="text-sm text-muted">
              <p>{hero.mobile.src ? 'Imagem mobile própria definida' : 'Sem imagem mobile — usa a desktop'}</p>
              {hero.announcement.enabled ? (
                <p className="mt-1">
                  Anúncio ativo{hero.announcement.titleEnabled && hero.announcement.title ? `: “${hero.announcement.title}”` : ''}
                </p>
              ) : (
                <p className="mt-1">Anúncio desativado</p>
              )}
            </div>
          </div>
        )}
        renderForm={(draft, setDraft) => <HeroForm draft={draft} setDraft={setDraft} />}
      />

      <EditableCard<{ title: string; ids: string[]; colors: Record<string, string> }>
        title="Preferidos"
        value={{
          title: homeContent.favoritesTitle,
          ids: homeContent.favoriteProductIds,
          colors: homeContent.favoriteVariantColor ?? {},
        }}
        onSave={async ({ title, ids, colors }, report) => {
          const nextHome: HomeContent = {
            ...homeContent,
            favoritesTitle: title,
            favoriteProductIds: ids,
            favoriteVariantColor: colors,
          };
          await publishChanges({
            token: token!,
            files: [{ path: 'src/data/home.ts', content: serializeHome(nextHome) }],
            images: [],
            message: 'admin: atualiza Preferidos',
            onStatus: report,
          });
          setHomeContent(nextHome);
        }}
        renderSummary={({ title, ids }) => (
          <div>
            <p className="text-sm">Título: {title}</p>
            <p className="mt-1 text-xs text-muted">
              {ids.length} produto(s): {ids.map((id) => products.find((p) => p.id === id)?.name ?? id).join(', ') || '—'}
            </p>
          </div>
        )}
        renderForm={(draft, setDraft) => (
          <div className="flex flex-col gap-5">
            <div className="max-w-xs">
              <Field label="Título da seção">
                <TextInput value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Ordem atual</p>
              {draft.ids.length === 0 && <p className="text-xs text-muted">Nenhum produto selecionado.</p>}
              <div className="flex flex-col gap-2">
                {draft.ids.map((id, i) => {
                  const product = products.find((p) => p.id === id);
                  return (
                    <div key={id} className="flex flex-wrap items-center gap-2 border border-line px-2 py-1.5">
                      <span className="flex-1 text-sm">{product?.name ?? id}</span>
                      {product && product.variants.length > 1 && (
                        <select
                          value={draft.colors[id] ?? product.variants[0].color}
                          onChange={(e) =>
                            setDraft({ ...draft, colors: { ...draft.colors, [id]: e.target.value } })
                          }
                          className="border border-line bg-canvas px-2 py-1 text-xs"
                        >
                          {product.variants.map((v) => (
                            <option key={v.color} value={v.color}>
                              {v.color}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => {
                          const ids = [...draft.ids];
                          [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]];
                          setDraft({ ...draft, ids });
                        }}
                        className="px-1 text-xs disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={i === draft.ids.length - 1}
                        onClick={() => {
                          const ids = [...draft.ids];
                          [ids[i + 1], ids[i]] = [ids[i], ids[i + 1]];
                          setDraft({ ...draft, ids });
                        }}
                        className="px-1 text-xs disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, ids: draft.ids.filter((x) => x !== id) })}
                        className="border border-line px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-muted"
                      >
                        Remover
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Adicionar produto</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {products
                  .filter((p) => !draft.ids.includes(p.id))
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDraft({ ...draft, ids: [...draft.ids, p.id] })}
                      className="border border-line px-2 py-1.5 text-left text-xs"
                    >
                      + {p.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      />

      <EditableCard<MediaDraft>
        title="Bloco editorial final"
        value={homeContent.editorial}
        onSave={async (editorial, report) => {
          const { media, images } = resolveMedia(editorial, 'editorial');
          const nextHome: HomeContent = { ...homeContent, editorial: media as HomeContent['editorial'] };
          await publishChanges({
            token: token!,
            files: [{ path: 'src/data/home.ts', content: serializeHome(nextHome) }],
            images,
            message: 'admin: atualiza bloco editorial',
            onStatus: report,
          });
          setHomeContent(nextHome);
        }}
        renderSummary={(editorial) => (
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 flex-none overflow-hidden border border-line bg-canvas-alt">
              <ImageThumb
                image={{ src: editorial.type === 'video' ? (editorial.poster ?? '') : editorial.src, alt: editorial.alt }}
                className="h-full w-full object-cover"
              />
            </div>
            {editorial.caption && <p className="text-sm">{editorial.caption}</p>}
          </div>
        )}
        renderForm={(draft, setDraft) => <MediaForm media={draft} captionField="caption" onChange={setDraft} />}
      />
    </div>
  );
}
