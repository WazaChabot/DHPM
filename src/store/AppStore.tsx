/** État global de l'application et enregistrement automatique. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { chargerDonnees, effacerDonnees, enregistrerDonnees, etatStockage } from './storage';
import type { EtatStockage } from './storage';
import { donneesDemo } from '../domain/seed';
import { donneesVides, normProjet } from '../domain/schema';
import { uid } from '../domain/format';
import type { AppData, Projet } from '../domain/types';

/** Délai avant écriture, pour ne pas enregistrer à chaque frappe. */
const DELAI_ENREGISTREMENT = 500;

export interface Store {
  data: AppData;
  /** Horodatage du dernier enregistrement réussi. */
  savedAt: string;
  /** `true` entre une modification et son écriture. */
  enregistrementEnCours: boolean;
  stockage: EtatStockage;
  ajouterProjet: (p: Projet) => void;
  majProjet: (id: string, updater: (p: Projet) => Projet) => void;
  supprimerProjet: (id: string) => void;
  remplacerTout: (data: AppData) => void;
  fusionner: (data: AppData) => void;
  reinitialiser: () => void;
  chargerDemo: () => void;
}

const StoreContext = createContext<Store | null>(null);

function donneesInitiales(): AppData {
  const enregistrees = chargerDonnees();
  if (enregistrees) return enregistrees;
  // Première ouverture : on amorce avec deux projets d'exemple.
  const demo = donneesDemo();
  enregistrerDonnees(demo);
  return demo;
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(donneesInitiales);
  const [savedAt, setSavedAt] = useState<string>(() => data.savedAt);
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [stockage, setStockage] = useState<EtatStockage>(etatStockage);
  const premierRendu = useRef(true);
  const derniereData = useRef(data);
  const enAttente = useRef(false);

  /** Écrit sur-le-champ la dernière version connue, si elle n'est pas déjà écrite. */
  const ecrire = useCallback(() => {
    if (!enAttente.current) return;
    const horodatage = new Date().toISOString();
    const ok = enregistrerDonnees({ ...derniereData.current, savedAt: horodatage });
    enAttente.current = false;
    if (ok) setSavedAt(horodatage);
    setStockage(etatStockage());
    setEnregistrementEnCours(false);
  }, []);

  // Enregistrement différé : la dernière modification d'une rafale gagne.
  useEffect(() => {
    derniereData.current = data;
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    enAttente.current = true;
    setEnregistrementEnCours(true);
    const t = setTimeout(ecrire, DELAI_ENREGISTREMENT);
    return () => clearTimeout(t);
  }, [data, ecrire]);

  // Quitter ou masquer la page ne doit jamais perdre la modification en cours.
  useEffect(() => {
    const surMasquage = () => {
      if (document.visibilityState === 'hidden') ecrire();
    };
    window.addEventListener('pagehide', ecrire);
    document.addEventListener('visibilitychange', surMasquage);
    return () => {
      window.removeEventListener('pagehide', ecrire);
      document.removeEventListener('visibilitychange', surMasquage);
    };
  }, [ecrire]);

  const ajouterProjet = useCallback((p: Projet) => {
    setData((d) => ({ ...d, projets: [...d.projets, p] }));
  }, []);

  const majProjet = useCallback((id: string, updater: (p: Projet) => Projet) => {
    setData((d) => ({
      ...d,
      projets: d.projets.map((p) => (p.id === id ? updater(p) : p)),
    }));
  }, []);

  const supprimerProjet = useCallback((id: string) => {
    setData((d) => ({ ...d, projets: d.projets.filter((p) => p.id !== id) }));
  }, []);

  const remplacerTout = useCallback((incoming: AppData) => {
    setData({ ...incoming, savedAt: '' });
  }, []);

  const fusionner = useCallback((incoming: AppData) => {
    setData((d) => ({
      ...d,
      // Les projets importés reçoivent de nouveaux identifiants : un même
      // fichier peut ainsi être ajouté deux fois sans écraser l'existant.
      projets: [...d.projets, ...incoming.projets.map((p) => normProjet({ ...p, id: uid() }))],
    }));
  }, []);

  const reinitialiser = useCallback(() => {
    effacerDonnees();
    setData(donneesVides());
  }, []);

  const chargerDemo = useCallback(() => {
    setData(donneesDemo());
  }, []);

  const value = useMemo<Store>(
    () => ({
      data,
      savedAt,
      enregistrementEnCours,
      stockage,
      ajouterProjet,
      majProjet,
      supprimerProjet,
      remplacerTout,
      fusionner,
      reinitialiser,
      chargerDemo,
    }),
    [
      data, savedAt, enregistrementEnCours, stockage,
      ajouterProjet, majProjet, supprimerProjet, remplacerTout, fusionner, reinitialiser, chargerDemo,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore doit être utilisé dans un AppStoreProvider.');
  return s;
}

/** Le projet de la route courante, et un raccourci pour le modifier. */
export function useProjet(id: string | undefined) {
  const { data, majProjet } = useStore();
  const projet = id ? data.projets.find((p) => p.id === id) : undefined;
  const patch = useCallback(
    (patchProjet: Partial<Projet>) => {
      if (id) majProjet(id, (p) => ({ ...p, ...patchProjet }));
    },
    [id, majProjet],
  );
  return { projet, patch, majProjet };
}
