/** Référentiel du processus standard : 4 étapes, 13 jalons. */
import type {
  Etape,
  ExtraStatut,
  JalonDef,
  JalonKey,
  JalonStatut,
  Sante,
  Statut,
} from './types';

export const ETAPES: Etape[] = [
  { id: 'prise', nom: 'Prise en charge' },
  { id: 'appro', nom: 'Approvisionnement' },
  { id: 'real', nom: 'Réalisation' },
  { id: 'ferm', nom: 'Fermeture' },
];

export const JALONS: JalonDef[] = [
  { n: 1, k: 'ouverture', nom: 'Ouverture de dossier', e: 'prise', p: 6, eq: 'Chargé de projet' },
  { n: 2, k: 'dessins', nom: "Dessins d'atelier", e: 'prise', p: 14, eq: 'Chargé de projet' },
  { n: 3, k: 'optim', nom: 'Optimisation', e: 'prise', p: 6, eq: 'Chargé de projet' },
  { n: 4, k: 'diagramme', nom: 'Diagramme de branchement', e: 'prise', p: 4, eq: 'Chargé de projet' },
  { n: 5, k: 'achats', nom: 'Mise en marche (achats)', e: 'appro', p: 14, eq: 'Responsable des achats' },
  { n: 6, k: 'reception', nom: 'Réception de la marchandise', e: 'appro', p: 14, eq: 'Réception / entrepôt' },
  { n: 7, k: 'faconnage', nom: 'Façonnage des serrures', e: 'real', p: 6, eq: 'Serrurier' },
  { n: 8, k: 'premontage', nom: 'Prémontage quincaillerie', e: 'real', p: 6, eq: 'Prémonteur' },
  { n: 9, k: 'installation', nom: 'Installation', e: 'real', p: 14, eq: 'Coordonnateur installations' },
  { n: 10, k: 'livraison', nom: 'Livraison', e: 'real', p: 6, eq: 'Livreur' },
  { n: 11, k: 'facturation', nom: 'Facturation', e: 'ferm', p: 5, eq: 'Admin' },
  { n: 12, k: 'garanties', nom: 'Émission des garanties', e: 'ferm', p: 2, eq: 'Admin' },
  { n: 13, k: 'fermeture', nom: 'Fermeture du dossier', e: 'ferm', p: 3, eq: 'Chargé de projet' },
];

export const JALON_KEYS: JalonKey[] = JALONS.map((j) => j.k);

export const JALON_STATUTS: { k: JalonStatut; l: string }[] = [
  { k: 'todo', l: 'À faire' },
  { k: 'encours', l: 'En cours' },
  { k: 'attente', l: 'En attente' },
  { k: 'suivi', l: 'En suivi' },
  { k: 'complete', l: 'Complété' },
  { k: 'na', l: 'N/A' },
];

export const STATUTS: Statut[] = ['Inactif', 'Actif', 'En suivi', 'En fermeture', 'Terminé', 'Fermé'];
export const STATUTS_OUVERTS: Statut[] = ['Actif', 'En suivi', 'En fermeture'];
export const SANTES: Sante[] = ['Bon', 'À risque', 'Critique'];
export const EXTRA_STATUTS: ExtraStatut[] = ['Soumis', 'Approuvé', 'Refusé', 'Facturé'];

export function etapeNom(id: string): string {
  return ETAPES.find((e) => e.id === id)?.nom ?? '—';
}

export function labelStatutJalon(k: JalonStatut): string {
  return JALON_STATUTS.find((s) => s.k === k)?.l ?? k;
}

export function jalonsDeEtape(id: string): JalonDef[] {
  return JALONS.filter((j) => j.e === id);
}
