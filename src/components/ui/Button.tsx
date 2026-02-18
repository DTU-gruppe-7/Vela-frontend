import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}: ButtonProps) {
    const base = "inline-flex items-center justify-center rounded-full font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

    const variants = {
        primary: "bg-primary text-white hover:opacity-90 shadow-md",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        outline: "border border-slate-300 bg-white hover:bg-slate-50",
        ghost: "hover:bg-slate-100 text-slate-700",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-6 text-sm",
        lg: "h-12 px-8 text-base",
    };

    return (
        <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
}
