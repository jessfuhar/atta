import type { ReactNode } from 'react';
import { GithubAuthProvider, useGithubAuth } from './github/auth';
import { isGithubConfigured } from './github/config';

function Gate({ children }: { children: ReactNode }) {
  const { user, loading, error, isAllowed, login, logout } = useGithubAuth();

  if (!isGithubConfigured) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-display text-2xl">Admin não configurado</p>
        <p className="mt-3 text-sm text-muted">
          Faltam as variáveis de ambiente do login com GitHub (VITE_GITHUB_OAUTH_WORKER_URL e
          VITE_GITHUB_ADMIN_USERNAME) neste ambiente.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-display text-2xl">atta. admin</p>
        <p className="mt-3 text-sm text-muted">Entre com sua conta do GitHub para editar o site.</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={login}
          disabled={loading}
          className="mt-6 border border-ink px-5 py-2.5 text-xs uppercase tracking-[0.1em] disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Entrar com GitHub'}
        </button>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-display text-2xl">Sem permissão</p>
        <p className="mt-3 text-sm text-muted">A conta {user.login} não tem acesso a este painel.</p>
        <button
          type="button"
          onClick={logout}
          className="mt-6 border border-line px-5 py-2.5 text-xs uppercase tracking-[0.1em] text-muted"
        >
          Sair
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

/** Login com GitHub protege a UI; a segurança real é o GitHub recusar commits de quem não tem push no repo. */
export function AdminGate({ children }: { children: ReactNode }) {
  return (
    <GithubAuthProvider>
      <Gate>{children}</Gate>
    </GithubAuthProvider>
  );
}
