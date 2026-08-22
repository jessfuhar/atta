import type { CategoryEntry, ColorCategory, HomeContent, Product } from '../../data/types';

export function serializeProducts(products: Product[]) {
  return `import type { Category, Product } from './types';\n\nexport const products: Product[] = ${JSON.stringify(products, null, 2)};\n\nexport const getProductById = (id: string) => products.find((p) => p.id === id);\nexport const getProductsByCategory = (category: Category) =>\n  products.filter((p) => p.category === category);\n`;
}

export function serializeCategories(categories: CategoryEntry[]) {
  return `import type { CategoryEntry } from './types';\n\nexport const categories: CategoryEntry[] = ${JSON.stringify(categories, null, 2)};\n`;
}

export function serializeColorCategories(colorCategories: ColorCategory[]) {
  return `import type { ColorCategory } from './types';\n\nexport const colorCategories: ColorCategory[] = ${JSON.stringify(colorCategories, null, 2)};\n`;
}

export function serializeHome(home: HomeContent) {
  return `import type { HomeContent } from './types';\n\nexport const homeContent: HomeContent = ${JSON.stringify(home, null, 2)};\n`;
}
