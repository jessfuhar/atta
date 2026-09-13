import { STANDARD_SIZES } from '../lib/sizes';

interface MultiSizeSelectorProps {
  availableSizes: string[];
  selectedSizes: string[];
  /** Ausente = somente exibição (peça do kit já configurada), sem permitir marcar/desmarcar. */
  onToggle?: (size: string) => void;
}

/** Checkboxes P/M/G/GG — permite marcar vários tamanhos ao mesmo tempo (ex.: kit disponível em P e M). */
export function MultiSizeSelector({ availableSizes, selectedSizes, onToggle }: MultiSizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STANDARD_SIZES.map((size) => {
        const isAvailable = availableSizes.includes(size);
        const isChecked = selectedSizes.includes(size);
        return (
          <label
            key={size}
            className={`flex items-center gap-1.5 border border-line px-2 py-1 text-xs uppercase ${
              isAvailable ? 'text-ink' : 'cursor-not-allowed text-muted/60'
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              disabled={!isAvailable || !onToggle}
              onChange={() => onToggle?.(size)}
            />
            {size}
          </label>
        );
      })}
    </div>
  );
}
