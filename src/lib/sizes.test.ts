import { describe, expect, it } from 'vitest';
import { availableSizesFor, resolveValidSize } from './sizes';

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

describe('resolveValidSize', () => {
  it('mantém o tamanho se ainda disponível na nova cor', () => {
    expect(resolveValidSize(['P', 'M', 'G'], 'M')).toBe('M');
  });

  it('limpa o tamanho ao trocar para uma cor sem esse tamanho (ex.: GG indisponível)', () => {
    expect(resolveValidSize(['P', 'M', 'G'], 'GG')).toBeUndefined();
  });

  it('sem tamanho escolhido continua sem seleção', () => {
    expect(resolveValidSize(['P', 'M', 'G'], undefined)).toBeUndefined();
  });
});
