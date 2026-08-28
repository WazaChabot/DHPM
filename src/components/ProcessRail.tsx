/** Frise du processus : une pastille par jalon, groupée par étape. */
import { ETAPES, JALONS, labelStatutJalon } from '../domain/process';
import { jalonEnRetard } from '../domain/compute';
import type { Projet } from '../domain/types';

export function ProcessRail({ projet }: { projet: Projet }) {
  return (
    <div className="card">
      <div className="prail">
        {ETAPES.map((e) => (
          <div className="pr-etape" key={e.id}>
            <span className="pr-etape-l">{e.nom}</span>
            <div className="pr-ticks">
              {JALONS.filter((j) => j.e === e.id).map((j) => {
                const s = projet.jalons[j.k];
                const late = jalonEnRetard(s);
                return (
                  <div
                    key={j.k}
                    className={`pr-tick s-${s.s}${late ? ' late' : ''}`}
                    title={`${j.n}. ${j.nom} — ${labelStatutJalon(s.s)}`}
                  >
                    <span className="lab">{j.n}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
