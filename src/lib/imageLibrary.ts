import { imageManifest } from '../data/imageManifest';

const UPLOADS_KEY = 'atta:admin:uploads:v1';

export interface LibraryImage {
  src: string;
  addedAt: number;
  isUpload: boolean;
}

function loadUploads(): LibraryImage[] {
  try {
    const raw = localStorage.getItem(UPLOADS_KEY);
    return raw ? (JSON.parse(raw) as LibraryImage[]) : [];
  } catch {
    return [];
  }
}

function saveUploads(uploads: LibraryImage[]) {
  try {
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));
  } catch {
    // localStorage indisponível/cheio — upload some ao recarregar, mas a UI não quebra.
  }
}

/** Fotos reais (manifesto gerado no build) + uploads locais desta sessão, mais recentes primeiro. */
export function getLibraryImages(): LibraryImage[] {
  const manifestImages: LibraryImage[] = imageManifest.map((m) => ({ ...m, isUpload: false }));
  const uploads = loadUploads();
  return [...uploads, ...manifestImages].sort((a, b) => b.addedAt - a.addedAt);
}

export function addUpload(dataUrl: string): LibraryImage {
  const entry: LibraryImage = { src: dataUrl, addedAt: Date.now(), isUpload: true };
  saveUploads([...loadUploads(), entry]);
  return entry;
}

export function filesToDataUrls(files: FileList | File[]): Promise<string[]> {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    ),
  );
}
