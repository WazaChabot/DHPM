/** Fiche projet : en-tête, frise du processus et onglets de suivi. */
import { EmptyState } from '../../components/EmptyState';
import { Pill, PillSante } from '../../components/Pill';
import { ProcessRail } from '../../components/ProcessRail';
import { etapeNom } from '../../domain/process';
import { avancement, estOuvert, etapeCourante, retards, valeurTotale } from '../../domain/compute';
import { clamp, fmtMoney, fmtPct } from '../../domain/format';
import { useStore } from '../../store/AppStore';
import { naviguer } from '../../store/router';
import { TabExtras } from './TabExtras';
import { TabFiche } from './TabFiche';
import { TabGantt } from './TabGantt';
import { TabJalons } from './TabJalons';
import { TabJournal } from './TabJournal';
import { TabTaches } from './TabTaches';
import type { Projet } from '../../domain/types';

const ONGLETS = [
  ['jalons', 'Jalons'],
  ['gantt', 'Gantt'],
  ['taches', 'Tâches'],
  ['journal', 'Journal'],
  ['extras', 'Extras & crédits'],
  ['fiche', 'Fiche'],
] as const;

export function ProjetPage({ id, onglet }: { id: string; onglet: string }) {
  const { data, majProjet, supprimerProjet } = useStore();
  const projet = data.projets.find((p) => p.id === id);

  if (!projet) {
    return (
      <div className="card">
        <EmptyState titre="Ce projet n’existe plus">
          <a href="#/projets">Retour à la liste</a>
        </EmptyState>
      </div>
    );
  }

  const maj = (updater: (p: Projet) => Projet) => majProjet(projet.id, updater);
  const av = avancement(projet);
  const ret = retards(projet);
  const actif = ONGLETS.some(([k]) => k === onglet) ? onglet : 'jalons';

  return (
    <>
      <div className="phead">
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="pid">{projet.numero || 'Sans numéro'}</div>
          <h1>{projet.nom || 'Sans nom'}</h1>
          <div className="pmeta">
            <Pill ton={estOuvert(projet) ? 'accent' : 'mute'}>{projet.statut}</Pill>
            <PillSante sante={projet.sante} />
            <Pill>{etapeNom(etapeCourante(projet))}</Pill>
            {ret.length > 0 && (
              <Pill ton="crit">
                {ret.length} jalon{ret.length > 1 ? 's' : ''} en retard
              </Pill>
            )}
          </div>
        </div>

        <div className="phead-av">
          <div className="phead-av-h">
            <span className="eyebrow">Avancement</span>
            <span className="num" style={{ fontSize: 22 }}>{fmtPct(av)}</span>
          </div>
          <div className="meter-track" style={{ height: 8 }}>
            <div className="meter-fill" style={{ width: `${clamp(av, 0, 1) * 100}%` }} />
          </div>
          <div className="mono-sm">
            {fmtMoney(valeurTotale(projet))} · {projet.nbOuv || 0} ouvertures
          </div>
        </div>
      </div>

      <ProcessRail projet={projet} />
      <div style={{ height: 18 }} />

      <div className="tabs" role="tablist">
        {ONGLETS.map(([k, l]) => (
          <button
            className="tab"
            role="tab"
            key={k}
            aria-selected={actif === k}
            onClick={() => naviguer(`#/projet/${projet.id}/${k}`)}
          >
            {l}
          </button>
        ))}
      </div>

      {actif === 'gantt' && <TabGantt projet={projet} />}
      {actif === 'taches' && <TabTaches projet={projet} maj={maj} />}
      {actif === 'journal' && <TabJournal projet={projet} maj={maj} />}
      {actif === 'extras' && <TabExtras projet={projet} maj={maj} />}
      {actif === 'fiche' && (
        <TabFiche
          projet={projet}
          maj={maj}
          onSupprimer={() => {
            supprimerProjet(projet.id);
            naviguer('#/projets');
          }}
        />
      )}
      {actif === 'jalons' && <TabJalons projet={projet} maj={maj} />}
    </>
  );
}
