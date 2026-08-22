import { useMemo, useState } from 'react';
import { useSiteData } from '../data/siteData';
import type { Product } from '../data/types';
import { ProductCard } from '../components/ProductCard';
import { Link } from '../lib/router';

type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'nome';

const SORT_LABELS: Record<SortOption, string> = {
  relevancia: 'Relevância',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  nome: 'Nome A-Z',
};

interface CategoryPageProps {
  slug: string;
}

export function CategoryPage({ slug }: CategoryPageProps) {
  const { categories, getProductsByCategory } = useSiteData();
  const category = categories.find((c) => c.id === slug);
  const allProducts = useMemo(
    () => (category ? getProductsByCategory(category.id) : []),
    [category, getProductsByCategory],
  );

  const [sort, setSort] = useState<SortOption>('relevancia');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableSizes = useMemo(
    () => [...new Set(allProducts.flatMap((p) => p.sizes))],
    [allProducts],
  );
  const availableColors = useMemo(() => {
    const map = new Map<string, string | undefined>();
    allProducts.forEach((p) => p.variants.forEach((v) => map.set(v.color, v.hex)));
    return [...map.entries()];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const min = priceMin ? Number(priceMin) : undefined;
    const max = priceMax ? Number(priceMax) : undefined;

    return allProducts.filter((product) => {
      if (sizes.length > 0 && !product.sizes.some((s) => sizes.includes(s))) return false;
      if (colors.length > 0 && !product.variants.some((v) => colors.includes(v.color))) return false;
      if (min !== undefined && product.price < min) return false;
      if (max !== undefined && product.price > max) return false;
      return true;
    });
  }, [allProducts, sizes, colors, priceMin, priceMax]);

  const sortedProducts = useMemo(() => sortProducts(filteredProducts, sort), [filteredProducts, sort]);

  const hasActiveFilters = sizes.length > 0 || colors.length > 0 || priceMin !== '' || priceMax !== '';

  function clearFilters() {
    setSizes([]);
    setColors([]);
    setPriceMin('');
    setPriceMax('');
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-28 pt-40 text-center sm:px-10">
        <p className="font-display text-3xl">Categoria não encontrada.</p>
        <Link to="/" className="mt-6 inline-block border-b border-ink pb-1 text-sm uppercase tracking-[0.12em]">
          Voltar para a home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
      <header className="border-b border-line pb-8">
        <h1 className="font-display text-4xl sm:text-6xl">{category.label}</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
          {sortedProducts.length} {sortedProducts.length === 1 ? 'peça' : 'peças'}
        </p>
      </header>

      <div className="flex items-center justify-between gap-4 py-6">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="border border-ink px-5 py-2 text-xs uppercase tracking-[0.12em] sm:hidden"
        >
          Filtrar{hasActiveFilters ? ` (${sizes.length + colors.length})` : ''}
        </button>

        <label className="ml-auto flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted">
          Ordenar por
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="border border-line bg-canvas px-3 py-2 text-ink"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-10 sm:grid-cols-[220px_1fr] sm:gap-12">
        <aside className="hidden sm:block">
          <FiltersContent
            availableSizes={availableSizes}
            availableColors={availableColors}
            sizes={sizes}
            colors={colors}
            priceMin={priceMin}
            priceMax={priceMax}
            onToggleSize={(s) => setSizes(toggle(sizes, s))}
            onToggleColor={(c) => setColors(toggle(colors, c))}
            onPriceMinChange={setPriceMin}
            onPriceMaxChange={setPriceMax}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Nenhuma peça encontrada com esses filtros.</p>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="relative max-h-[85vh] w-full overflow-y-auto bg-canvas px-6 pb-8 pt-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Filtros</p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="text-sm uppercase tracking-[0.12em]"
              >
                Fechar
              </button>
            </div>

            <FiltersContent
              availableSizes={availableSizes}
              availableColors={availableColors}
              sizes={sizes}
              colors={colors}
              priceMin={priceMin}
              priceMax={priceMax}
              onToggleSize={(s) => setSizes(toggle(sizes, s))}
              onToggleColor={(c) => setColors(toggle(colors, c))}
              onPriceMinChange={setPriceMin}
              onPriceMaxChange={setPriceMax}
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-8 w-full bg-ink py-3 text-sm uppercase tracking-[0.12em] text-canvas"
            >
              Ver {sortedProducts.length} {sortedProducts.length === 1 ? 'peça' : 'peças'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function sortProducts(list: Product[], sort: SortOption) {
  const sorted = [...list];
  if (sort === 'menor-preco') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'maior-preco') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'nome') sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return sorted;
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface FiltersContentProps {
  availableSizes: string[];
  availableColors: [string, string | undefined][];
  sizes: string[];
  colors: string[];
  priceMin: string;
  priceMax: string;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onPriceMinChange: (value: string) => void;
  onPriceMaxChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

function FiltersContent({
  availableSizes,
  availableColors,
  sizes,
  colors,
  priceMin,
  priceMax,
  onToggleSize,
  onToggleColor,
  onPriceMinChange,
  onPriceMaxChange,
  onClear,
  hasActiveFilters,
}: FiltersContentProps) {
  return (
    <div className="flex flex-col gap-8">
      {availableSizes.length > 0 && (
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Tamanho</p>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onToggleSize(size)}
                className={`h-9 min-w-9 border px-2 text-xs uppercase transition-colors ${
                  sizes.includes(size) ? 'border-ink bg-ink text-canvas' : 'border-line text-ink'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {availableColors.length > 0 && (
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Cor</p>
          <div className="flex flex-wrap gap-3">
            {availableColors.map(([color, hex]) => (
              <button
                key={color}
                type="button"
                onClick={() => onToggleColor(color)}
                title={color}
                className={`h-8 w-8 rounded-full border-2 transition-colors ${
                  colors.includes(color) ? 'border-ink' : 'border-transparent'
                }`}
              >
                <span
                  className="block h-full w-full rounded-full border border-line"
                  style={{ backgroundColor: hex ?? '#ccc' }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Preço</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Mín"
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            className="w-full border border-line bg-canvas px-3 py-2 text-sm"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Máx"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            className="w-full border border-line bg-canvas px-3 py-2 text-sm"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="w-fit text-xs uppercase tracking-[0.12em] text-muted underline underline-offset-4 hover:text-ink"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
