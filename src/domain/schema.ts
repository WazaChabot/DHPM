/** Création et normalisation des données : tout ce qui entre dans l'app y passe. */
import { EXTRA_STATUTS, JALONS, SANTES, STATUTS } from './process';
import { todayISO, uid } from './format';
import type {
  AppData,
  Extra,
  JalonEtat,
  JalonKey,
  JalonStatut,
  LogEntry,
  Projet,
  Tache,
} from './types';

export const SCHEMA_VERSION = 1;

const STATUTS_JALON: JalonStatut[] = ['todo', 'encours', 'attente', 'suivi', 'complete', 'na'];

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

function num(v: unknown): number | null {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function jalonVide(): JalonEtat {
  return { s: 'todo', pct: 0, d1: '', d2: '', notes: '' };
}

export function projetVide(over: Partial<Projet> = {}): Projet {
  const jalons = {} as Record<JalonKey, JalonEtat>;
  for (const j of JALONS) jalons[j.k] = jalonVide();
  return {
    id: uid(),
    numero: '',
    nom: '',
    client: '',
    charge: '',
    statut: 'Actif',
    sante: 'Bon',
    montant: null,
    nbOuv: null,
    dateOuverture: todayISO(),
    dateFermeture: '',
    avancementManuel: null,
    notes: '',
    jalons,
    taches: [],
    logs: [],
    extras: [],
    ...over,
  };
}

function normJalon(raw: unknown): JalonEtat {
  const x = (raw ?? {}) as Partial<JalonEtat>;
  const s = STATUTS_JALON.includes(x.s as JalonStatut) ? (x.s as JalonStatut) : 'todo';
  const pct = typeof x.pct === 'number' && Number.isFinite(x.pct) ? Math.max(0, Math.min(1, x.pct)) : 0;
  return { s, pct, d1: str(x.d1), d2: str(x.d2), notes: str(x.notes) };
}

function normTache(raw: unknown): Tache {
  const x = (raw ?? {}) as Partial<Tache>;
  return {
    id: x.id || uid(),
    texte: str(x.texte),
    done: !!x.done,
    cree: x.cree || undefined,
    fait: x.fait ?? null,
  };
}

function normLog(raw: unknown): LogEntry {
  const x = (raw ?? {}) as Partial<LogEntry>;
  return { id: x.id || uid(), date: x.date || new Date().toISOString(), texte: str(x.texte) };
}

function normExtra(raw: unknown): Extra {
  const x = (raw ?? {}) as Partial<Extra>;
  return {
    id: x.id || uid(),
    ref: str(x.ref),
    desc: str(x.desc),
    statut: EXTRA_STATUTS.includes(x.statut!) ? x.statut! : 'Soumis',
    montant: num(x.montant),
  };
}

export function normProjet(raw: unknown): Projet {
  const x = (raw ?? {}) as Partial<Projet> & Record<string, unknown>;
  const jalons = {} as Record<JalonKey, JalonEtat>;
  const src = (x.jalons ?? {}) as Record<string, unknown>;
  for (const j of JALONS) jalons[j.k] = normJalon(src[j.k]);

  const av = typeof x.avancementManuel === 'number' && Number.isFinite(x.avancementManuel)
    ? Math.max(0, Math.min(1, x.avancementManuel))
    : null;

  return {
    id: x.id || uid(),
    numero: str(x.numero),
    nom: str(x.nom),
    client: str(x.client),
    charge: str(x.charge),
    statut: STATUTS.includes(x.statut!) ? x.statut! : 'Actif',
    sante: SANTES.includes(x.sante!) ? x.sante! : 'Bon',
    montant: num(x.montant),
    nbOuv: num(x.nbOuv),
    dateOuverture: str(x.dateOuverture),
    dateFermeture: str(x.dateFermeture),
    avancementManuel: av,
    notes: str(x.notes),
    jalons,
    taches: Array.isArray(x.taches) ? x.taches.map(normTache) : [],
    logs: Array.isArray(x.logs) ? x.logs.map(normLog) : [],
    extras: Array.isArray(x.extras) ? x.extras.map(normExtra) : [],
  };
}

/**
 * Ramène n'importe quelle entrée (sauvegarde importée, stockage local d'une
 * version antérieure) à la forme attendue par l'app.
 */
export function normalize(raw: unknown): AppData {
  const s = (raw ?? {}) as Partial<AppData>;
  const projets = Array.isArray(s.projets) ? s.projets.map(normProjet) : [];
  return { v: SCHEMA_VERSION, savedAt: str(s.savedAt), projets };
}

export function donneesVides(): AppData {
  return { v: SCHEMA_VERSION, savedAt: '', projets: [] };
}
