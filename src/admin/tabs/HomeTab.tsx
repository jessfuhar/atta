import { useSiteData } from '../../data/siteData';
import type { HomeContent, Media } from '../../data/types';
import { ImagePicker } from '../ImagePicker';
import { ImageThumb } from '../ImageThumb';
import { Field, TextInput } from '../Field';
import { EditableCard } from '../EditableCard';
import { useGithubAuth } from '../github/auth';
import { publishChanges, type PublishStatus } from '../github/publish';
import { serializeHome } from '../github/serialize';
import { homeImagePath, imageExt, toPublicSrc } from '../github/images';

type MediaDraft = Media & { headline?: string; subline?: string; caption?: string; poster?: string; file?: File };

function MediaForm({
  media,
  onChange,
  captionField,
}: {
  media: MediaDraft;
  onChange: (media: MediaDraft) => void;
  captionField?: 'subline' | 'caption';
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
        <Field label={captionField === 'subline' ? 'Subtítulo (hero)' : 'Legenda'}>
          <TextInput
            value={media[captionField] ?? ''}
            onChange={(e) => onChange({ ...media, [captionField]: e.target.value })}
          />
        </Field>
      )}

      {captionField === 'subline' && (
        <Field label="Título (headline)">
          <TextInput value={media.headline ?? ''} onChange={(e) => onChange({ ...media, headline: e.target.value })} />
        </Field>
      )}
    </div>
  );
}

/** Resolve o arquivo pendente da mídia (se houver) para o caminho final publicado, e devolve o objeto limpo. */
function resolveMedia(media: MediaDraft, kind: 'hero' | 'editorial') {
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

export function HomeTab() {
  const { homeContent, products, setHomeContent } = useSiteData();
  const { token } = useGithubAuth();

  async function saveSection(
    kind: 'hero' | 'editorial',
    draft: MediaDraft,
    label: string,
    report: (s: PublishStatus) => void,
  ) {
    const { media, images } = resolveMedia(draft, kind);
    const nextHome = { ...homeContent, [kind]: media } as HomeContent;
    await publishChanges({
      token: token!,
      files: [{ path: 'src/data/home.ts', content: serializeHome(nextHome) }],
      images,
      message: `admin: atualiza ${label}`,
      onStatus: report,
    });
    setHomeContent(nextHome);
  }

  return (
    <div className="flex flex-col gap-8">
      <EditableCard<MediaDraft>
        title="Hero"
        value={homeContent.hero}
        onSave={(hero, report) => saveSection('hero', hero, 'hero', report)}
        renderSummary={(hero) => (
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 flex-none overflow-hidden border border-line bg-canvas-alt">
              <ImageThumb
                image={{ src: hero.type === 'video' ? (hero.poster ?? '') : hero.src, alt: hero.alt }}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm">{hero.headline}</p>
              {hero.subline && <p className="text-xs text-muted">{hero.subline}</p>}
            </div>
          </div>
        )}
        renderForm={(draft, setDraft) => <MediaForm media={draft} captionField="subline" onChange={setDraft} />}
      />

      <EditableCard<{ title: string; ids: string[] }>
        title="Preferidos"
        value={{ title: homeContent.favoritesTitle, ids: homeContent.favoriteProductIds }}
        onSave={async ({ title, ids }, report) => {
          const nextHome: HomeContent = { ...homeContent, favoritesTitle: title, favoriteProductIds: ids };
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
                    <div key={id} className="flex items-center gap-2 border border-line px-2 py-1.5">
                      <span className="flex-1 text-sm">{product?.name ?? id}</span>
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
        onSave={(editorial, report) => saveSection('editorial', editorial, 'bloco editorial', report)}
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
