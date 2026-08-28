/** Liste des projets : recherche, filtres, tri, totaux. */
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Meter } from '../components/Meter';
import { Pill, PillSante } from '../components/Pill';
import { ETAPES, SANTES, STATUTS, etapeNom } from '../domain/process';
import {
  avancement,
  estOuvert,
  etapeCourante,
  rangSante,
  retards,
  valeurTotale,
} from '../domain/compute';
import { fmtMoney } from '../domain/format';
import { useStore } from '../store/AppStore';
import { naviguer } from '../store/router';
import type { Projet } from '../domain/types';

type Tri = 'numero' | 'nom' | 'client' | 'etape' | 'avancement' | 'sante' | 'ouvertures' | 'valeur';

interface Filtres {
  q: string;
  statut: string;
  sante: string;
  etape: string;
  tri: Tri;
  sens: 1 | -1;
}

const FILTRES_INITIAUX: Filtres = {
  q: '',
  statut: 'Ouverts',
  sante: '',
  etape: '',
  tri: 'numero',
  sens: 1,
};

function valeurTri(p: Projet, tri: Tri): string | number {
  switch (tri) {
    case 'avancement': return avancement(p);
    case 'valeur': return valeurTotale(p);
    case 'ouvertures': return Number(p.nbOuv) || 0;
    case 'sante': return rangSante(p.sante);
    case 'client': return (p.client || '').toLowerCase();
    case 'etape': return etapeCourante(p);
    case 'nom': return (p.nom || '').toLowerCase();
    default: return (p.numero || '') + p.nom;
  }
}

export function Projets() {
  const { data } = useStore();
  const [f, setF] = useState<Filtres>(FILTRES_INITIAUX);

  const rows = useMemo(() => {
    const filtres = data.projets.filter((p) => {
      if (f.statut === 'Ouverts' && !estOuvert(p)) return false;
      if (f.statut !== 'Ouverts' && f.statut !== 'Tous' && p.statut !== f.statut) return false;
      if (f.sante && p.sante !== f.sante) return false;
      if (f.etape && etapeCourante(p) !== f.etape) return false;
      if (f.q) {
        const s = `${p.numero} ${p.nom} ${p.client} ${p.charge}`.toLowerCase();
        if (!s.includes(f.q.toLowerCase())) return false;
      }
      return true;
    });
    return filtres.sort((a, b) => {
      const va = valeurTri(a, f.tri);
      const vb = valeurTri(b, f.tri);
      if (va < vb) return -f.sens;
      if (va > vb) return f.sens;
      return 0;
    });
  }, [data.projets, f]);

  const totalVal = rows.reduce((a, p) => a + valeurTotale(p), 0);
  const totalOuv = rows.reduce((a, p) => a + (Number(p.nbOuv) || 0), 0);

  function trier(k: Tri) {
    setF((prev) =>
      prev.tri === k
        ? { ...prev, sens: prev.sens === 1 ? -1 : 1 }
        : { ...prev, tri: k, sens: 1 },
    );
  }

  function Th({ k, label, cls }: { k: Tri; label: string; cls?: string }) {
    const fleche = f.tri === k ? (f.sens === 1 ? ' ↑' : ' ↓') : '';
    return (
      <th
        className={`sortable ${cls ?? ''}`.trim()}
        onClick={() => trier(k)}
        aria-sort={f.tri === k ? (f.sens === 1 ? 'ascending' : 'descending') : 'none'}
      >
        {label}
        {fleche}
      </th>
    );
  }

  return (
    <>
      <div className="toolbar">
        <input
          className="inp search"
          placeholder="Rechercher un projet, client, chargé…"
          value={f.q}
          onChange={(e) => setF({ ...f, q: e.target.value })}
        />
        <select className="sel" value={f.statut} onChange={(e) => setF({ ...f, statut: e.target.value })}>
          {['Ouverts', 'Tous', ...STATUTS].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="sel" value={f.sante} onChange={(e) => setF({ ...f, sante: e.target.value })}>
          <option value="">Toute santé</option>
          {SANTES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="sel" value={f.etape} onChange={(e) => setF({ ...f, etape: e.target.value })}>
          <option value="">Toutes les étapes</option>
          {ETAPES.map((e) => (
            <option value={e.id} key={e.id}>
              {e.nom}
            </option>
          ))}
        </select>
        <span style={{ marginLeft: 'auto' }} className="mono-sm">
          {rows.length} projets · {totalOuv} ouvertures · {fmtMoney(totalVal)}
        </span>
      </div>

      <div className="tw">
        <table className="t">
          <thead>
            <tr>
              <Th k="numero" label="No" />
              <Th k="nom" label="Projet" />
              <Th k="client" label="Client" />
              <th>Statut</th>
              <Th k="etape" label="Étape" />
              <Th k="avancement" label="Avancement" />
              <Th k="sante" label="Santé" />
              <Th k="ouvertures" label="Ouv." cls="tar" />
              <Th k="valeur" label="Valeur" cls="tar" />
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((p) => {
                const ret = retards(p).length;
                return (
                  <tr
                    className="clickable"
                    key={p.id}
                    onClick={() => naviguer(`#/projet/${p.id}/jalons`)}
                  >
                    <td>
                      <span className="cellnum" style={{ color: 'var(--oxide)' }}>
                        {p.numero || '—'}
                      </span>
                    </td>
                    <td>
                      <strong>{p.nom || 'Sans nom'}</strong>{' '}
                      {ret > 0 && <span className="pill pill-crit">{ret} en retard</span>}
                    </td>
                    <td>{p.client || '—'}</td>
                    <td>
                      <Pill ton={estOuvert(p) ? 'accent' : 'mute'}>{p.statut}</Pill>
                    </td>
                    <td>{etapeNom(etapeCourante(p))}</td>
                    <td>
                      <Meter value={avancement(p)} />
                    </td>
                    <td>
                      <PillSante sante={p.sante} />
                    </td>
                    <td className="tar cellnum">{p.nbOuv ?? '—'}</td>
                    <td className="tar cellnum">{fmtMoney(valeurTotale(p))}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>
                  <EmptyState titre="Aucun projet ne correspond">
                    Ajustez les filtres ou créez un projet.
                  </EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
