import { STANDARD_SIZES } from '../lib/sizes';

interface SizeSelectorProps {
  availableSizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  /** Botões menores — usado onde o seletor aparece dentro de um card compacto (peça de kit). */
  compact?: boolean;
}

/** P/M/G/GG — indisponível fica desabilitado, mais claro e com risco diagonal, sem nunca sumir da lista. */
export function SizeSelector({ availableSizes, selectedSize, onSelect, compact }: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STANDARD_SIZES.map((size) => {
        const isAvailable = availableSizes.includes(size);
        const isSelected = selectedSize === size;
        return (
          <button
            key={size}
            type="button"
            disabled={!isAvailable}
            aria-pressed={isSelected}
            onClick={() => onSelect(size)}
            className={`relative flex items-center justify-center overflow-hidden border uppercase transition-colors ${
              compact ? 'h-7 min-w-7 px-1.5 text-[10px]' : 'h-9 min-w-9 px-2 text-xs'
            } ${
              !isAvailable
                ? 'cursor-not-allowed border-line text-muted/60'
                : isSelected
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-line text-ink hover:border-ink'
            }`}
          >
            {size}
            {!isAvailable && (
              <span className="pointer-events-none absolute inset-0" aria-hidden="true">
                <span className="absolute left-1/2 top-1/2 h-px w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-muted" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
