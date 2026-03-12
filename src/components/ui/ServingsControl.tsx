interface ServingsControlProps {
    value: number;
    onChange: (newValue: number) => void;
    min?: number;
}

export function ServingsControl({ value, onChange, min = 1 }: ServingsControlProps) {
    return (
        <div className="flex items-center gap-1 bg-slate-100 rounded-full px-1.5 py-0.5 border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => onChange(Math.max(min, value - 1))}
                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white rounded-full transition-colors text-base leading-none"
                aria-label="Færre personer"
            >
                -
            </button>
            <div className="flex items-center gap-0.5 px-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="text-xs font-semibold text-slate-700 min-w-[12px] text-center select-none">{value}</span>
            </div>
            <button
                onClick={() => onChange(value + 1)}
                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white rounded-full transition-colors text-base leading-none"
                aria-label="Flere personer"
            >
                +
            </button>
        </div>
    );
}
