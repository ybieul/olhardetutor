import type { ReactNode } from 'react';

type HeaderProps = {
  title: string;
  action?: ReactNode;
};

/** Per-screen title bar with an optional contextual action (e.g. a Button). */
export function Header({ title, action }: HeaderProps) {
  return (
    <header className="mb-16 flex items-center justify-between gap-16">
      <h1 className="text-2xl font-semibold text-foreground-light">{title}</h1>
      {action ? <div className="flex items-center gap-8">{action}</div> : null}
    </header>
  );
}
