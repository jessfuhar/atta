import type { PublishStatus } from './github/publish';

const LABELS: Record<PublishStatus, string> = {
  idle: '',
  saving: 'Salvando',
  published: 'Alterações salvas. O site está sendo atualizado.',
  error: 'Erro',
};

export function PublishStatusPill({ status }: { status: PublishStatus }) {
  if (status === 'idle') return null;
  const tone = status === 'error' ? 'text-red-600' : status === 'published' ? 'text-emerald-600' : 'text-muted';
  return <span className={`text-[11px] uppercase tracking-[0.1em] ${tone}`}>● {LABELS[status]}</span>;
}
