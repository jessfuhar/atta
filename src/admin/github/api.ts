import { GITHUB_BRANCH, GITHUB_OWNER, GITHUB_REPO } from './config';

const API_ROOT = 'https://api.github.com';

export class GitHubApiError extends Error {
  status: number;
  constructor(status: number, body: string) {
    super(`GitHub API ${status}: ${body.slice(0, 300)}`);
    this.status = status;
  }
}

async function ghFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new GitHubApiError(res.status, body);
  }
  return res.json();
}

export interface CommitFile {
  path: string;
  content: string;
  encoding: 'utf-8' | 'base64';
}

export interface CommitResult {
  commitSha: string;
  commitUrl: string;
  /** true quando nenhum arquivo mudou de fato — nenhum commit novo foi criado. */
  unchanged: boolean;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** SHA-1 no formato de blob git (`blob <tamanho>\0<conteúdo>`) — compara com o SHA já publicado sem baixar conteúdo remoto. */
async function gitBlobSha(file: CommitFile): Promise<string> {
  const bytes = file.encoding === 'base64' ? base64ToBytes(file.content) : new TextEncoder().encode(file.content);
  const header = new TextEncoder().encode(`blob ${bytes.length}\0`);
  const full = new Uint8Array(header.length + bytes.length);
  full.set(header);
  full.set(bytes, header.length);
  const digest = await crypto.subtle.digest('SHA-1', full);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function logStep(label: string, start: number) {
  if (import.meta.env.DEV) console.debug(`[admin/publish] ${label}: ${Math.round(performance.now() - start)}ms`);
}

function isFastForwardConflict(e: unknown): boolean {
  return e instanceof GitHubApiError && (e.status === 409 || e.status === 422);
}

/** Lê o SHA da branch, a tree base e o SHA de cada blob já publicado. Sempre refeito a cada tentativa de commit. */
async function readBranchState(repoPath: string, token: string) {
  const t0 = performance.now();
  const ref = await ghFetch(`${repoPath}/git/ref/heads/${GITHUB_BRANCH}`, token);
  const parentSha: string = ref.object.sha;
  logStep('ler ref da branch', t0);

  const t1 = performance.now();
  const parentCommit = await ghFetch(`${repoPath}/git/commits/${parentSha}`, token);
  const baseTreeSha: string = parentCommit.tree.sha;
  logStep('ler commit pai', t1);

  const t2 = performance.now();
  const tree = await ghFetch(`${repoPath}/git/trees/${baseTreeSha}?recursive=1`, token);
  const blobShaByPath = new Map<string, string>();
  for (const entry of tree.tree as Array<{ path: string; type: string; sha: string }>) {
    if (entry.type === 'blob') blobShaByPath.set(entry.path, entry.sha);
  }
  logStep('ler tree base', t2);

  return { parentSha, baseTreeSha, blobShaByPath };
}

/** Uma tentativa completa de commit: lê o estado atual da main, sobe só o que mudou e avança a ref (sem force). */
async function attemptCommit(
  repoPath: string,
  token: string,
  files: CommitFile[],
  message: string,
): Promise<CommitResult> {
  const { parentSha, baseTreeSha, blobShaByPath } = await readBranchState(repoPath, token);

  const changed: CommitFile[] = [];
  for (const file of files) {
    const localSha = await gitBlobSha(file);
    if (blobShaByPath.get(file.path) !== localSha) changed.push(file);
  }

  if (changed.length === 0) {
    return { commitSha: parentSha, commitUrl: '', unchanged: true };
  }

  const t3 = performance.now();
  const treeEntries = await Promise.all(
    changed.map(async (file) => {
      const blob = await ghFetch(`${repoPath}/git/blobs`, token, {
        method: 'POST',
        body: JSON.stringify({ content: file.content, encoding: file.encoding }),
      });
      return { path: file.path, mode: '100644', type: 'blob', sha: blob.sha as string };
    }),
  );
  logStep(`criar ${treeEntries.length} blob(s)`, t3);

  const t4 = performance.now();
  const tree = await ghFetch(`${repoPath}/git/trees`, token, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });
  logStep('criar tree', t4);

  const t5 = performance.now();
  const commit = await ghFetch(`${repoPath}/git/commits`, token, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] }),
  });
  logStep('criar commit', t5);

  const t6 = performance.now();
  await ghFetch(`${repoPath}/git/refs/heads/${GITHUB_BRANCH}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  logStep('atualizar ref da branch (fast-forward)', t6);

  return { commitSha: commit.sha, commitUrl: commit.html_url, unchanged: false };
}

/**
 * Cria um único commit com os arquivos alterados (dados + imagens) — evita commits fragmentados por edição.
 * Sempre lê a main mais recente antes de commitar; só cria blob para conteúdo novo/alterado. Se a atualização
 * da ref falhar por não ser fast-forward (outra publicação aconteceu enquanto essa rodava), refaz a leitura
 * da branch e tenta de novo uma única vez. Nunca usa force e nunca sobrescreve silenciosamente.
 */
export async function commitFiles(token: string, files: CommitFile[], message: string): Promise<CommitResult> {
  const repoPath = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
  const totalStart = performance.now();

  try {
    const result = await attemptCommit(repoPath, token, files, message);
    logStep('publicação completa', totalStart);
    return result;
  } catch (e) {
    if (!isFastForwardConflict(e)) throw e;

    try {
      const result = await attemptCommit(repoPath, token, files, message);
      logStep('publicação completa (após nova tentativa)', totalStart);
      return result;
    } catch (retryError) {
      if (isFastForwardConflict(retryError)) {
        throw new Error('A branch main foi atualizada por outra publicação ao mesmo tempo. Tente salvar de novo.');
      }
      throw retryError;
    }
  }
}
