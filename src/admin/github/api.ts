import { GITHUB_BRANCH, GITHUB_OWNER, GITHUB_REPO } from './config';

const API_ROOT = 'https://api.github.com';

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
    throw new Error(`GitHub API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

export interface CommitFile {
  path: string;
  content: string;
  encoding: 'utf-8' | 'base64';
}

interface CommitResult {
  commitSha: string;
  commitUrl: string;
}

/** Cria um único commit com todos os arquivos (dados + imagens) — evita commits fragmentados por edição. */
export async function commitFiles(token: string, files: CommitFile[], message: string): Promise<CommitResult> {
  const repoPath = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

  const ref = await ghFetch(`${repoPath}/git/ref/heads/${GITHUB_BRANCH}`, token);
  const latestCommitSha: string = ref.object.sha;

  const latestCommit = await ghFetch(`${repoPath}/git/commits/${latestCommitSha}`, token);
  const baseTreeSha: string = latestCommit.tree.sha;

  const treeEntries = await Promise.all(
    files.map(async (file) => {
      const blob = await ghFetch(`${repoPath}/git/blobs`, token, {
        method: 'POST',
        body: JSON.stringify({ content: file.content, encoding: file.encoding }),
      });
      return { path: file.path, mode: '100644', type: 'blob', sha: blob.sha };
    }),
  );

  const tree = await ghFetch(`${repoPath}/git/trees`, token, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });

  const commit = await ghFetch(`${repoPath}/git/commits`, token, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [latestCommitSha] }),
  });

  await ghFetch(`${repoPath}/git/refs/heads/${GITHUB_BRANCH}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });

  return { commitSha: commit.sha, commitUrl: commit.html_url };
}
