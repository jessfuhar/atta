import { describe, expect, it } from 'vitest';
import { availableSizesFor } from './sizes';

describe('availableSizesFor', () => {
  it('legging marrom sem GG: P, M, G disponíveis, GG indisponível', () => {
    const product = { sizes: ['P', 'M', 'G'] };
    const variant = { sizes: undefined };
    expect(availableSizesFor(product, variant)).toEqual(['P', 'M', 'G']);
  });

  it('usa os tamanhos da variante quando definidos, ignorando os do produto', () => {
    const product = { sizes: ['P', 'M', 'G', 'GG'] };
    const variant = { sizes: ['M', 'G'] };
    expect(availableSizesFor(product, variant)).toEqual(['M', 'G']);
  });
});
