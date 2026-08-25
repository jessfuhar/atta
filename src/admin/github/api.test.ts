import { beforeEach, describe, expect, it, vi } from 'vitest';
import { commitFiles, type CommitFile } from './api';

const OWNER = 'jessfuhar';
const REPO = 'atta';
const BRANCH = 'main';
const ROOT = `https://api.github.com/repos/${OWNER}/${REPO}`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function err(status: number, message = 'boom') {
  return new Response(message, { status });
}

/** Instala um mock de `fetch` guiado por um mapa `method path -> resposta(s)`. Cada chamada consome a próxima da fila. */
function mockFetch(handlers: Record<string, Array<() => Response>>) {
  const calls: string[] = [];
  const bodies: Record<string, unknown> = {};
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      const path = url.replace(ROOT, '');
      const key = `${method} ${path}`;
      calls.push(key);
      if (init?.body) bodies[key] = JSON.parse(String(init.body));
      const queue = handlers[key];
      if (!queue || queue.length === 0) throw new Error(`sem mock para: ${key}`);
      const respond = queue.shift()!;
      return respond();
    }),
  );
  return { calls, bodies };
}

const files: CommitFile[] = [{ path: 'src/data/products.ts', content: 'export const products = [];', encoding: 'utf-8' }];

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('commitFiles', () => {
  it('cria blob/tree/commit e avança a ref sem force quando tudo está em dia', async () => {
    const { calls, bodies } = mockFetch({
      [`GET /git/ref/heads/${BRANCH}`]: [() => json({ object: { sha: 'parent-1' } })],
      'GET /git/commits/parent-1': [() => json({ tree: { sha: 'tree-1' } })],
      'GET /git/trees/tree-1?recursive=1': [() => json({ tree: [] })],
      'POST /git/blobs': [() => json({ sha: 'blob-1' })],
      'POST /git/trees': [() => json({ sha: 'new-tree' })],
      'POST /git/commits': [() => json({ sha: 'new-commit', html_url: 'https://github.com/x/y/commit/new-commit' })],
      [`PATCH /git/refs/heads/${BRANCH}`]: [() => json({ object: { sha: 'new-commit' } })],
    });

    const result = await commitFiles('token', files, 'admin: teste');

    expect(result).toEqual({ commitSha: 'new-commit', commitUrl: 'https://github.com/x/y/commit/new-commit', unchanged: false });

    const refPatchCall = calls.filter((c) => c.startsWith(`PATCH /git/refs/heads/${BRANCH}`));
    expect(refPatchCall).toHaveLength(1);
    expect(bodies[`PATCH /git/refs/heads/${BRANCH}`]).toMatchObject({ sha: 'new-commit', force: false });
  });

  it('não cria blob nem commit quando o conteúdo é idêntico ao já publicado (sem chamadas duplicadas)', async () => {
    // SHA-1 de blob git real para o conteúdo de `files` (conferido com `git hash-object`).
    const existingSha = 'd10a28553a53dc02acd35f32a2077b2b7108dde8';
    const { calls } = mockFetch({
      [`GET /git/ref/heads/${BRANCH}`]: [() => json({ object: { sha: 'parent-1' } })],
      'GET /git/commits/parent-1': [() => json({ tree: { sha: 'tree-1' } })],
      'GET /git/trees/tree-1?recursive=1': [
        () => json({ tree: [{ path: 'src/data/products.ts', type: 'blob', sha: existingSha }] }),
      ],
    });

    const result = await commitFiles('token', files, 'admin: teste');

    expect(result).toEqual({ commitSha: 'parent-1', commitUrl: '', unchanged: true });
    expect(calls).not.toContain('POST /git/blobs');
    expect(calls).not.toContain('POST /git/trees');
    expect(calls).not.toContain('POST /git/commits');
    expect(calls.filter((c) => c.startsWith('PATCH'))).toHaveLength(0);
  });

  it('em conflito de fast-forward (422), relê a branch e tenta novamente uma vez com sucesso', async () => {
    let refAttempt = 0;
    const { calls, bodies } = mockFetch({
      [`GET /git/ref/heads/${BRANCH}`]: [
        () => json({ object: { sha: 'parent-1' } }),
        () => json({ object: { sha: 'parent-2' } }),
      ],
      'GET /git/commits/parent-1': [() => json({ tree: { sha: 'tree-1' } })],
      'GET /git/commits/parent-2': [() => json({ tree: { sha: 'tree-2' } })],
      'GET /git/trees/tree-1?recursive=1': [() => json({ tree: [] })],
      'GET /git/trees/tree-2?recursive=1': [() => json({ tree: [] })],
      'POST /git/blobs': [() => json({ sha: 'blob-1' }), () => json({ sha: 'blob-1' })],
      'POST /git/trees': [() => json({ sha: 'tree-a' }), () => json({ sha: 'tree-b' })],
      'POST /git/commits': [
        () => json({ sha: 'commit-1', html_url: 'url-1' }),
        () => json({ sha: 'commit-2', html_url: 'url-2' }),
      ],
      [`PATCH /git/refs/heads/${BRANCH}`]: [
        () => {
          refAttempt++;
          return err(422, 'Update is not a fast forward');
        },
        () => json({}),
      ],
    });

    const result = await commitFiles('token', files, 'admin: teste');

    expect(refAttempt).toBe(1);
    expect(result.unchanged).toBe(false);
    expect(result.commitSha).toBe('commit-2');
    // relê a branch (ref + commit + tree) nas duas tentativas — nunca reaproveita estado desatualizado.
    expect(calls.filter((c) => c === `GET /git/ref/heads/${BRANCH}`)).toHaveLength(2);
    // nunca usa force, mesmo na tentativa que segue um conflito
    expect(bodies[`PATCH /git/refs/heads/${BRANCH}`]).toMatchObject({ sha: 'commit-2', force: false });
  });

  it('se o conflito persistir na segunda tentativa, falha com erro claro e não sobrescreve nada', async () => {
    mockFetch({
      [`GET /git/ref/heads/${BRANCH}`]: [
        () => json({ object: { sha: 'parent-1' } }),
        () => json({ object: { sha: 'parent-2' } }),
      ],
      'GET /git/commits/parent-1': [() => json({ tree: { sha: 'tree-1' } })],
      'GET /git/commits/parent-2': [() => json({ tree: { sha: 'tree-2' } })],
      'GET /git/trees/tree-1?recursive=1': [() => json({ tree: [] })],
      'GET /git/trees/tree-2?recursive=1': [() => json({ tree: [] })],
      'POST /git/blobs': [() => json({ sha: 'blob-1' }), () => json({ sha: 'blob-1' })],
      'POST /git/trees': [() => json({ sha: 'new-tree' }), () => json({ sha: 'new-tree' })],
      'POST /git/commits': [() => json({ sha: 'commit-a', html_url: 'a' }), () => json({ sha: 'commit-b', html_url: 'b' })],
      [`PATCH /git/refs/heads/${BRANCH}`]: [() => err(422, 'not a fast forward'), () => err(409, 'conflict')],
    });

    await expect(commitFiles('token', files, 'admin: teste')).rejects.toThrow(/main foi atualizada/i);
  });
});
