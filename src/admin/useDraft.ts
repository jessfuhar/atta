import { useState } from 'react';
import type { PublishStatus } from './github/publish';

/** Edição com rascunho: nada é aplicado até "Salvar e publicar" resolver; "Cancelar" descarta o rascunho. */
export function useDraft<T>(committed: T, onCommit: (value: T, report: (status: PublishStatus) => void) => Promise<void>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<T>(committed);
  const [status, setStatus] = useState<PublishStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  function edit() {
    setDraft(committed);
    setEditing(true);
    setStatus('idle');
    setError(null);
  }

  function cancel() {
    setDraft(committed);
    setEditing(false);
    setStatus('idle');
    setError(null);
  }

  async function save() {
    setError(null);
    try {
      await onCommit(draft, setStatus);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setEditing(false);
      setStatus('idle');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(committed);
  const saving = status !== 'idle' && status !== 'error';

  return { editing, draft, setDraft, edit, cancel, save, dirty, status, error, saving };
}
