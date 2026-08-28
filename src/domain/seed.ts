/**
 * Deux projets de démonstration, datés par rapport à aujourd'hui pour que le
 * tableau de bord montre des retards et des échéances dès la première ouverture.
 */
import { normalize, projetVide } from './schema';
import { todayISO } from './format';
import type { AppData, JalonEtat, JalonKey } from './types';

/** Date ISO décalée de `n` jours par rapport à aujourd'hui. */
function d(n: number): string {
  const t = new Date();
  t.setDate(t.getDate() + n);
  return todayISO(t);
}

/** Horodatage ISO complet décalé de `n` jours. */
function ts(n: number): string {
  const t = new Date();
  t.setDate(t.getDate() + n);
  return t.toISOString();
}

type JalonSeed = Partial<JalonEtat>;

function jalons(spec: Partial<Record<JalonKey, JalonSeed>>): Record<string, JalonSeed> {
  return spec as Record<string, JalonSeed>;
}

export function donneesDemo(): AppData {
  const centre = {
    ...projetVide(),
    id: 'demo-626001',
    numero: '626001',
    nom: 'Centre communautaire (exemple)',
    client: 'Entrepreneur général inc.',
    charge: 'À assigner',
    statut: 'Actif',
    sante: 'À risque',
    montant: 184500,
    nbOuv: 46,
    dateOuverture: d(-74),
    jalons: jalons({
      ouverture: { s: 'complete', d1: d(-74), d2: d(-71) },
      dessins: { s: 'complete', d1: d(-71), d2: d(-49) },
      optim: { s: 'complete', d1: d(-49), d2: d(-42) },
      diagramme: { s: 'na' },
      achats: { s: 'encours', pct: 0.8, d1: d(-39), d2: d(-14), notes: 'Seuils et ferme-portes à commander' },
      reception: { s: 'attente', pct: 0.35, d1: d(-18), d2: d(21) },
      faconnage: { s: 'todo', d1: d(24), d2: d(28) },
      premontage: { s: 'todo', d1: d(28), d2: d(35) },
      installation: { s: 'todo', d1: d(38), d2: d(77) },
      livraison: { s: 'todo', d1: d(38), d2: d(84) },
      facturation: { s: 'todo', d1: d(84), d2: d(94) },
      garanties: { s: 'todo', d2: d(99) },
      fermeture: { s: 'todo', d2: d(106) },
    }),
    taches: [
      { id: 't0', texte: 'Relancer le fournisseur pour la confirmation des seuils', done: false },
      { id: 't1', texte: "Fixer la date de prémontage avec l'atelier", done: false },
    ],
    logs: [
      {
        id: 'l0',
        date: ts(-14),
        texte:
          "Suivi téléphonique avec l'entrepreneur : phase 2 repoussée de deux semaines. Mise en marche partielle confirmée.",
      },
      {
        id: 'l1',
        date: ts(-42),
        texte: 'Optimisation complétée : 4 cadres regroupés, économie de 1 200 $ sur l’acier.',
      },
    ],
    extras: [
      { id: 'x1', ref: 'DC-A-03', desc: 'Ajout de 2 ouvertures au niveau 1', statut: 'Approuvé', montant: 7003.5 },
      { id: 'x2', ref: 'DC-A-05', desc: 'Crédit — quincaillerie retirée', statut: 'Soumis', montant: -538 },
    ],
  };

  const usine = {
    ...projetVide(),
    id: 'demo-626002',
    numero: '626002',
    nom: "Agrandissement d'usine (exemple)",
    client: 'Constructions du Nord',
    charge: 'À assigner',
    statut: 'Actif',
    sante: 'Bon',
    montant: 42800,
    nbOuv: 12,
    dateOuverture: d(-31),
    jalons: jalons({
      ouverture: { s: 'complete', d1: d(-31), d2: d(-29) },
      dessins: { s: 'encours', pct: 0.6, d1: d(-25), d2: d(-3) },
      optim: { s: 'todo', d1: d(-2), d2: d(5) },
      diagramme: { s: 'todo', d1: d(-2), d2: d(7) },
      achats: { s: 'todo', d1: d(10), d2: d(21) },
      reception: { s: 'todo', d1: d(38), d2: d(70) },
      faconnage: { s: 'todo', d2: d(77) },
      premontage: { s: 'todo', d2: d(84) },
      installation: { s: 'todo', d1: d(87), d2: d(112) },
      livraison: { s: 'todo', d2: d(112) },
      facturation: { s: 'todo', d2: d(134) },
      garanties: { s: 'todo', d2: d(141) },
      fermeture: { s: 'todo', d2: d(148) },
    }),
    taches: [
      { id: 't0', texte: 'Valider la quincaillerie des portes coupe-feu avec l’architecte', done: false },
    ],
    logs: [
      {
        id: 'l0',
        date: ts(-25),
        texte: "Bon de commande signé et reçu. Dossier ouvert, dessins d'atelier lancés.",
      },
    ],
    extras: [],
  };

  return normalize({ projets: [centre, usine] });
}
