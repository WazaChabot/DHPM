import { describe, expect, it } from 'vitest';
import { JALONS } from './process';
import { normProjet, normalize, projetVide } from './schema';

describe('normalize', () => {
  it('accepte n’importe quelle entrée sans lever', () => {
    expect(normalize(null).projets).toEqual([]);
    expect(normalize(undefined).projets).toEqual([]);
    expect(normalize({ projets: 'pas un tableau' }).projets).toEqual([]);
  });

  it('complète les 13 jalons manquants', () => {
    const p = normalize({ projets: [{ nom: 'X' }] }).projets[0]!;
    expect(Object.keys(p.jalons).sort()).toEqual(JALONS.map((j) => j.k).sort());
    expect(p.jalons.achats).toEqual({ s: 'todo', pct: 0, d1: '', d2: '', notes: '' });
  });

  it('remplace un statut inconnu par une valeur sûre', () => {
    const p = normProjet({ statut: 'Zombie', sante: 'Douteuse', jalons: { achats: { s: 'bizarre' } } });
    expect(p.statut).toBe('Actif');
    expect(p.sante).toBe('Bon');
    expect(p.jalons.achats.s).toBe('todo');
  });

  it('convertit les montants textuels et vide les valeurs illisibles', () => {
    expect(normProjet({ montant: '1250.5' }).montant).toBe(1250.5);
    expect(normProjet({ montant: '' }).montant).toBeNull();
    expect(normProjet({ montant: 'abc' }).montant).toBeNull();
    expect(normProjet({ nbOuv: '12' }).nbOuv).toBe(12);
  });

  it('borne l’avancement manuel entre 0 et 1', () => {
    expect(normProjet({ avancementManuel: 3 }).avancementManuel).toBe(1);
    expect(normProjet({ avancementManuel: -1 }).avancementManuel).toBe(0);
    expect(normProjet({ avancementManuel: 'oui' }).avancementManuel).toBeNull();
  });

  it('attribue un identifiant aux tâches, journaux et extras qui n’en ont pas', () => {
    const p = normProjet({ taches: [{ texte: 'A' }], logs: [{ texte: 'B' }], extras: [{ ref: 'C' }] });
    expect(p.taches[0]!.id).toBeTruthy();
    expect(p.logs[0]!.id).toBeTruthy();
    expect(p.extras[0]!.id).toBeTruthy();
    expect(p.extras[0]!.statut).toBe('Soumis');
  });

  it('produit des projets vides indépendants', () => {
    const a = projetVide();
    const b = projetVide();
    a.jalons.achats.notes = 'test';
    expect(b.jalons.achats.notes).toBe('');
    expect(a.id).not.toBe(b.id);
  });
});
