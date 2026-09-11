import { withBase, LOGO_BLACK } from '../lib/assets';
import { Link } from '../lib/router';
import { useSiteData } from '../data/siteData';

export function Footer() {
  const { resolvedCategories: categories } = useSiteData();
  return (
    <footer className="border-t border-line safe-px py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/">
          <img src={withBase(LOGO_BLACK)} alt="atta." className="h-5 w-auto" />
        </Link>

        <nav className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.12em] text-muted">
          {categories.map((category) => (
            <Link key={category.id} to={`/categoria/${category.id}`} className="hover:text-ink">
              {category.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted">© {new Date().getFullYear()} atta.</p>
      </div>
    </footer>
  );
}
