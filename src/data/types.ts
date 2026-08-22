export type Category =
  | 'leggings'
  | 'shorts'
  | 'tops'
  | 'croppeds'
  | 'macacoes'
  | 'jaquetas';

/** Imagem hoje, vídeo amanhã — mesma forma de uso nos componentes. */
export type Media =
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; src: string; poster: string; alt: string };

export interface ProductVariant {
  color: string;
  hex?: string;
  images: { src: string; alt: string }[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  sizes: string[];
  variants: ProductVariant[];
  description: string;
}

export interface CategoryEntry {
  id: Category;
  label: string;
  image: { src: string; alt: string };
}

export interface HomeContent {
  hero: Media & { headline: string; subline?: string };
  favoritesTitle: string;
  favoriteProductIds: string[];
  editorial: Media & { caption?: string };
}
