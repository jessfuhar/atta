import { useState } from 'react';
import { useScrolled } from '../hooks/useScrolled';
import { withBase, LOGO_WHITE, LOGO_BLACK } from '../lib/assets';
import { Link } from '../lib/router';
import { useSiteData } from '../data/siteData';

export function Header() {
  const { categories } = useSiteData();
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? 'bg-canvas/95 backdrop-blur-sm text-ink' : 'bg-transparent text-canvas'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
        <Link to="/">
          <img
            src={withBase(solid ? LOGO_BLACK : LOGO_WHITE)}
            alt="atta."
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav className="hidden gap-10 text-sm font-medium uppercase tracking-[0.12em] sm:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categoria/${category.id}`}
              className="transition-opacity hover:opacity-60"
            >
              {category.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="text-sm font-medium uppercase tracking-[0.12em] sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? 'Fechar' : 'Menu'}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          className="flex flex-col gap-8 bg-canvas px-8 pb-16 pt-4 text-ink sm:hidden"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categoria/${category.id}`}
              onClick={() => setMenuOpen(false)}
              className="font-display text-4xl"
            >
              {category.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
