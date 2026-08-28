import type { ReactNode } from 'react';

export function EmptyState({ titre, children }: { titre: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <strong>{titre}</strong>
      {children}
    </div>
  );
}
