import { beforeEach, describe, expect, it, vi } from 'vitest';
import { publishChanges, type PublishStatus } from './publish';

vi.mock('./api', () => ({
  commitFiles: vi.fn(),
}));

const { commitFiles } = await import('./api');
const commitFilesMock = vi.mocked(commitFiles);

beforeEach(() => {
  commitFilesMock.mockReset();
});

describe('publishChanges', () => {
  it('reporta "saving" e depois "published" assim que o commit é confirmado — sem esperar deploy', async () => {
    commitFilesMock.mockResolvedValue({ commitSha: 'abc', commitUrl: 'url', unchanged: false });
    const statuses: PublishStatus[] = [];

    await publishChanges({
      token: 't',
      files: [{ path: 'src/data/products.ts', content: 'x' }],
      images: [],
      message: 'admin: teste',
      onStatus: (s) => statuses.push(s),
    });

    expect(statuses).toEqual(['saving', 'published']);
    expect(commitFilesMock).toHaveBeenCalledTimes(1);
  });

  it('recusa publicar um arquivo de dados com imagem embutida em base64 (sem chamar commitFiles)', async () => {
    const statuses: PublishStatus[] = [];

    await expect(
      publishChanges({
        token: 't',
        files: [{ path: 'src/data/home.ts', content: 'export const x = "data:image/jpeg;base64,abcd";' }],
        images: [],
        message: 'admin: teste',
        onStatus: (s) => statuses.push(s),
      }),
    ).rejects.toThrow(/base64 embutida/i);

    expect(commitFilesMock).not.toHaveBeenCalled();
  });

  it('propaga a falha quando o commit no GitHub falha e nunca reporta "published" (não afirma que salvou)', async () => {
    commitFilesMock.mockRejectedValue(new Error('GitHub API 500: falha'));
    const statuses: PublishStatus[] = [];

    await expect(
      publishChanges({
        token: 't',
        files: [{ path: 'src/data/products.ts', content: 'x' }],
        images: [],
        message: 'admin: teste',
        onStatus: (s) => statuses.push(s),
      }),
    ).rejects.toThrow('GitHub API 500');

    expect(statuses).toEqual(['saving']);
    expect(statuses).not.toContain('published');
  });
});
