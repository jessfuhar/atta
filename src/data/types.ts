/** Slug da categoria de peça — editável/expansível pelo admin, por isso é string livre. */
export type Category = string;

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

/** Categoria por cor — independente da categoria de peça. Vincula produtos pela cor das variantes (sem duplicar dados). */
export interface ColorCategory {
  id: string;
  label: string;
  hex: string;
  image?: { src: string; alt: string };
}

/** Referência a uma variante existente de um produto — kit nunca duplica dados de produto. */
export interface KitItem {
  productId: string;
  color: string;
}

export interface Kit {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  /** 1ª foto = capa, 2ª = hover, demais = galeria da página do kit (mesma convenção do produto). */
  images: { src: string; alt: string }[];
  items: KitItem[];
}

export interface HomeContent {
  hero: Media & { headline: string; subline?: string };
  favoritesTitle: string;
  favoriteProductIds: string[];
  editorial: Media & { caption?: string };
}
