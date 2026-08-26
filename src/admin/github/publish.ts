import { commitFiles, type CommitFile } from './api';
import { fileToBase64 } from './images';

export type PublishStatus = 'idle' | 'saving' | 'published' | 'error';

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

/**
 * Uma edição = um commit: serializa os arquivos de dados + envia as imagens novas juntos.
 * Imagens sempre viram arquivo em public/images/ — nunca base64 embutido no arquivo de dados
 * (isso já bloou o bundle e degradou uma foto no passado; ver commit que corrigiu home.ts).
 */
export async function publishChanges({ token, files, images, message, onStatus }: PublishArgs): Promise<void> {
  onStatus('saving');

  for (const f of files) {
    if (f.content.includes('data:image')) {
      throw new Error(
        `Imagem em base64 embutida em ${f.path} — imagens devem ser um arquivo publicado em public/images, nunca inline no dado.`,
      );
    }
  }

  const imageFiles: CommitFile[] = await Promise.all(
    images.map(async (img) => ({
      path: img.path,
      content: await fileToBase64(img.file),
      encoding: 'base64' as const,
    })),
  );

  const dataFiles: CommitFile[] = files.map((f) => ({ path: f.path, content: f.content, encoding: 'utf-8' as const }));

  await commitFiles(token, [...dataFiles, ...imageFiles], message);

  onStatus('published');
}
