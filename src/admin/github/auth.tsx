import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { OAUTH_WORKER_URL, ADMIN_GITHUB_USERNAME } from './config';

const TOKEN_KEY = 'atta:admin:gh_token';

interface GithubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
}

interface AuthContextValue {
  token: string | null;
  user: GithubUser | null;
  loading: boolean;
  error: string | null;
  isAllowed: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Login via GitHub (pop-up + postMessage) — o token do usuário fica só em sessionStorage, nunca no repositório. */
export function GithubAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<GithubUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    setLoading(true);
    fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Sessão expirada — entre novamente.');
        return res.json();
      })
      .then((data: { login: string; name: string | null; avatar_url: string }) =>
        setUser({ login: data.login, name: data.name, avatarUrl: data.avatar_url }),
      )
      .catch((e: Error) => {
        setError(e.message);
        setToken(null);
        sessionStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(() => {
    if (!OAUTH_WORKER_URL) {
      setError('Login com GitHub ainda não configurado neste ambiente.');
      return;
    }
    setError(null);
    const popup = window.open(`${OAUTH_WORKER_URL}/auth`, 'atta-admin-auth', 'width=520,height=680');
    if (!popup) {
      setError('Pop-up bloqueado pelo navegador. Permita pop-ups para entrar.');
      return;
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== new URL(OAUTH_WORKER_URL).origin) return;
      const data = event.data as { type?: string; token?: string; error?: string };
      if (data?.type !== 'atta-admin-auth') return;
      window.removeEventListener('message', onMessage);
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.token) {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
      }
    }
    window.addEventListener('message', onMessage);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isAllowed = Boolean(
    user && ADMIN_GITHUB_USERNAME && user.login.toLowerCase() === ADMIN_GITHUB_USERNAME.toLowerCase(),
  );

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, loading, error, isAllowed, login, logout }),
    [token, user, loading, error, isAllowed, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useGithubAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useGithubAuth deve ser usado dentro de GithubAuthProvider');
  return ctx;
}
