import type { ReactNode } from 'react';
import { useDraft } from './useDraft';
import { EditActions } from './EditActions';
import type { PublishStatus } from './github/publish';

interface EditableCardProps<T> {
  title: string;
  value: T;
  onSave: (value: T, report: (status: PublishStatus) => void) => Promise<void>;
  renderSummary: (value: T) => ReactNode;
  renderForm: (draft: T, setDraft: (updater: T | ((prev: T) => T)) => void) => ReactNode;
}

/** Editar → Salvar e publicar / Cancelar: nada muda no site até o commit ser publicado com sucesso. */
export function EditableCard<T>({ title, value, onSave, renderSummary, renderForm }: EditableCardProps<T>) {
  const { editing, draft, setDraft, edit, cancel, save, dirty, status, error, saving } = useDraft(value, onSave);

  return (
    <div className="border border-line p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-display text-lg">{title}</p>
        <EditActions editing={editing} dirty={dirty} status={status} saving={saving} onEdit={edit} onSave={save} onCancel={cancel} />
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {editing ? renderForm(draft, setDraft) : renderSummary(value)}
    </div>
  );
}
