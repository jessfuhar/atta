/** Item de imagem no rascunho do admin: `file` presente = ainda não publicado (preview local). */
export interface DraftImageItem {
  src: string;
  alt: string;
  file?: File;
}

export function pickedImage(src: string): DraftImageItem {
  return { src, alt: '' };
}

export function uploadedImage(file: File, alt = ''): DraftImageItem {
  return { src: URL.createObjectURL(file), alt, file };
}
