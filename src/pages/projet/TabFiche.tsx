/** Propriétés du projet et suppression du dossier. */
import { SANTES, STATUTS } from '../../domain/process';
import { titreProjet } from '../../domain/compute';
import type { Projet, Sante, Statut } from '../../domain/types';
import type { TabProps } from './types';

export function TabFiche({
  projet,
  maj,
  onSupprimer,
}: TabProps & { onSupprimer: () => void }) {
  function champ(
    label: string,
    key: 'numero' | 'nom' | 'client' | 'charge' | 'montant' | 'nbOuv' | 'dateOuverture' | 'dateFermeture',
    type = 'text',
    step?: string,
  ) {
    const numerique = key === 'montant' || key === 'nbOuv';
    return (
      <label className="fl" key={key}>
        <span>{label}</span>
        <input
          className="inp"
          type={type}
          {...(step ? { step } : {})}
          value={projet[key] ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            const valeur = numerique ? (v === '' ? null : Number(v)) : v;
            maj((p) => ({ ...p, [key]: valeur }) as Projet);
          }}
        />
      </label>
    );
  }

  function supprimer() {
    const ok = window.confirm(
      `Supprimer définitivement « ${titreProjet(projet)} » ? Exportez d’abord une sauvegarde si nécessaire.`,
    );
    if (ok) onSupprimer();
  }

  return (
    <section className="card">
      <div className="card-h">
        <h3>Propriétés du projet</h3>
      </div>
      <div className="card-b">
        <div className="pprops">
          {champ('Numéro de projet', 'numero')}
          {champ('Nom du projet', 'nom')}
          {champ('Client', 'client')}
          {champ('Chargé de projet', 'charge')}
          <label className="fl">
            <span>Statut</span>
            <select
              className="sel"
              value={projet.statut}
              onChange={(e) => maj((p) => ({ ...p, statut: e.target.value as Statut }))}
            >
              {STATUTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="fl">
            <span>Santé</span>
            <select
              className="sel"
              value={projet.sante}
              onChange={(e) => maj((p) => ({ ...p, sante: e.target.value as Sante }))}
            >
              {SANTES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {champ('Valeur du contrat ($)', 'montant', 'number', '0.01')}
          {champ('Nombre d’ouvertures', 'nbOuv', 'number', '1')}
          {champ('Date d’ouverture', 'dateOuverture', 'date')}
          {champ('Date de fermeture', 'dateFermeture', 'date')}
        </div>

        <label className="fl" style={{ marginTop: 14 }}>
          <span>Notes générales</span>
          <textarea
            className="ta"
            rows={4}
            value={projet.notes ?? ''}
            placeholder="Contexte, particularités, contacts…"
            onChange={(e) => maj((p) => ({ ...p, notes: e.target.value }))}
          />
        </label>

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button className="btn btn-danger" onClick={supprimer}>
            Supprimer ce projet
          </button>
        </div>
      </div>
    </section>
  );
}
