import type { ReactNode } from 'react';
import type { Sante } from '../domain/types';

type Ton = 'neutre' | 'ok' | 'warn' | 'crit' | 'accent' | 'mute';

const CLASSES: Record<Ton, string> = {
  neutre: '',
  ok: 'pill-ok',
  warn: 'pill-warn',
  crit: 'pill-crit',
  accent: 'pill-accent',
  mute: 'pill-mute',
};

export function Pill({ ton = 'neutre', dot, children }: { ton?: Ton; dot?: boolean; children: ReactNode }) {
  return (
    <span className={`pill ${CLASSES[ton]}`.trim()}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

export function tonSante(s: Sante): Ton {
  return s === 'Critique' ? 'crit' : s === 'À risque' ? 'warn' : 'ok';
}

export function classeSeverite(s: Sante): string {
  return s === 'Critique' ? 'sev-crit' : s === 'À risque' ? 'sev-warn' : 'sev-ok';
}

export function PillSante({ sante }: { sante: Sante }) {
  return (
    <Pill ton={tonSante(sante)} dot>
      {sante}
    </Pill>
  );
}
