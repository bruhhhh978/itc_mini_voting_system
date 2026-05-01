import { cn } from '../lib/cn';
import type { ReactNode } from 'react';

export function Card(props: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-white/10 bg-white/5 shadow-soft', props.className)}>
      {props.title ? (
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-white">{props.title}</h2>
        </div>
      ) : null}
      <div className="px-5 py-4">{props.children}</div>
    </section>
  );
}

