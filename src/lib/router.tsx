import {
  createContext,
  useContext,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';

function getPath() {
  const hash = window.location.hash;
  return hash.startsWith('#/') ? hash.slice(1) : '/';
}

const RouteContext = createContext('/');

/** Rotas via hash (#/categoria/x) — funciona em GitHub Pages sem configuração de servidor. */
export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onHashChange = () => setPath((prev) => {
      const next = getPath();
      return prev === next ? prev : next;
    });
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return <RouteContext.Provider value={path}>{children}</RouteContext.Provider>;
}

export function useRoute() {
  return useContext(RouteContext);
}

export function Link({ to, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  return <a href={`#${to}`} {...props} />;
}
