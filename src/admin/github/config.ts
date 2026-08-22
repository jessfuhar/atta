export const GITHUB_OWNER = 'jessfuhar';
export const GITHUB_REPO = 'atta';
export const GITHUB_BRANCH = 'main';

// URL pública do worker de OAuth (ver cloudflare-worker/) — o client_id/secret do GitHub App
// ficam só no worker, nunca aqui. Só o login do admin autorizado fica configurado no front.
export const OAUTH_WORKER_URL: string = (import.meta.env.VITE_GITHUB_OAUTH_WORKER_URL ?? '').replace(/\/+$/, '');
export const ADMIN_GITHUB_USERNAME: string = import.meta.env.VITE_GITHUB_ADMIN_USERNAME ?? '';

export const isGithubConfigured = Boolean(OAUTH_WORKER_URL && ADMIN_GITHUB_USERNAME);
