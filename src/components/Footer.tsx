import { withBase, LOGO_BLACK } from '../lib/assets';
import { Link } from '../lib/router';
import { categories } from '../data/categories';

export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-12 sm:px-10">
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
