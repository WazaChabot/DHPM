import { describe, expect, it } from 'vitest';
import {
  aVenir,
  avancement,
  compareSuivi,
  estOuvert,
  etapeCourante,
  extrasEnAttente,
  extrasRetenus,
  jalonEnRetard,
  jalonPct,
  retards,
  titreProjet,
  valeurTotale,
} from './compute';
import { JALONS } from './process';
import { normProjet, projetVide } from './schema';
import type { JalonKey, Projet } from './types';

const REF = new Date(2026, 5, 15); // 15 juin 2026

function projet(over: Partial<Projet> = {}, jalons: Partial<Record<JalonKey, object>> = {}): Projet {
  const base = projetVide(over);
  for (const [k, v] of Object.entries(jalons)) {
    base.jalons[k as JalonKey] = { ...base.jalons[k as JalonKey], ...(v as object) };
  }
  return base;
}

describe('jalonPct', () => {
  it('vaut 1 pour un jalon complété, quel que soit son pourcentage', () => {
    expect(jalonPct({ s: 'complete', pct: 0, d1: '', d2: '', notes: '' })).toBe(1);
  });

  it('borne les valeurs hors plage', () => {
    expect(jalonPct({ s: 'encours', pct: 1.4, d1: '', d2: '', notes: '' })).toBe(1);
    expect(jalonPct({ s: 'encours', pct: -2, d1: '', d2: '', notes: '' })).toBe(0);
  });
});

describe('avancement', () => {
  it('vaut 0 sur un projet neuf', () => {
    expect(avancement(projet())).toBe(0);
  });

  it('vaut 1 quand tous les jalons sont complétés', () => {
    const p = projet();
    for (const j of JALONS) p.jalons[j.k].s = 'complete';
    expect(avancement(p)).toBe(1);
  });

  it('pondère par le poids du jalon', () => {
    // Dessins d'atelier pèse 14 sur un total de 100.
    const p = projet({}, { dessins: { s: 'complete' } });
    const total = JALONS.reduce((a, j) => a + j.p, 0);
    expect(avancement(p)).toBeCloseTo(14 / total, 6);
  });

  it('retire les jalons N/A du dénominateur', () => {
    const p = projet({}, { diagramme: { s: 'na' }, dessins: { s: 'complete' } });
    const total = JALONS.reduce((a, j) => a + j.p, 0) - 4; // diagramme pèse 4
    expect(avancement(p)).toBeCloseTo(14 / total, 6);
  });

  it('vaut 0 si tous les jalons sont N/A', () => {
    const p = projet();
    for (const j of JALONS) p.jalons[j.k].s = 'na';
    expect(avancement(p)).toBe(0);
  });

  it('respecte l’avancement forcé manuellement', () => {
    const p = projet({ avancementManuel: 0.42 }, { dessins: { s: 'complete' } });
    expect(avancement(p)).toBe(0.42);
  });
});

describe('etapeCourante', () => {
  it('démarre à la prise en charge', () => {
    expect(etapeCourante(projet())).toBe('prise');
  });

  it('saute les jalons complétés et les N/A', () => {
    const p = projet({}, {
      ouverture: { s: 'complete' },
      dessins: { s: 'complete' },
      optim: { s: 'complete' },
      diagramme: { s: 'na' },
    });
    expect(etapeCourante(p)).toBe('appro');
  });

  it('renvoie la fermeture quand tout est fait', () => {
    const p = projet();
    for (const j of JALONS) p.jalons[j.k].s = 'complete';
    expect(etapeCourante(p)).toBe('ferm');
  });
});

describe('retards', () => {
  it('signale une échéance dépassée avec le nombre de jours', () => {
    const p = projet({}, { achats: { s: 'encours', d2: '2026-06-05' } });
    const r = retards(p, REF);
    expect(r).toHaveLength(1);
    expect(r[0]!.j.k).toBe('achats');
    expect(r[0]!.jours).toBe(10);
  });

  it('ignore les jalons complétés, N/A et sans échéance', () => {
    const p = projet({}, {
      achats: { s: 'complete', d2: '2026-06-05' },
      reception: { s: 'na', d2: '2026-06-05' },
      dessins: { s: 'encours', d2: '' },
    });
    expect(retards(p, REF)).toHaveLength(0);
  });

  it('ne compte pas une échéance qui tombe aujourd’hui', () => {
    const p = projet({}, { achats: { s: 'encours', d2: '2026-06-15' } });
    expect(retards(p, REF)).toHaveLength(0);
  });
});

describe('aVenir', () => {
  it('retient les échéances dans la fenêtre demandée', () => {
    const p = projet({}, {
      achats: { s: 'encours', d2: '2026-06-20' },
      reception: { s: 'todo', d2: '2026-07-30' },
    });
    const proches = aVenir(p, 14, REF);
    expect(proches.map((x) => x.j.k)).toEqual(['achats']);
    expect(proches[0]!.jours).toBe(5);
  });

  it('inclut l’échéance du jour même', () => {
    const p = projet({}, { achats: { s: 'encours', d2: '2026-06-15' } });
    expect(aVenir(p, 14, REF)).toHaveLength(1);
  });
});

describe('valeur du contrat', () => {
  const p = normProjet({
    montant: 100000,
    extras: [
      { ref: 'A', statut: 'Approuvé', montant: 5000 },
      { ref: 'B', statut: 'Facturé', montant: 2000 },
      { ref: 'C', statut: 'Soumis', montant: 900 },
      { ref: 'D', statut: 'Refusé', montant: 40000 },
      { ref: 'E', statut: 'Approuvé', montant: -500 },
    ],
  });

  it('ne retient que les extras approuvés ou facturés', () => {
    expect(extrasRetenus(p)).toBe(6500);
  });

  it('compte séparément les extras soumis', () => {
    expect(extrasEnAttente(p)).toBe(900);
  });

  it('additionne contrat de base et extras retenus', () => {
    expect(valeurTotale(p)).toBe(106500);
  });

  it('traite un contrat vide comme zéro', () => {
    expect(valeurTotale(projet())).toBe(0);
  });
});

describe('divers', () => {
  it('considère ouverts les statuts de travail', () => {
    expect(estOuvert(projet({ statut: 'Actif' }))).toBe(true);
    expect(estOuvert(projet({ statut: 'En suivi' }))).toBe(true);
    expect(estOuvert(projet({ statut: 'Fermé' }))).toBe(false);
    expect(estOuvert(projet({ statut: 'Inactif' }))).toBe(false);
  });

  it('compose le titre avec le numéro quand il existe', () => {
    expect(titreProjet(projet({ numero: '626001', nom: 'École' }))).toBe('626001 — École');
    expect(titreProjet(projet({ numero: '', nom: '' }))).toBe('Sans nom');
  });

  it('détecte un jalon en retard', () => {
    expect(jalonEnRetard({ s: 'encours', pct: 0, d1: '', d2: '2026-06-01', notes: '' }, REF)).toBe(true);
    expect(jalonEnRetard({ s: 'complete', pct: 1, d1: '', d2: '2026-06-01', notes: '' }, REF)).toBe(false);
  });

  it('trie les projets fragiles et peu avancés en premier', () => {
    const critique = projet({ sante: 'Critique' });
    const risque = projet({ sante: 'À risque' });
    const bon = projet({ sante: 'Bon' });
    expect([bon, critique, risque].sort(compareSuivi).map((p) => p.sante)).toEqual([
      'Critique',
      'À risque',
      'Bon',
    ]);
  });
});
