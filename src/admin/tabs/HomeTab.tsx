import { useSiteData } from '../../data/siteData';
import type { HomeContent, Media } from '../../data/types';
import { ImagePicker } from '../ImagePicker';
import { Field, TextInput } from '../Field';

function MediaEditor({
  media,
  onChange,
  captionField,
}: {
  media: Media & { headline?: string; subline?: string; caption?: string };
  onChange: (media: Media & { headline?: string; subline?: string; caption?: string }) => void;
  captionField?: 'subline' | 'caption';
}) {
  return (
    <div className="flex flex-col gap-4 border border-line p-4">
      <Field label="Tipo de mídia">
        <select
          value={media.type}
          onChange={(e) => {
            const type = e.target.value as 'image' | 'video';
            if (type === 'video') {
              onChange({ ...media, type, poster: 'poster' in media ? media.poster : '' } as never);
            } else {
              onChange({ ...media, type } as never);
            }
          }}
          className="border border-line bg-canvas px-2 py-1.5 text-sm"
        >
          <option value="image">Imagem</option>
          <option value="video">Vídeo</option>
        </select>
      </Field>

      <ImagePicker
        label={media.type === 'video' ? 'Poster do vídeo' : 'Imagem'}
        value={media.type === 'video' ? (media as { poster: string }).poster : media.src}
        onChange={(src) =>
          onChange(media.type === 'video' ? ({ ...media, poster: src } as never) : { ...media, src })
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
    </div>
  );
}

export function HomeTab() {
  const { homeContent, products, setHomeContent } = useSiteData();

  function patch(next: Partial<HomeContent>) {
    setHomeContent({ ...homeContent, ...next });
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-3 font-display text-xl">Hero</h2>
        <MediaEditor
          media={homeContent.hero}
          captionField="subline"
          onChange={(hero) => patch({ hero: hero as HomeContent['hero'] })}
        />
        <div className="mt-3 max-w-xs">
          <Field label="Título (headline)">
            <TextInput
              value={homeContent.hero.headline}
              onChange={(e) => patch({ hero: { ...homeContent.hero, headline: e.target.value } })}
            />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl">Preferidos</h2>
        <div className="max-w-xs">
          <Field label="Título da seção">
            <TextInput
              value={homeContent.favoritesTitle}
              onChange={(e) => patch({ favoritesTitle: e.target.value })}
            />
          </Field>
        </div>

        <p className="mb-2 mt-4 text-xs uppercase tracking-[0.15em] text-muted">Produtos em destaque</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {products.map((product) => {
            const checked = homeContent.favoriteProductIds.includes(product.id);
            return (
              <label key={product.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    patch({
                      favoriteProductIds: checked
                        ? homeContent.favoriteProductIds.filter((id) => id !== product.id)
                        : [...homeContent.favoriteProductIds, product.id],
                    })
                  }
                />
                {product.name}
              </label>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl">Bloco editorial final</h2>
        <MediaEditor
          media={homeContent.editorial}
          captionField="caption"
          onChange={(editorial) => patch({ editorial: editorial as HomeContent['editorial'] })}
        />
      </section>
    </div>
  );
}
