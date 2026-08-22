const BASE = import.meta.env.BASE_URL;

export const LOGO_WHITE = '/images/brand/atta. sem fundo logo branca.png';
export const LOGO_BLACK = '/images/brand/atta. sem fundo logo preta.png';

/** Resolve caminhos de mídia vindos de src/data (ex.: "/images/x.svg") contra o base do deploy (GitHub Pages: /atta/). */
export function withBase(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return BASE + path.replace(/^\/+/, '');
}
