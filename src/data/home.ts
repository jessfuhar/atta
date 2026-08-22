import type { HomeContent } from './types';

// Único ponto de edição para trocar hero, título/produtos dos preferidos e bloco editorial final.
export const homeContent: HomeContent = {
  hero: {
    type: 'image', // trocar para 'video' + adicionar poster quando houver material em vídeo
    src: '/images/collections/colecao-anterior/hero.svg',
    alt: 'Campanha atta.',
    headline: 'atta.',
    subline: 'Movimento com atitude.',
  },
  favoritesTitle: 'Preferidos', // pode virar qualquer outro texto
  favoriteProductIds: ['legging-essential', 'top-essential'],
  editorial: {
    type: 'image',
    src: '/images/collections/colecao-anterior/hero.svg',
    alt: 'atta. em movimento',
    caption: 'Força é a nova forma.',
  },
};
