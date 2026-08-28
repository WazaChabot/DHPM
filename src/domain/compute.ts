/** Calculs dérivés d'un projet : avancement, étape courante, retards, valeur. */
import { JALONS, STATUTS_OUVERTS } from './process';
import { clamp, daysBetween, parseISO, todayISO } from './format';
import type { EtapeId, JalonDef, JalonEtat, Projet } from './types';

export interface EcheanceJalon {
  j: JalonDef;
  js: JalonEtat;
  /** Nombre de jours de retard (retards) ou avant échéance (aVenir). */
  jours: number;
}

/** Avancement d'un jalon, de 0 à 1. Un jalon complété vaut toujours 1. */
export function jalonPct(js: JalonEtat): number {
  if (js.s === 'complete') return 1;
  return clamp(js.pct || 0, 0, 1);
}

/** Avancement du projet : moyenne pondérée des jalons, hors jalons N/A. */
export function avancement(p: Projet): number {
  if (typeof p.avancementManuel === 'number') return clamp(p.avancementManuel, 0, 1);
  let tot = 0;
  let acc = 0;
  for (const j of JALONS) {
    const js = p.jalons[j.k];
    if (!js || js.s === 'na') continue;
    tot += j.p;
    acc += j.p * jalonPct(js);
  }
  return tot ? acc / tot : 0;
}

/** Étape du premier jalon ni complété ni N/A ; « Fermeture » si tout est fait. */
export function etapeCourante(p: Projet): EtapeId {
  for (const j of JALONS) {
    const js = p.jalons[j.k];
    if (js && js.s !== 'complete' && js.s !== 'na') return j.e;
  }
  return 'ferm';
}

/** Jalons dont l'échéance est dépassée et qui ne sont ni complétés ni N/A. */
export function retards(p: Projet, ref: Date = parseISO(todayISO())!): EcheanceJalon[] {
  const out: EcheanceJalon[] = [];
  for (const j of JALONS) {
    const js = p.jalons[j.k];
    if (!js || js.s === 'complete' || js.s === 'na' || !js.d2) continue;
    const d = parseISO(js.d2);
    if (d && d < ref) out.push({ j, js, jours: daysBetween(d, ref) });
  }
  return out;
}

/** Jalons dont l'échéance tombe dans les `n` prochains jours. */
export function aVenir(p: Projet, n: number, ref: Date = parseISO(todayISO())!): EcheanceJalon[] {
  const out: EcheanceJalon[] = [];
  for (const j of JALONS) {
    const js = p.jalons[j.k];
    if (!js || js.s === 'complete' || js.s === 'na' || !js.d2) continue;
    const d = parseISO(js.d2);
    if (!d || d < ref) continue;
    const dd = daysBetween(ref, d);
    if (dd <= n) out.push({ j, js, jours: dd });
  }
  return out;
}

/** Somme des extras retenus (approuvés ou facturés). */
export function extrasRetenus(p: Projet): number {
  return (p.extras || []).reduce(
    (a, e) => a + (e.statut === 'Approuvé' || e.statut === 'Facturé' ? Number(e.montant) || 0 : 0),
    0,
  );
}

/** Somme des extras encore en attente d'approbation. */
export function extrasEnAttente(p: Projet): number {
  return (p.extras || []).reduce(
    (a, e) => a + (e.statut === 'Soumis' ? Number(e.montant) || 0 : 0),
    0,
  );
}

/** Contrat de base plus les extras retenus. */
export function valeurTotale(p: Projet): number {
  return (Number(p.montant) || 0) + extrasRetenus(p);
}

export function estOuvert(p: Projet): boolean {
  return STATUTS_OUVERTS.includes(p.statut);
}

export function titreProjet(p: Projet): string {
  return (p.numero ? `${p.numero} — ` : '') + (p.nom || 'Sans nom');
}

/** Un jalon est en retard si son échéance est passée et qu'il reste à faire. */
export function jalonEnRetard(js: JalonEtat, ref: Date = parseISO(todayISO())!): boolean {
  if (!js.d2 || js.s === 'complete' || js.s === 'na') return false;
  const d = parseISO(js.d2);
  return !!d && d < ref;
}

const ORDRE_SANTE: Record<string, number> = { Critique: 0, 'À risque': 1, Bon: 2 };

/** Tri de suivi : santé la plus fragile d'abord, puis avancement le plus faible. */
export function compareSuivi(a: Projet, b: Projet): number {
  const oa = ORDRE_SANTE[a.sante] ?? 3;
  const ob = ORDRE_SANTE[b.sante] ?? 3;
  return oa - ob || avancement(a) - avancement(b);
}

export function rangSante(s: string): number {
  return ORDRE_SANTE[s] ?? 3;
}
