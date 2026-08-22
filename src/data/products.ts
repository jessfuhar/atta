import type { Category, Product } from './types';

// Dados de exemplo — substituir/expandir quando as fotos reais chegarem.
export const products: Product[] = [
  {
    id: 'legging-essential',
    slug: 'legging-essential',
    name: 'Legging Essential',
    category: 'leggings',
    price: 249,
    sizes: ['P', 'M', 'G'],
    description: 'Legging de compressão média, cintura alta.',
    variants: [
      {
        color: 'Preto',
        hex: '#111111',
        images: [
          { src: '/images/products/legging-essential/preto-01.svg', alt: 'Legging Essential preta, vista frontal' },
          { src: '/images/products/legging-essential/preto-02.svg', alt: 'Legging Essential preta, detalhe' },
        ],
      },
      {
        color: 'Branco',
        hex: '#f5f5f5',
        images: [
          { src: '/images/products/legging-essential/branco-01.svg', alt: 'Legging Essential branca, vista frontal' },
        ],
      },
    ],
  },
  {
    id: 'top-essential',
    slug: 'top-essential',
    name: 'Top Essential',
    category: 'tops',
    price: 149,
    sizes: ['P', 'M', 'G'],
    description: 'Top de sustentação média com costas nadador.',
    variants: [
      {
        color: 'Preto',
        hex: '#111111',
        images: [
          { src: '/images/products/top-essential/preto-01.svg', alt: 'Top Essential preto, vista frontal' },
          { src: '/images/products/top-essential/preto-02.svg', alt: 'Top Essential preto, detalhe' },
        ],
      },
    ],
  },
  {
    id: 'short-essential',
    slug: 'short-essential',
    name: 'Short Essential',
    category: 'shorts',
    price: 179,
    sizes: ['P', 'M', 'G'],
    description: 'Short de treino com forro interno.',
    variants: [
      {
        color: 'Preto',
        hex: '#111111',
        images: [
          { src: '/images/products/short-essential/preto-01.svg', alt: 'Short Essential preto, vista frontal' },
        ],
      },
    ],
  },
  {
    id: 'cropped-essential',
    slug: 'cropped-essential',
    name: 'Cropped Essential',
    category: 'croppeds',
    price: 159,
    sizes: ['P', 'M', 'G'],
    description: 'Cropped canelado, gola alta.',
    variants: [
      {
        color: 'Branco',
        hex: '#f5f5f5',
        images: [
          { src: '/images/products/cropped-essential/branco-01.svg', alt: 'Cropped Essential branco, vista frontal' },
        ],
      },
    ],
  },
  {
    id: 'macacao-essential',
    slug: 'macacao-essential',
    name: 'Macacão Essential',
    category: 'macacoes',
    price: 329,
    sizes: ['P', 'M', 'G'],
    description: 'Macacão de compressão, decote V.',
    variants: [
      {
        color: 'Preto',
        hex: '#111111',
        images: [
          { src: '/images/products/macacao-essential/preto-01.svg', alt: 'Macacão Essential preto, vista frontal' },
        ],
      },
    ],
  },
  {
    id: 'jaqueta-essential',
    slug: 'jaqueta-essential',
    name: 'Jaqueta Essential',
    category: 'jaquetas',
    price: 379,
    sizes: ['P', 'M', 'G'],
    description: 'Jaqueta corta-vento com zíper frontal.',
    variants: [
      {
        color: 'Preto',
        hex: '#111111',
        images: [
          { src: '/images/products/jaqueta-essential/preto-01.svg', alt: 'Jaqueta Essential preta, vista frontal' },
        ],
      },
    ],
  },
];

export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getProductsByCategory = (category: Category) =>
  products.filter((p) => p.category === category);
