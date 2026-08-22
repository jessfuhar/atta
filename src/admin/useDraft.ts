import { useState } from 'react';

/** Edição com rascunho: nada é aplicado até "Salvar alterações"; "Cancelar" descarta o rascunho. */
export function useDraft<T>(committed: T, onCommit: (value: T) => void) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<T>(committed);

  function edit() {
    setDraft(committed);
    setEditing(true);
  }

  function cancel() {
    setDraft(committed);
    setEditing(false);
  }

  function save() {
    onCommit(draft);
    setEditing(false);
  }

  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(committed);

  return { editing, draft, setDraft, edit, cancel, save, dirty };
}
