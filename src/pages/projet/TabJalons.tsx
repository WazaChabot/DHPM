/** Suivi jalon par jalon : statut, avancement, dates et notes. */
import { Fragment } from 'react';
import { ETAPES, JALONS, JALON_STATUTS } from '../../domain/process';
import { avancement, jalonEnRetard, jalonPct } from '../../domain/compute';
import { clamp, fmtPct } from '../../domain/format';
import { Meter } from '../../components/Meter';
import type { JalonEtat, JalonKey, JalonStatut } from '../../domain/types';
import type { TabProps } from './types';

export function TabJalons({ projet, maj }: TabProps) {
  function majJalon(k: JalonKey, patch: Partial<JalonEtat>) {
    maj((p) => ({ ...p, jalons: { ...p.jalons, [k]: { ...p.jalons[k], ...patch } } }));
  }

  function changerStatut(k: JalonKey, s: JalonStatut) {
    const patch: Partial<JalonEtat> = { s };
    if (s === 'complete') patch.pct = 1;
    if (s === 'todo' && projet.jalons[k].pct === 1) patch.pct = 0;
    majJalon(k, patch);
  }

  const manuel = typeof projet.avancementManuel === 'number';

  return (
    <>
      <div className="tw">
        <table className="t" style={{ minWidth: 940 }}>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Jalon</th>
              <th style={{ width: 150 }}>Statut</th>
              <th style={{ width: 158 }}>Avancement</th>
              <th style={{ width: 140 }}>Début</th>
              <th style={{ width: 158 }}>Échéance</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {ETAPES.map((etape) => (
              <Fragment key={etape.id}>
                <tr className="rowsep">
                  <td colSpan={7}>
                    <span className="eyebrow">{etape.nom}</span>
                  </td>
                </tr>
                {JALONS.filter((j) => j.e === etape.id).map((j) => {
                  const s = projet.jalons[j.k];
                  const late = jalonEnRetard(s);
                  return (
                    <tr key={j.k}>
                      <td className="cellnum" style={{ color: 'var(--ink3)' }}>{j.n}</td>
                      <td>
                        <strong>{j.nom}</strong>
                        <div className="sub">{j.eq}</div>
                      </td>
                      <td>
                        <select
                          className="sel"
                          value={s.s}
                          aria-label={`Statut — ${j.nom}`}
                          onChange={(ev) => changerStatut(j.k, ev.target.value as JalonStatut)}
                        >
                          {JALON_STATUTS.map((o) => (
                            <option value={o.k} key={o.k}>{o.l}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {s.s === 'na' ? (
                          <span className="mono-sm">—</span>
                        ) : s.s === 'complete' ? (
                          <Meter value={1} />
                        ) : (
                          <div className="meter">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              value={Math.round(jalonPct(s) * 100)}
                              style={{ flex: 1, minWidth: 64 }}
                              aria-label={`Avancement — ${j.nom}`}
                              onChange={(ev) => {
                                const pct = clamp(Number(ev.target.value) / 100, 0, 1);
                                // Bouger la glissière sort le jalon de « À faire ».
                                const passeEnCours = s.s === 'todo' && pct > 0;
                                majJalon(j.k, passeEnCours ? { pct, s: 'encours' } : { pct });
                              }}
                            />
                            <span className="meter-val">{Math.round(jalonPct(s) * 100)}%</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <input
                          type="date"
                          className="inp inp-bare"
                          value={s.d1}
                          aria-label={`Début — ${j.nom}`}
                          onChange={(ev) => majJalon(j.k, { d1: ev.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="inp inp-bare"
                          value={s.d2}
                          aria-label={`Échéance — ${j.nom}`}
                          onChange={(ev) => majJalon(j.k, { d2: ev.target.value })}
                        />
                        {late && (
                          <span className="pill pill-crit" style={{ marginLeft: 4 }}>retard</span>
                        )}
                      </td>
                      <td>
                        <input
                          className="jnote"
                          placeholder="Note…"
                          value={s.notes}
                          aria-label={`Note — ${j.nom}`}
                          onChange={(ev) => majJalon(j.k, { notes: ev.target.value })}
                        />
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="avmanuel">
        <label>
          <input
            type="checkbox"
            checked={manuel}
            onChange={(ev) =>
              maj((p) => ({ ...p, avancementManuel: ev.target.checked ? avancement(p) : null }))
            }
          />{' '}
          Forcer l’avancement manuellement
        </label>
        {manuel && (
          <>
            <input
              className="inp"
              style={{ width: 90 }}
              type="number"
              min={0}
              max={100}
              value={Math.round((projet.avancementManuel ?? 0) * 100)}
              aria-label="Avancement forcé, en pourcentage"
              onChange={(ev) =>
                maj((p) => ({ ...p, avancementManuel: clamp(Number(ev.target.value) / 100, 0, 1) }))
              }
            />
            <span className="mono-sm">%</span>
          </>
        )}
        <span className="mono-sm" style={{ marginLeft: 'auto' }}>
          Calcul pondéré : {fmtPct(avancement({ ...projet, avancementManuel: null }))}
        </span>
      </div>
    </>
  );
}
