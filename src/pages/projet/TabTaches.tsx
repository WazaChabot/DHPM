/** Prochaines actions à poser sur le projet. */
import { useRef } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { uid } from '../../domain/format';
import type { Tache } from '../../domain/types';
import type { TabProps } from './types';

export function TabTaches({ projet, maj }: TabProps) {
  const dernierChamp = useRef<HTMLInputElement | null>(null);

  const actives = projet.taches.filter((t) => !t.done);
  const faites = projet.taches.filter((t) => t.done);

  function ajouter() {
    maj((p) => ({
      ...p,
      taches: [...p.taches, { id: uid(), texte: '', done: false, cree: new Date().toISOString() }],
    }));
    // Le champ n'existe qu'après le rendu suivant.
    setTimeout(() => dernierChamp.current?.focus(), 0);
  }

  function majTache(id: string, patch: Partial<Tache>) {
    maj((p) => ({ ...p, taches: p.taches.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }

  function supprimer(id: string) {
    maj((p) => ({ ...p, taches: p.taches.filter((t) => t.id !== id) }));
  }

  function Ligne({ t, dernier }: { t: Tache; dernier: boolean }) {
    return (
      <div className={`task${t.done ? ' done' : ''}`}>
        <input
          type="checkbox"
          className="cb"
          checked={t.done}
          aria-label={t.texte || 'Action sans titre'}
          onChange={(e) =>
            majTache(t.id, { done: e.target.checked, fait: e.target.checked ? new Date().toISOString() : null })
          }
        />
        <input
          className="task-t inp inp-bare"
          value={t.texte}
          placeholder="Décrire l’action…"
          ref={dernier ? dernierChamp : undefined}
          onChange={(e) => majTache(t.id, { texte: e.target.value })}
        />
        <button className="btn btn-ghost btn-sm" onClick={() => supprimer(t.id)}>
          Supprimer
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="card">
        <div className="card-h">
          <h3>Prochaines actions</h3>
          <span className="mono-sm" style={{ marginLeft: 'auto' }}>
            {actives.length} à faire
          </span>
          <button className="btn btn-sm" onClick={ajouter}>
            ＋ Action
          </button>
        </div>
        {actives.length ? (
          <div className="tasks">
            {actives.map((t, i) => (
              <Ligne t={t} dernier={i === actives.length - 1} key={t.id} />
            ))}
          </div>
        ) : (
          <EmptyState titre="Rien à faire pour l’instant">
            Ajoutez les prochaines actions à poser sur ce projet.
          </EmptyState>
        )}
      </section>

      {faites.length > 0 && (
        <details style={{ marginTop: 14 }}>
          <summary className="details-sum">Actions complétées ({faites.length})</summary>
          <div className="card" style={{ marginTop: 8 }}>
            <div className="tasks">
              {faites.map((t) => (
                <Ligne t={t} dernier={false} key={t.id} />
              ))}
            </div>
          </div>
        </details>
      )}
    </>
  );
}
