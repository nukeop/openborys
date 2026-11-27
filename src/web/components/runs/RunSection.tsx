import type { ReactNode } from 'react';

export function RunSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-semibold text-zinc-100">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  );
}
