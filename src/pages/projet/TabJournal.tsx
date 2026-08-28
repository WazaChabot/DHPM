/** Journal du projet : une entrée horodatée par suivi. */
import { EmptyState } from '../../components/EmptyState';
import { fmtDateTime, uid } from '../../domain/format';
import type { TabProps } from './types';

export function TabJournal({ projet, maj }: TabProps) {
  const logs = projet.logs.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  function ajouter() {
    maj((p) => ({ ...p, logs: [...p.logs, { id: uid(), date: new Date().toISOString(), texte: '' }] }));
  }

  function supprimer(id: string) {
    if (!window.confirm('Supprimer cette entrée de journal ?')) return;
    maj((p) => ({ ...p, logs: p.logs.filter((l) => l.id !== id) }));
  }

  return (
    <section className="card">
      <div className="card-h">
        <h3>Journal du projet</h3>
        <span className="mono-sm" style={{ marginLeft: 'auto' }}>
          {logs.length} entrée{logs.length > 1 ? 's' : ''}
        </span>
        <button className="btn btn-primary btn-sm" onClick={ajouter}>
          ＋ Nouvelle entrée
        </button>
      </div>
      {logs.length ? (
        <div className="logs">
          {logs.map((l) => (
            <div className="log" key={l.id}>
              <div className="log-d">{fmtDateTime(l.date)}</div>
              <div className="log-t">
                <textarea
                  className="ta"
                  rows={2}
                  value={l.texte}
                  placeholder="Actions complétées, décisions, suivis…"
                  aria-label={`Entrée du ${fmtDateTime(l.date)}`}
                  onChange={(e) => {
                    const texte = e.target.value;
                    maj((p) => ({
                      ...p,
                      logs: p.logs.map((x) => (x.id === l.id ? { ...x, texte } : x)),
                    }));
                  }}
                />
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => supprimer(l.id)}>
                Supprimer
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState titre="Journal vide">
          Appuyez sur « Nouvelle entrée » : la date est inscrite automatiquement, décrivez ensuite
          les actions complétées.
        </EmptyState>
      )}
    </section>
  );
}
