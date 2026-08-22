import { useSiteData } from '../data/siteData';

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const { products, categories, colorCategories, homeContent, resetAll, hasOverrides } = useSiteData();

  function exportProducts() {
    downloadText(
      'products.ts',
      `import type { Category, Product } from './types';\n\nexport const products: Product[] = ${JSON.stringify(products, null, 2)};\n\nexport const getProductById = (id: string) => products.find((p) => p.id === id);\nexport const getProductsByCategory = (category: Category) =>\n  products.filter((p) => p.category === category);\n`,
    );
  }

  function exportCategories() {
    downloadText(
      'categories.ts',
      `import type { CategoryEntry } from './types';\n\nexport const categories: CategoryEntry[] = ${JSON.stringify(categories, null, 2)};\n`,
    );
  }

  function exportColorCategories() {
    downloadText(
      'colorCategories.ts',
      `import type { ColorCategory } from './types';\n\nexport const colorCategories: ColorCategory[] = ${JSON.stringify(colorCategories, null, 2)};\n`,
    );
  }

  function exportHome() {
    downloadText(
      'home.ts',
      `import type { HomeContent } from './types';\n\nexport const homeContent: HomeContent = ${JSON.stringify(homeContent, null, 2)};\n`,
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        O site é estático (GitHub Pages), sem backend. As edições feitas aqui ficam salvas neste
        navegador (localStorage) e já refletem na pré-visualização. Para publicar as mudanças para
        todo mundo, baixe os arquivos abaixo e substitua os arquivos correspondentes em{' '}
        <code>src/data/</code>, depois faça commit e push.
      </p>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={exportProducts} className="border border-ink px-4 py-2 text-xs uppercase tracking-[0.1em]">
          Baixar products.ts
        </button>
        <button type="button" onClick={exportCategories} className="border border-ink px-4 py-2 text-xs uppercase tracking-[0.1em]">
          Baixar categories.ts
        </button>
        <button type="button" onClick={exportColorCategories} className="border border-ink px-4 py-2 text-xs uppercase tracking-[0.1em]">
          Baixar colorCategories.ts
        </button>
        <button type="button" onClick={exportHome} className="border border-ink px-4 py-2 text-xs uppercase tracking-[0.1em]">
          Baixar home.ts
        </button>
      </div>

      <div className="border-t border-line pt-4">
        <p className="mb-2 text-xs text-muted">
          Imagens enviadas por upload aqui são apenas pré-visualização (guardadas como dado embutido
          no navegador). Para que uma imagem nova apareça no site publicado, salve o arquivo em{' '}
          <code>public/images/...</code> e selecione-a pela biblioteca.
        </p>
        <button
          type="button"
          disabled={!hasOverrides}
          onClick={() => {
            if (confirm('Restaurar os dados originais e apagar as edições deste navegador?')) resetAll();
          }}
          className="border border-line px-4 py-2 text-xs uppercase tracking-[0.1em] text-muted disabled:opacity-40"
        >
          Restaurar dados originais
        </button>
      </div>
    </div>
  );
}
