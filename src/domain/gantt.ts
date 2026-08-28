/** Mise en page du diagramme de Gantt : positions en pourcentage de la plage totale. */
import { JALONS } from './process';
import { MOIS, clamp, daysBetween, parseISO, todayISO } from './format';
import { jalonPct } from './compute';
import type { JalonDef, Projet } from './types';

export interface GanttBarre {
  leftPct: number;
  widthPct: number;
  /** Avancement du jalon, de 0 à 1. */
  pct: number;
  late: boolean;
  /** Classe de couleur dérivée du statut. */
  variante: '' | 's-todo' | 's-attente';
}

export interface GanttLigne {
  j: JalonDef;
  barre: GanttBarre | null;
  d1: string;
  d2: string;
}

export interface GanttLayout {
  ticks: { label: string; leftPct: number }[];
  /** Position du repère « aujourd'hui », ou `null` s'il sort de la plage. */
  todayPct: number | null;
  lignes: GanttLigne[];
}

/**
 * Construit la plage de dates du projet, arrondie au mois, et positionne
 * chaque jalon dedans. Renvoie `null` s'il n'y a pas de quoi tracer.
 */
export function calculerGantt(p: Projet, ref: Date = parseISO(todayISO())!): GanttLayout | null {
  const dates: Date[] = [];
  for (const j of JALONS) {
    const s = p.jalons[j.k];
    const d1 = parseISO(s.d1);
    const d2 = parseISO(s.d2);
    if (d1) dates.push(d1);
    if (d2) dates.push(d2);
  }
  const ouv = parseISO(p.dateOuverture);
  const ferm = parseISO(p.dateFermeture);
  if (ouv) dates.push(ouv);
  if (ferm) dates.push(ferm);
  if (dates.length < 2) return null;

  const brut = dates.map((d) => d.getTime());
  const debut = new Date(Math.min(...brut));
  const fin = new Date(Math.max(...brut));
  const min = new Date(debut.getFullYear(), debut.getMonth(), 1);
  const max = new Date(fin.getFullYear(), fin.getMonth() + 1, 0);
  const span = Math.max(1, daysBetween(min, max));
  const pos = (d: Date) => clamp(daysBetween(min, d) / span, 0, 1) * 100;

  const ticks: { label: string; leftPct: number }[] = [];
  for (let cur = new Date(min); cur <= max; cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)) {
    ticks.push({
      label: `${MOIS[cur.getMonth()]} ’${String(cur.getFullYear()).slice(2)}`,
      leftPct: pos(cur),
    });
  }

  const lignes: GanttLigne[] = [];
  for (const j of JALONS) {
    const s = p.jalons[j.k];
    if (s.s === 'na') continue;
    const d1 = parseISO(s.d1);
    const d2 = parseISO(s.d2);
    let barre: GanttBarre | null = null;
    if (d1 || d2) {
      let a = (d1 ?? d2)!;
      let b = (d2 ?? d1)!;
      if (b < a) [a, b] = [b, a];
      const left = pos(a);
      const width = Math.max(pos(b) - left, 1.2);
      barre = {
        leftPct: left,
        widthPct: width,
        pct: jalonPct(s),
        late: !!d2 && s.s !== 'complete' && d2 < ref,
        variante: s.s === 'attente' ? 's-attente' : s.s === 'todo' ? 's-todo' : '',
      };
    }
    lignes.push({ j, barre, d1: s.d1, d2: s.d2 });
  }

  return {
    ticks,
    todayPct: ref >= min && ref <= max ? pos(ref) : null,
    lignes,
  };
}
