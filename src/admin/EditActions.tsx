interface EditActionsProps {
  editing: boolean;
  dirty: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditActions({ editing, dirty, onEdit, onSave, onCancel }: EditActionsProps) {
  if (!editing) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="border border-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]"
      >
        Editar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {dirty && <span className="text-[11px] uppercase tracking-[0.1em] text-amber-600">● não salvo</span>}
      <button
        type="button"
        onClick={onCancel}
        className="border border-line px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-muted"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty}
        className="border border-ink bg-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-canvas disabled:opacity-40"
      >
        Salvar alterações
      </button>
    </div>
  );
}
