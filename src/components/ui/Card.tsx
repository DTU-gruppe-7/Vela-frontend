import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export default function Card({ className = '', children, ...props }: CardProps) {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`} {...props}>
            {children}
        </div>
    );
}
