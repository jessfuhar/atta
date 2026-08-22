import type { ReactNode } from 'react';
import { useDraft } from './useDraft';
import { EditActions } from './EditActions';

interface EditableCardProps<T> {
  title: string;
  value: T;
  onSave: (value: T) => void;
  renderSummary: (value: T) => ReactNode;
  renderForm: (draft: T, setDraft: (updater: T | ((prev: T) => T)) => void) => ReactNode;
}

/** Editar/Salvar/Cancelar padrão do painel: nada muda no site até "Salvar alterações". */
export function EditableCard<T>({ title, value, onSave, renderSummary, renderForm }: EditableCardProps<T>) {
  const { editing, draft, setDraft, edit, cancel, save, dirty } = useDraft(value, onSave);

  return (
    <div className="border border-line p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-display text-lg">{title}</p>
        <EditActions editing={editing} dirty={dirty} onEdit={edit} onSave={save} onCancel={cancel} />
      </div>
      {editing ? renderForm(draft, setDraft) : renderSummary(value)}
    </div>
  );
}
