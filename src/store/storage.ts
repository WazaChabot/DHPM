/** Persistance locale : les données vivent dans le navigateur de l'utilisateur. */
import { normalize } from '../domain/schema';
import type { AppData } from '../domain/types';

export const STORAGE_KEY = 'dhpm.data.v1';

export type EtatStockage = 'ok' | 'indisponible' | 'plein';

let etat: EtatStockage = 'ok';

export function etatStockage(): EtatStockage {
  return etat;
}

function storage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = '__dhpm_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    etat = 'indisponible';
    return null;
  }
}

/** Lit les données enregistrées, ou `null` si le stockage est vide/illisible. */
export function chargerDonnees(): AppData | null {
  const s = storage();
  if (!s) return null;
  const raw = s.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalize(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Enregistre les données. Renvoie `false` si l'écriture a échoué. */
export function enregistrerDonnees(data: AppData): boolean {
  const s = storage();
  if (!s) return false;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(data));
    etat = 'ok';
    return true;
  } catch {
    etat = 'plein';
    return false;
  }
}

export function effacerDonnees(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* stockage indisponible : rien à effacer */
  }
}
