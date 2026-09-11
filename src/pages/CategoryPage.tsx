import { useMemo, useState } from 'react';
import { useSiteData, type ColorMatch } from '../data/siteData';
import { ProductCard } from '../components/ProductCard';
import { Link } from '../lib/router';

type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'nome';

const SORT_LABELS: Record<SortOption, string> = {
  relevancia: 'Relevância',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  nome: 'Nome A-Z',
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

interface CategoryPageProps {
  slug: string;
}

/** Cada cor de cada produto da categoria vira um card próprio — nenhuma cor fica escondida atrás da página do produto. */
export function CategoryPage({ slug }: CategoryPageProps) {
  const { resolvedCategories, getCategoryVariants } = useSiteData();
  const category = resolvedCategories.find((c) => c.id === slug);
  const allVariants = useMemo(
    () => (category ? getCategoryVariants(category.id) : []),
    [category, getCategoryVariants],
  );

  const [sort, setSort] = useState<SortOption>('relevancia');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableSizes = useMemo(
    () => [...new Set(allVariants.flatMap(({ product }) => product.sizes))],
    [allVariants],
  );
  const availableColors = useMemo(() => {
    const map = new Map<string, { label: string; hex: string | undefined }>();
    for (const { variant } of allVariants) {
      const key = normalize(variant.color);
      if (!map.has(key)) map.set(key, { label: variant.color.trim(), hex: variant.hex });
    }
    return [...map.entries()];
  }, [allVariants]);

  const filteredVariants = useMemo(() => {
    const min = priceMin ? Number(priceMin) : undefined;
    const max = priceMax ? Number(priceMax) : undefined;
    const selectedColors = colors;

    return allVariants.filter(({ product, variant }) => {
      if (sizes.length > 0 && !product.sizes.some((s) => sizes.includes(s))) return false;
      if (selectedColors.length > 0 && !selectedColors.includes(normalize(variant.color))) return false;
      if (min !== undefined && product.price < min) return false;
      if (max !== undefined && product.price > max) return false;
      return true;
    });
  }, [allVariants, sizes, colors, priceMin, priceMax]);

  const sortedVariants = useMemo(() => sortVariants(filteredVariants, sort), [filteredVariants, sort]);

  const hasActiveFilters = sizes.length > 0 || colors.length > 0 || priceMin !== '' || priceMax !== '';

  function clearFilters() {
    setSizes([]);
    setColors([]);
    setPriceMin('');
    setPriceMax('');
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl safe-px pb-28 pt-40 text-center">
        <p className="font-display text-3xl">Categoria não encontrada.</p>
        <Link to="/" className="mt-6 inline-block border-b border-ink pb-1 text-sm uppercase tracking-[0.12em]">
          Voltar para a home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl safe-px pb-28 pt-28 sm:pt-36">
      <header className="border-b border-line pb-8">
        <h1 className="font-display text-4xl sm:text-6xl">{category.label}</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
          {sortedVariants.length} {sortedVariants.length === 1 ? 'peça' : 'peças'}
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 py-6">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="border border-ink px-5 py-2 text-xs uppercase tracking-[0.12em] sm:hidden"
        >
          Filtrar{hasActiveFilters ? ` (${sizes.length + colors.length})` : ''}
        </button>

        <label className="flex min-w-0 flex-1 items-center justify-end gap-2 text-xs uppercase tracking-[0.12em] text-muted sm:ml-auto sm:flex-none">
          <span className="hidden sm:inline">Ordenar por</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="min-w-0 max-w-full border border-line bg-canvas px-3 py-2 text-ink"
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
            onClearColors={() => setColors([])}
            onPriceMinChange={setPriceMin}
            onPriceMaxChange={setPriceMax}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {sortedVariants.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
            {sortedVariants.map(({ product, variant }) => (
              <ProductCard
                key={`${product.id}-${variant.color}`}
                product={product}
                variant={variant}
                showVariantColor
                to={`/produto/${product.slug}/${product.variants.indexOf(variant)}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Nenhuma peça encontrada com esses filtros.</p>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="relative max-h-[85vh] w-full overflow-y-auto bg-canvas safe-px pb-8 pt-6">
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
              onClearColors={() => setColors([])}
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
              Ver {sortedVariants.length} {sortedVariants.length === 1 ? 'peça' : 'peças'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function sortVariants(list: ColorMatch[], sort: SortOption) {
  const sorted = [...list];
  if (sort === 'menor-preco') sorted.sort((a, b) => a.product.price - b.product.price);
  if (sort === 'maior-preco') sorted.sort((a, b) => b.product.price - a.product.price);
  if (sort === 'nome') sorted.sort((a, b) => a.product.name.localeCompare(b.product.name, 'pt-BR'));
  return sorted;
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface FiltersContentProps {
  availableSizes: string[];
  availableColors: [string, { label: string; hex: string | undefined }][];
  sizes: string[];
  colors: string[];
  priceMin: string;
  priceMax: string;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onClearColors: () => void;
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
  onClearColors,
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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClearColors}
              className={`border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
                colors.length === 0 ? 'border-ink bg-ink text-canvas' : 'border-line text-ink'
              }`}
            >
              Todas
            </button>
            {availableColors.map(([key, { label, hex }]) => (
              <button
                key={key}
                type="button"
                onClick={() => onToggleColor(key)}
                className={`flex items-center gap-2 border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
                  colors.includes(key) ? 'border-ink' : 'border-line'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 flex-none rounded-full border border-line"
                  style={{ backgroundColor: hex ?? '#ccc' }}
                />
                {label}
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
