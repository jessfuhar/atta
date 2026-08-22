import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { products as baseProducts } from './products';
import { categories as baseCategories } from './categories';
import { colorCategories as baseColorCategories } from './colorCategories';
import { homeContent as baseHomeContent } from './home';
import type { Category, CategoryEntry, ColorCategory, HomeContent, Product } from './types';

const STORAGE_KEY = 'atta:admin:overrides:v1';

interface Overrides {
  products?: Product[];
  categories?: CategoryEntry[];
  colorCategories?: ColorCategory[];
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

interface SiteDataContextValue {
  products: Product[];
  categories: CategoryEntry[];
  colorCategories: ColorCategory[];
  homeContent: HomeContent;
  getProductsByCategory: (category: Category) => Product[];
  getProductsByColorLabel: (label: string) => Product[];
  setProducts: (products: Product[]) => void;
  setCategories: (categories: CategoryEntry[]) => void;
  setColorCategories: (colorCategories: ColorCategory[]) => void;
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
  const homeContent = overrides.home ?? baseHomeContent;

  const value = useMemo<SiteDataContextValue>(() => {
    function update(next: Overrides) {
      setOverrides(next);
      saveOverrides(next);
    }

    return {
      products,
      categories,
      colorCategories,
      homeContent,
      getProductsByCategory: (category) => products.filter((p) => p.category === category),
      getProductsByColorLabel: (label) => {
        const target = normalizeColor(label);
        return products.filter((p) => p.variants.some((v) => normalizeColor(v.color) === target));
      },
      setProducts: (list) => update({ ...overrides, products: list }),
      setCategories: (list) => update({ ...overrides, categories: list }),
      setColorCategories: (list) => update({ ...overrides, colorCategories: list }),
      setHomeContent: (home) => update({ ...overrides, home }),
      resetAll: () => update({}),
      hasOverrides: Boolean(
        overrides.products || overrides.categories || overrides.colorCategories || overrides.home,
      ),
    };
  }, [overrides, products, categories, colorCategories, homeContent]);

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData deve ser usado dentro de SiteDataProvider');
  return ctx;
}
