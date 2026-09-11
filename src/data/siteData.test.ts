import { describe, expect, it } from 'vitest';
import { isValidHome } from './siteData';
import { homeContent } from './home';

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
