/** Extras, crédits et directives de chantier : la valeur réelle du contrat. */
import { EmptyState } from '../../components/EmptyState';
import { EXTRA_STATUTS } from '../../domain/process';
import { extrasEnAttente, valeurTotale } from '../../domain/compute';
import { fmtMoney, uid } from '../../domain/format';
import type { Extra, ExtraStatut } from '../../domain/types';
import type { TabProps } from './types';

export function TabExtras({ projet, maj }: TabProps) {
  function ajouter() {
    maj((p) => ({
      ...p,
      extras: [...p.extras, { id: uid(), ref: '', desc: '', statut: 'Soumis', montant: null }],
    }));
  }

  function majExtra(id: string, patch: Partial<Extra>) {
    maj((p) => ({ ...p, extras: p.extras.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }

  function supprimer(id: string) {
    maj((p) => ({ ...p, extras: p.extras.filter((e) => e.id !== id) }));
  }

  return (
    <section className="card">
      <div className="card-h">
        <h3>Extras, crédits et directives de chantier</h3>
        <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={ajouter}>
          ＋ Extra
        </button>
      </div>

      {projet.extras.length ? (
        <div className="tw" style={{ border: 0 }}>
          <table className="t" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Description</th>
                <th>Statut</th>
                <th className="tar">Montant</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projet.extras.map((e) => (
                <tr key={e.id}>
                  <td style={{ width: 130 }}>
                    <input
                      className="inp inp-bare cellnum"
                      value={e.ref}
                      placeholder="DC-A-01"
                      aria-label="Référence de l’extra"
                      onChange={(ev) => majExtra(e.id, { ref: ev.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="inp inp-bare"
                      value={e.desc}
                      placeholder="Description"
                      aria-label="Description de l’extra"
                      onChange={(ev) => majExtra(e.id, { desc: ev.target.value })}
                    />
                  </td>
                  <td style={{ width: 140 }}>
                    <select
                      className="sel"
                      value={e.statut}
                      aria-label="Statut de l’extra"
                      onChange={(ev) => majExtra(e.id, { statut: ev.target.value as ExtraStatut })}
                    >
                      {EXTRA_STATUTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="tar" style={{ width: 130 }}>
                    <input
                      className="inp inp-bare cellnum tar"
                      type="number"
                      step="0.01"
                      value={e.montant ?? ''}
                      aria-label="Montant de l’extra"
                      onChange={(ev) =>
                        majExtra(e.id, {
                          montant: ev.target.value === '' ? null : Number(ev.target.value),
                        })
                      }
                    />
                  </td>
                  <td style={{ width: 60 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => supprimer(e.id)} aria-label="Supprimer l’extra">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState titre="Aucun extra">
          Consignez ici les directives, extras et crédits pour suivre la valeur réelle du contrat.
        </EmptyState>
      )}

      <div className="card-h totaux">
        <span className="mono-sm">
          Contrat de base {fmtMoney(projet.montant)} · en attente d’approbation{' '}
          {fmtMoney(extrasEnAttente(projet))}
        </span>
        <strong style={{ marginLeft: 'auto' }} className="num">
          Valeur retenue {fmtMoney(valeurTotale(projet))}
        </strong>
      </div>
    </section>
  );
}
