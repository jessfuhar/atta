import { describe, expect, it } from 'vitest';
import { computeKitPricing, isValidHome } from './siteData';
import { homeContent } from './home';
import type { Product } from './types';

/**
 * Regressão: um rascunho salvo no localStorage antes da mudança de estrutura do Hero
 * (sem `announcement`) travava o site inteiro com "Cannot read properties of undefined
 * (reading 'enabled')" assim que alguém abria o site num navegador com esse rascunho salvo.
 * loadOverrides() descarta um `home` que não bate com o formato atual em vez de confiar nele.
 */
describe('isValidHome', () => {
  it('aceita o home.ts publicado', () => {
    expect(isValidHome(homeContent)).toBe(true);
  });

  it('rejeita o formato antigo do hero (sem announcement)', () => {
    expect(
      isValidHome({
        hero: { type: 'image', src: '/images/collections/hero.jpg', alt: '', headline: 'atta.', subline: '' },
        favoritesTitle: 'Preferidos',
        favoriteProductIds: [],
        editorial: { type: 'image', src: '', alt: '' },
      }),
    ).toBe(false);
  });

  it('rejeita valores vazios/indefinidos', () => {
    expect(isValidHome(undefined)).toBe(false);
    expect(isValidHome(null)).toBe(false);
    expect(isValidHome({})).toBe(false);
  });
});

function product(id: string, price: number): Product {
  return { id, slug: id, name: id, category: 'x', price, sizes: [], variants: [], description: '' };
}

describe('computeKitPricing', () => {
  const products = [product('a', 85), product('b', 85), product('c', 85)];

  it('soma os preços atuais dos produtos do kit — nunca um valor salvo à parte', () => {
    const kit = { price: 240, items: [{ productId: 'a', color: 'Preto' }, { productId: 'b', color: 'Preto' }, { productId: 'c', color: 'Preto' }] };
    expect(computeKitPricing(kit, products)).toEqual({ original: 255, final: 240, hasDiscount: true });
  });

  it('acompanha a mudança de preço do produto automaticamente (sem duplicar o valor)', () => {
    const kit = { price: 240, items: [{ productId: 'a', color: 'Preto' }] };
    const raised = [product('a', 120), product('b', 85), product('c', 85)];
    expect(computeKitPricing(kit, raised).original).toBe(120);
  });

  it('não mostra desconto falso quando o preço do kit não é menor que a soma', () => {
    const kit = { price: 260, items: [{ productId: 'a', color: 'Preto' }, { productId: 'b', color: 'Preto' }] };
    expect(computeKitPricing(kit, products).hasDiscount).toBe(false);
  });
});
