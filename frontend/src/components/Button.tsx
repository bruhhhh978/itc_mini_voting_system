import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

export function Button({ className, variant = 'primary', ...rest }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';
  const styles =
    variant === 'primary'
      ? 'bg-indigo-500 text-white hover:bg-indigo-400'
      : variant === 'danger'
        ? 'bg-rose-500 text-white hover:bg-rose-400'
        : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10';
  return <button className={cn(base, styles, className)} {...rest} />;
}

