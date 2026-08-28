/**
 * Routeur minimal sur le fragment d'URL (#/…). Le hash évite toute
 * configuration serveur : l'app fonctionne depuis un simple fichier statique.
 */
import { useSyncExternalStore } from 'react';

function abonner(cb: () => void): () => void {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

function hashCourant(): string {
  return window.location.hash || '#/dashboard';
}

/** Segments de la route courante : `#/projet/abc/gantt` → `['projet','abc','gantt']`. */
export function useRoute(): string[] {
  const hash = useSyncExternalStore(abonner, hashCourant, () => '#/dashboard');
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}

export function naviguer(hash: string): void {
  window.location.hash = hash;
}
