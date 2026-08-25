import { useEffect, useRef, useState } from 'react';
import type { PublishStatus } from './github/publish';

export const PUBLISH_SUCCESS_MESSAGE = 'Alterações salvas. O site está sendo atualizado.';
const MESSAGE_TIMEOUT_MS = 5000;

/** Edição com rascunho: nada é aplicado até "Salvar e publicar" resolver; "Cancelar" descarta o rascunho. */
export function useDraft<T>(committed: T, onCommit: (value: T, report: (status: PublishStatus) => void) => Promise<void>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<T>(committed);
  const [status, setStatus] = useState<PublishStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(messageTimer.current), []);

  function edit() {
    setDraft(committed);
    setEditing(true);
    setStatus('idle');
    setError(null);
    setMessage(null);
  }

  function cancel() {
    setDraft(committed);
    setEditing(false);
    setStatus('idle');
    setError(null);
  }

  async function save() {
    setError(null);
    setMessage(null);
    try {
      await onCommit(draft, setStatus);
      // Concluído assim que o commit + atualização da main forem confirmados — libera o formulário na hora,
      // sem esperar GitHub Actions/Pages.
      setEditing(false);
      setStatus('idle');
      setMessage(PUBLISH_SUCCESS_MESSAGE);
      clearTimeout(messageTimer.current);
      messageTimer.current = setTimeout(() => setMessage(null), MESSAGE_TIMEOUT_MS);
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(committed);
  const saving = status === 'saving';

  return { editing, draft, setDraft, edit, cancel, save, dirty, status, error, message, saving };
}
