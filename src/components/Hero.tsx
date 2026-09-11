import type { HeroAnnouncement } from '../data/types';
import { withBase, LOGO_WHITE } from '../lib/assets';

interface HeroImage {
  src: string;
  alt: string;
}

interface HeroProps {
  desktop: HeroImage;
  mobile?: HeroImage;
  announcement: HeroAnnouncement;
}

/** Altura reduzida no mobile (evita hero gigante); imagem mobile é opcional — sem ela, usa a desktop. */
export function Hero({ desktop, mobile, announcement }: HeroProps) {
  const showText = announcement.enabled;
  const showTitle = showText && announcement.titleEnabled && announcement.title.trim();
  const showSubtitle = showText && announcement.subtitleEnabled && announcement.subtitle.trim();
  const showWhatsapp = showText && announcement.whatsappEnabled && announcement.whatsapp.trim();
  const showInstagram = showText && announcement.instagramEnabled && announcement.instagram.trim();

  return (
    <section className="relative h-[64vh] min-h-[460px] overflow-hidden bg-ink sm:h-screen sm:min-h-[640px]">
      <picture>
        {mobile?.src && <source media="(max-width: 639px)" srcSet={withBase(mobile.src)} />}
        <img
          src={withBase(desktop.src)}
          alt={desktop.alt}
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end safe-px pb-20 sm:pb-28">
        <img src={withBase(LOGO_WHITE)} alt="atta." className="h-auto w-44 sm:w-56 lg:w-[280px]" />

        {showText && (
          <div className="mt-5 max-w-sm text-canvas [text-shadow:0_1px_12px_rgb(0_0_0_/_0.45)]">
            {showTitle && <p className="font-display text-2xl sm:text-3xl">{announcement.title}</p>}
            {showSubtitle && <p className="mt-2 text-base text-canvas/90 sm:text-lg">{announcement.subtitle}</p>}
            {(showWhatsapp || showInstagram) && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs uppercase tracking-[0.15em] text-canvas/90">
                {showWhatsapp && <span>WhatsApp {announcement.whatsapp}</span>}
                {showInstagram && <span>{announcement.instagram}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-10 left-1/2 hidden h-12 w-px -translate-x-1/2 bg-canvas/60 sm:block" />
    </section>
  );
}
