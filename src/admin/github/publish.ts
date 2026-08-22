import { commitFiles, waitForWorkflow, type CommitFile } from './api';
import { fileToBase64 } from './images';

export type PublishStatus = 'idle' | 'saving' | 'committed' | 'publishing' | 'published' | 'error';

interface PendingImage {
  path: string;
  file: File;
}

interface PublishArgs {
  token: string;
  files: { path: string; content: string }[];
  images: PendingImage[];
  message: string;
  onStatus: (status: PublishStatus) => void;
}

/** Uma edição = um commit: serializa os arquivos de dados + envia as imagens novas juntos. */
export async function publishChanges({ token, files, images, message, onStatus }: PublishArgs): Promise<void> {
  onStatus('saving');

  const imageFiles: CommitFile[] = await Promise.all(
    images.map(async (img) => ({
      path: img.path,
      content: await fileToBase64(img.file),
      encoding: 'base64' as const,
    })),
  );

  const dataFiles: CommitFile[] = files.map((f) => ({ path: f.path, content: f.content, encoding: 'utf-8' as const }));

  const commit = await commitFiles(token, [...dataFiles, ...imageFiles], message);
  onStatus('committed');
  onStatus('publishing');

  const outcome = await waitForWorkflow(token, commit.commitSha).catch(() => 'timeout' as const);
  if (outcome === 'failure') {
    onStatus('error');
    throw new Error('O GitHub Actions falhou ao publicar. Veja os logs em Actions no repositório.');
  }

  onStatus('published');
}
