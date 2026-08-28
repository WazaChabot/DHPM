/** Types du domaine : un projet de Division 08 et son suivi. */

export type EtapeId = 'prise' | 'appro' | 'real' | 'ferm';

export type JalonKey =
  | 'ouverture'
  | 'dessins'
  | 'optim'
  | 'diagramme'
  | 'achats'
  | 'reception'
  | 'faconnage'
  | 'premontage'
  | 'installation'
  | 'livraison'
  | 'facturation'
  | 'garanties'
  | 'fermeture';

/** Statut d'un jalon. `na` retire le jalon du calcul d'avancement. */
export type JalonStatut = 'todo' | 'encours' | 'attente' | 'suivi' | 'complete' | 'na';

export type Statut = 'Inactif' | 'Actif' | 'En suivi' | 'En fermeture' | 'Terminé' | 'Fermé';
export type Sante = 'Bon' | 'À risque' | 'Critique';
export type ExtraStatut = 'Soumis' | 'Approuvé' | 'Refusé' | 'Facturé';

export interface Etape {
  id: EtapeId;
  nom: string;
}

export interface JalonDef {
  /** Numéro d'ordre affiché (1 à 13). */
  n: number;
  k: JalonKey;
  nom: string;
  /** Étape à laquelle le jalon appartient. */
  e: EtapeId;
  /** Poids dans l'avancement pondéré du projet. */
  p: number;
  /** Équipe responsable. */
  eq: string;
}

export interface JalonEtat {
  s: JalonStatut;
  /** Avancement du jalon, de 0 à 1. */
  pct: number;
  /** Date de début (ISO `AAAA-MM-JJ`), vide si non planifiée. */
  d1: string;
  /** Échéance (ISO `AAAA-MM-JJ`), vide si non planifiée. */
  d2: string;
  notes: string;
}

export interface Tache {
  id: string;
  texte: string;
  done: boolean;
  cree?: string;
  fait?: string | null;
}

export interface LogEntry {
  id: string;
  /** Horodatage ISO complet. */
  date: string;
  texte: string;
}

export interface Extra {
  id: string;
  ref: string;
  desc: string;
  statut: ExtraStatut;
  /** Montant en dollars ; négatif pour un crédit. */
  montant: number | null;
}

export interface Projet {
  id: string;
  numero: string;
  nom: string;
  client: string;
  charge: string;
  statut: Statut;
  sante: Sante;
  montant: number | null;
  nbOuv: number | null;
  dateOuverture: string;
  dateFermeture: string;
  /** Si défini (0 à 1), remplace l'avancement calculé. */
  avancementManuel: number | null;
  notes?: string;
  jalons: Record<JalonKey, JalonEtat>;
  taches: Tache[];
  logs: LogEntry[];
  extras: Extra[];
}

export interface AppData {
  /** Version du schéma, pour les migrations futures. */
  v: number;
  savedAt: string;
  projets: Projet[];
}
