import { describe, expect, it } from 'vitest';
import { products } from './products';
import { homeContent } from './home';
import { categories } from './categories';
import { colorCategories } from './colorCategories';

/**
 * Regressão do bug de qualidade de imagem: um `hero.src` e a capa da Legging Essential acabaram
 * embutidos como base64 direto nos arquivos de dados (em vez de um arquivo em public/images/),
 * o que inchava o bundle e entregava uma versão mais comprimida que a de um upload normal.
 * Percorre todo valor de string nos dados do site e garante que nenhum é uma imagem inline —
 * toda imagem deve ser um caminho `/images/...` para um arquivo publicado.
 */
function collectDataUris(value: unknown, path: string, found: string[]) {
  if (typeof value === 'string') {
    if (value.startsWith('data:image')) found.push(path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectDataUris(v, `${path}[${i}]`, found));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) collectDataUris(v, `${path}.${k}`, found);
  }
}

describe('dados do site: imagens nunca embutidas em base64', () => {
  it('products.ts / home.ts / categories.ts / colorCategories.ts só referenciam arquivos publicados', () => {
    const found: string[] = [];
    collectDataUris(products, 'products', found);
    collectDataUris(homeContent, 'homeContent', found);
    collectDataUris(categories, 'categories', found);
    collectDataUris(colorCategories, 'colorCategories', found);
    expect(found).toEqual([]);
  });
});
