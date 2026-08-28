import { describe, expect, it } from 'vitest';
import { calculerGantt } from './gantt';
import { projetVide } from './schema';
import type { JalonKey, Projet } from './types';

const REF = new Date(2026, 5, 15); // 15 juin 2026

function projet(jalons: Partial<Record<JalonKey, object>>, over: Partial<Projet> = {}): Projet {
  const p = projetVide({ dateOuverture: '', ...over });
  for (const [k, v] of Object.entries(jalons)) {
    p.jalons[k as JalonKey] = { ...p.jalons[k as JalonKey], ...(v as object) };
  }
  return p;
}

describe('calculerGantt', () => {
  it('renvoie null quand il y a moins de deux dates', () => {
    expect(calculerGantt(projet({}), REF)).toBeNull();
    expect(calculerGantt(projet({ achats: { d1: '2026-06-01' } }), REF)).toBeNull();
  });

  it('arrondit la plage aux mois complets et place les repères', () => {
    const g = calculerGantt(projet({ achats: { d1: '2026-06-10', d2: '2026-07-20' } }), REF)!;
    expect(g.ticks.map((t) => t.label)).toEqual(['juin ’26', 'juil. ’26']);
    expect(g.ticks[0]!.leftPct).toBe(0);
  });

  it('positionne le repère du jour et le retire hors plage', () => {
    const dansLaPlage = calculerGantt(projet({ achats: { d1: '2026-06-01', d2: '2026-07-20' } }), REF)!;
    expect(dansLaPlage.todayPct).toBeGreaterThan(0);
    const horsPlage = calculerGantt(projet({ achats: { d1: '2027-01-05', d2: '2027-02-20' } }), REF)!;
    expect(horsPlage.todayPct).toBeNull();
  });

  it('exclut les jalons N/A et garde ceux sans dates sans barre', () => {
    const g = calculerGantt(
      projet({
        achats: { d1: '2026-06-10', d2: '2026-07-20' },
        reception: { s: 'na', d1: '2026-06-12', d2: '2026-06-30' },
      }),
      REF,
    )!;
    expect(g.lignes.find((l) => l.j.k === 'reception')).toBeUndefined();
    expect(g.lignes.find((l) => l.j.k === 'achats')!.barre).not.toBeNull();
    expect(g.lignes.find((l) => l.j.k === 'dessins')!.barre).toBeNull();
  });

  it('marque en retard une barre dont l’échéance est passée', () => {
    const g = calculerGantt(
      projet({
        achats: { s: 'encours', d1: '2026-05-01', d2: '2026-06-01' },
        livraison: { s: 'complete', d1: '2026-05-01', d2: '2026-06-01' },
      }),
      REF,
    )!;
    expect(g.lignes.find((l) => l.j.k === 'achats')!.barre!.late).toBe(true);
    expect(g.lignes.find((l) => l.j.k === 'livraison')!.barre!.late).toBe(false);
  });

  it('remet les dates dans l’ordre si l’échéance précède le début', () => {
    const g = calculerGantt(projet({ achats: { d1: '2026-07-20', d2: '2026-06-10' } }), REF)!;
    const b = g.lignes.find((l) => l.j.k === 'achats')!.barre!;
    expect(b.leftPct).toBeLessThan(50);
    expect(b.widthPct).toBeGreaterThan(1.2);
  });

  it('donne une largeur minimale à un jalon d’un seul jour', () => {
    const g = calculerGantt(
      projet({ achats: { d1: '2026-06-10', d2: '2026-06-10' }, livraison: { d2: '2026-09-01' } }),
      REF,
    )!;
    expect(g.lignes.find((l) => l.j.k === 'achats')!.barre!.widthPct).toBe(1.2);
  });
});
