import { clamp, fmtPct } from '../domain/format';

/** Barre d'avancement compacte avec sa valeur en pourcentage. */
export function Meter({ value, hauteur }: { value: number; hauteur?: number }) {
  const pct = clamp(value, 0, 1) * 100;
  return (
    <div className="meter">
      <div className="meter-track" style={hauteur ? { height: hauteur } : undefined}>
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="meter-val">{fmtPct(value)}</span>
    </div>
  );
}
