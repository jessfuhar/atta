import { useState } from 'react';
import { Link } from '../lib/router';
import { HomeTab } from './tabs/HomeTab';
import { CategoriesTab } from './tabs/CategoriesTab';
import { ColorCategoriesTab } from './tabs/ColorCategoriesTab';
import { ProductsTab } from './tabs/ProductsTab';
import { Home } from '../pages/Home';
import { useGithubAuth } from './github/auth';

const TABS = ['Home', 'Produtos', 'Categorias', 'Cores', 'Pré-visualizar'] as const;
type Tab = (typeof TABS)[number];

export function AdminApp() {
  const [tab, setTab] = useState<Tab>('Home');
  const { user, logout } = useGithubAuth();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <p className="font-display text-xl">atta. admin</p>
          <p className="text-xs text-muted">Editar → Salvar e publicar → GitHub → site atualizado</p>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="flex items-center gap-2 text-xs text-muted">
              <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
              {user.login}
            </span>
          )}
          <Link to="/" className="border border-ink px-3 py-1.5 text-xs uppercase tracking-[0.1em]">
            Ver site
          </Link>
          <button type="button" onClick={logout} className="border border-line px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-muted">
            Sair
          </button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-line px-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-3 text-xs uppercase tracking-[0.1em] ${
              tab === t ? 'border-b-2 border-ink text-ink' : 'text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {tab === 'Home' && <HomeTab />}
        {tab === 'Produtos' && <ProductsTab />}
        {tab === 'Categorias' && <CategoriesTab />}
        {tab === 'Cores' && <ColorCategoriesTab />}
        {tab === 'Pré-visualizar' && (
          <div>
            <p className="mb-3 text-xs text-muted">Pré-visualização com os dados atuais (role para ver a Home inteira).</p>
            <div className="h-[80vh] overflow-y-auto border border-line">
              <Home />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
