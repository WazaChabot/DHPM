/** Tableau de bord : état du portefeuille en un écran. */
import { EmptyState } from '../components/EmptyState';
import { Meter } from '../components/Meter';
import { PillSante, classeSeverite } from '../components/Pill';
import { ETAPES, SANTES, etapeNom } from '../domain/process';
import {
  aVenir,
  avancement,
  compareSuivi,
  estOuvert,
  etapeCourante,
  retards,
  titreProjet,
  valeurTotale,
} from '../domain/compute';
import { fmtDateShort, fmtMoney, fmtPct } from '../domain/format';
import { useStore } from '../store/AppStore';
import { naviguer } from '../store/router';
import type { Projet } from '../domain/types';

export function Dashboard() {
  const { data } = useStore();
  const ouverts = data.projets.filter(estOuvert);

  const valeur = ouverts.reduce((a, p) => a + valeurTotale(p), 0);
  const ouvertures = ouverts.reduce((a, p) => a + (Number(p.nbOuv) || 0), 0);
  const moyenne = ouverts.length
    ? ouverts.reduce((a, p) => a + avancement(p), 0) / ouverts.length
    : 0;
  const attention = ouverts.filter((p) => p.sante !== 'Bon').length;

  const parEtape = ETAPES.map((e) => ({
    e,
    n: ouverts.filter((p) => etapeCourante(p) === e.id).length,
  }));
  const maxEtape = Math.max(1, ...parEtape.map((x) => x.n));

  const alertes = ouverts
    .flatMap((p) => retards(p).map((r) => ({ p, r })))
    .sort((a, b) => b.r.jours - a.r.jours)
    .slice(0, 8);

  const prochains = ouverts
    .flatMap((p) => aVenir(p, 14).map((r) => ({ p, r })))
    .sort((a, b) => a.r.jours - b.r.jours)
    .slice(0, 8);

  const journal = data.projets
    .flatMap((p) => (p.logs || []).map((l) => ({ p, l })))
    .sort((a, b) => (b.l.date || '').localeCompare(a.l.date || ''))
    .slice(0, 6);

  const suivi = ouverts.slice().sort(compareSuivi).slice(0, 8);

  const kpis = [
    { l: 'Projets ouverts', v: String(ouverts.length), s: `${data.projets.length} au total` },
    { l: 'Valeur en cours', v: fmtMoney(valeur), s: 'contrats + extras approuvés' },
    { l: 'Ouvertures', v: String(ouvertures), s: 'portes suivies' },
    { l: 'Avancement moyen', v: fmtPct(moyenne), s: 'pondéré par jalon' },
    {
      l: 'Projets à surveiller',
      v: String(attention),
      s: 'santé à risque ou critique',
      alerte: attention > 0,
    },
  ];

  return (
    <>
      <div className="kpis">
        {kpis.map((k) => (
          <div className={`kpi${k.alerte ? ' kpi-alert' : ''}`} key={k.l}>
            <span className="kpi-l">{k.l}</span>
            <span className="kpi-v">{k.v}</span>
            <span className="kpi-s">{k.s}</span>
          </div>
        ))}
      </div>

      <div className="grid2" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section>
            <h2 className="eyebrow" style={{ marginBottom: 9 }}>
              Projets à suivre en priorité
            </h2>
            <TableSuivi projets={suivi} />
          </section>

          <section className="card">
            <div className="card-h">
              <h3>Jalons en retard</h3>
            </div>
            {alertes.length ? (
              <ul className="alist">
                {alertes.map(({ p, r }) => (
                  <li key={`${p.id}-${r.j.k}`}>
                    <span className="sev sev-crit" />
                    <div style={{ flex: 1 }}>
                      <a href={`#/projet/${p.id}/jalons`}>{titreProjet(p)}</a>
                      <div className="meta">
                        {r.j.n}. {r.j.nom} · échéance {fmtDateShort(r.js.d2)}
                      </div>
                    </div>
                    <span className="pill pill-crit">{r.jours} j</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState titre="Aucun jalon en retard">
                Les échéances saisies sont toutes respectées.
              </EmptyState>
            )}
          </section>

          <section className="card">
            <div className="card-h">
              <h3>Échéances · 14 prochains jours</h3>
            </div>
            {prochains.length ? (
              <ul className="alist">
                {prochains.map(({ p, r }) => (
                  <li key={`${p.id}-${r.j.k}`}>
                    <span className="sev sev-warn" />
                    <div style={{ flex: 1 }}>
                      <a href={`#/projet/${p.id}/jalons`}>{titreProjet(p)}</a>
                      <div className="meta">
                        {r.j.n}. {r.j.nom}
                      </div>
                    </div>
                    <span className="mono-sm">{fmtDateShort(r.js.d2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState titre="Rien d’ici 14 jours">
                Ajoutez des échéances aux jalons pour alimenter cette liste.
              </EmptyState>
            )}
          </section>

          <section className="card">
            <div className="card-h">
              <h3>Dernières entrées de journal</h3>
            </div>
            {journal.length ? (
              <ul className="alist">
                {journal.map(({ p, l }) => (
                  <li key={l.id}>
                    <div style={{ flex: 1 }}>
                      <a href={`#/projet/${p.id}/journal`}>{titreProjet(p)}</a>
                      <div className="meta">{(l.texte || '').slice(0, 130) || 'Entrée vide'}</div>
                    </div>
                    <span className="mono-sm">{fmtDateShort((l.date || '').slice(0, 10))}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState titre="Aucune activité">
                Les entrées de journal des projets s’affichent ici.
              </EmptyState>
            )}
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="card">
            <div className="card-h">
              <h3>Charge par étape</h3>
            </div>
            <div className="barlist">
              {parEtape.map(({ e, n }) => (
                <div className="barrow" key={e.id}>
                  <span className="bl">{e.nom}</span>
                  <div className="bartrack">
                    <div className="barfill" style={{ width: `${(n / maxEtape) * 100}%` }} />
                  </div>
                  <span className="bv">{n}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-h">
              <h3>Santé du portefeuille</h3>
            </div>
            <ul className="alist">
              {SANTES.map((s) => {
                const n = ouverts.filter((p) => p.sante === s).length;
                return (
                  <li key={s}>
                    <span className={`sev ${classeSeverite(s)}`} />
                    <div style={{ flex: 1 }}>
                      <strong>{s}</strong>
                      <div className="meta">
                        {n} projet{n > 1 ? 's' : ''}
                      </div>
                    </div>
                    <span className="cellnum">{n}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

function TableSuivi({ projets }: { projets: Projet[] }) {
  if (!projets.length) {
    return (
      <div className="card">
        <EmptyState titre="Aucun projet ouvert">
          Créez votre premier projet pour démarrer le suivi.
        </EmptyState>
      </div>
    );
  }
  return (
    <div className="tw">
      <table className="t">
        <thead>
          <tr>
            <th>Projet</th>
            <th>Étape</th>
            <th>Santé</th>
            <th style={{ width: 190 }}>Avancement</th>
            <th className="tar">Valeur</th>
          </tr>
        </thead>
        <tbody>
          {projets.map((p) => (
            <tr
              className="clickable"
              key={p.id}
              onClick={() => naviguer(`#/projet/${p.id}/jalons`)}
            >
              <td>
                <strong>{titreProjet(p)}</strong>
                {p.client && <div className="sub">{p.client}</div>}
              </td>
              <td>{etapeNom(etapeCourante(p))}</td>
              <td>
                <PillSante sante={p.sante} />
              </td>
              <td>
                <Meter value={avancement(p)} />
              </td>
              <td className="tar cellnum">{fmtMoney(valeurTotale(p))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
