import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
  children: ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-[0.15em] text-muted">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="border border-line bg-canvas px-2 py-1.5 text-sm" />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="border border-line bg-canvas px-2 py-1.5 text-sm" />;
}
