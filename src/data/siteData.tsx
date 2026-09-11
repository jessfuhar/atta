import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { products as baseProducts } from './products';
import { categories as baseCategories } from './categories';
import { colorCategories as baseColorCategories } from './colorCategories';
import { kits as baseKits } from './kits';
import { homeContent as baseHomeContent } from './home';
import type { Category, CategoryEntry, ColorCategory, HomeContent, Kit, Product, ProductVariant } from './types';

const STORAGE_KEY = 'atta:admin:overrides:v1';

interface Overrides {
  products?: Product[];
  categories?: CategoryEntry[];
  colorCategories?: ColorCategory[];
  kits?: Kit[];
  home?: HomeContent;
}

function loadOverrides(): Overrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage indisponível (modo privado/quota) — edição não persiste, mas o site não quebra.
  }
}

function normalizeColor(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

/** "manga-longa" -> "Manga Longa" — rótulo de fallback para categoria usada por um produto mas ainda não cadastrada. */
function humanizeCategoryId(id: string) {
  return id
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export interface ColorMatch {
  product: Product;
  variant: ProductVariant;
}

interface SiteDataContextValue {
  products: Product[];
  categories: CategoryEntry[];
  /** categories + qualquer category id usado por produtos mas ainda não cadastrado — nunca fica vazia por falta de cadastro duplicado. */
  resolvedCategories: CategoryEntry[];
  colorCategories: ColorCategory[];
  kits: Kit[];
  homeContent: HomeContent;
  getProductsByCategory: (category: Category) => Product[];
  getProductsByColorLabel: (label: string) => Product[];
  /** Produto + a variante exata daquela cor — sem fallback para outra cor. Usado em /cor/:id. */
  getColorMatches: (label: string) => ColorMatch[];
  /** Todas as variantes (todas as cores) de todos os produtos de uma categoria — cada cor vira um card próprio. */
  getCategoryVariants: (category: Category) => ColorMatch[];
  /** Resolve um item de kit para o produto e a variante referenciados — null se algum não existir mais. */
  resolveKitItem: (item: { productId: string; color: string }) => ColorMatch | null;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: CategoryEntry[]) => void;
  setColorCategories: (colorCategories: ColorCategory[]) => void;
  setKits: (kits: Kit[]) => void;
  setHomeContent: (home: HomeContent) => void;
  resetAll: () => void;
  hasOverrides: boolean;
}

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>(() => loadOverrides());

  const products = overrides.products ?? baseProducts;
  const categories = overrides.categories ?? baseCategories;
  const colorCategories = overrides.colorCategories ?? baseColorCategories;
  const kits = overrides.kits ?? baseKits;
  const homeContent = overrides.home ?? baseHomeContent;

  const value = useMemo<SiteDataContextValue>(() => {
    function update(next: Overrides) {
      setOverrides(next);
      saveOverrides(next);
    }

    function findVariant(product: Product, color: string): ProductVariant | undefined {
      const target = normalizeColor(color);
      return product.variants.find((v) => normalizeColor(v.color) === target);
    }

    const knownCategoryIds = new Set(categories.map((c) => c.id));
    const resolvedCategories: CategoryEntry[] = [...categories];
    for (const p of products) {
      if (p.category && !knownCategoryIds.has(p.category)) {
        knownCategoryIds.add(p.category);
        resolvedCategories.push({ id: p.category, label: humanizeCategoryId(p.category) });
      }
    }

    return {
      products,
      categories,
      resolvedCategories,
      colorCategories,
      kits,
      homeContent,
      getProductsByCategory: (category) => products.filter((p) => p.category === category),
      getProductsByColorLabel: (label) => {
        const target = normalizeColor(label);
        return products.filter((p) => p.variants.some((v) => normalizeColor(v.color) === target));
      },
      getColorMatches: (label) => {
        const target = normalizeColor(label);
        const matches: ColorMatch[] = [];
        for (const product of products) {
          const variant = product.variants.find((v) => normalizeColor(v.color) === target);
          if (variant) matches.push({ product, variant });
        }
        return matches;
      },
      getCategoryVariants: (category) => {
        const matches: ColorMatch[] = [];
        for (const product of products) {
          if (product.category !== category) continue;
          for (const variant of product.variants) matches.push({ product, variant });
        }
        return matches;
      },
      resolveKitItem: (item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const variant = findVariant(product, item.color);
        if (!variant) return null;
        return { product, variant };
      },
      setProducts: (list) => update({ ...overrides, products: list }),
      setCategories: (list) => update({ ...overrides, categories: list }),
      setColorCategories: (list) => update({ ...overrides, colorCategories: list }),
      setKits: (list) => update({ ...overrides, kits: list }),
      setHomeContent: (home) => update({ ...overrides, home }),
      resetAll: () => update({}),
      hasOverrides: Boolean(
        overrides.products || overrides.categories || overrides.colorCategories || overrides.kits || overrides.home,
      ),
    };
  }, [overrides, products, categories, colorCategories, kits, homeContent]);

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData deve ser usado dentro de SiteDataProvider');
  return ctx;
}
