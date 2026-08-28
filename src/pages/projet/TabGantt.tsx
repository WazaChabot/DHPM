/** Diagramme de Gantt des 13 jalons, à l'échelle des mois du projet. */
import { EmptyState } from '../../components/EmptyState';
import { calculerGantt } from '../../domain/gantt';
import { fmtDate } from '../../domain/format';
import type { TabProps } from './types';

export function TabGantt({ projet }: Pick<TabProps, 'projet'>) {
  const layout = calculerGantt(projet);

  if (!layout) {
    return (
      <div className="card">
        <EmptyState titre="Pas encore de calendrier">
          Saisissez des dates de début et d’échéance dans l’onglet Jalons pour construire le
          diagramme.
        </EmptyState>
      </div>
    );
  }

  const ticks = layout.ticks.map((t, i) => (
    <div className="gtick" style={{ left: `${t.leftPct}%` }} key={i}>
      <span>{t.label}</span>
    </div>
  ));
  const today =
    layout.todayPct == null ? null : <div className="gtoday" style={{ left: `${layout.todayPct}%` }} />;

  return (
    <>
      <div className="card">
        <div className="gantt">
          <div className="gwrap">
            <div className="gaxis">
              <div className="glab">
                <span className="eyebrow">Jalon</span>
              </div>
              <div className="gaxis-t">
                {ticks}
                {today}
              </div>
            </div>

            {layout.lignes.map(({ j, barre, d1, d2 }) => (
              <div className="grow" key={j.k}>
                <div className="glab">
                  <span className="n">{j.n}</span>
                  <span className="gname">{j.nom}</span>
                </div>
                <div className="gtrack">
                  {ticks}
                  {barre && (
                    <div
                      className={`gbar ${barre.variante}${barre.late ? ' late' : ''}`.trim()}
                      style={{ left: `${barre.leftPct}%`, width: `${barre.widthPct}%` }}
                      title={`${j.nom} · ${fmtDate(d1)} → ${fmtDate(d2)}`}
                    >
                      {barre.widthPct >= 7 && <span>{Math.round(barre.pct * 100)}%</span>}
                    </div>
                  )}
                  {today}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mono-sm" style={{ marginTop: 10 }}>
        Trait orange : aujourd’hui. Contour rouge : échéance dépassée.
      </p>
    </>
  );
}
