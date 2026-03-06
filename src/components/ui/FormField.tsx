import { type InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function FormField({ label, error, id, ...props }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-slate-700">
                {label}
            </label>
            <input
                id={id}
                className={`h-11 px-4 rounded-lg border bg-white text-sm transition-colors
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    ${error ? 'border-red-400' : 'border-slate-300'}
                `}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}