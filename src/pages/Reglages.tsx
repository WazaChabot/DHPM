/** Réglages : sauvegardes, référentiel du processus, état des données. */
import { useRef, useState } from 'react';
import { JALONS, etapeNom } from '../domain/process';
import { estOuvert } from '../domain/compute';
import { fmtDateTime } from '../domain/format';
import {
  ImportInvalideError,
  exporterJSON,
  exporterJalonsCSV,
  exporterProjetsCSV,
  lireSauvegarde,
} from '../store/io';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/Toast';
import { naviguer } from '../store/router';
import type { Theme } from '../store/theme';

const THEMES: { k: Theme; l: string }[] = [
  { k: 'system', l: 'Suivre le système' },
  { k: 'light', l: 'Clair' },
  { k: 'dark', l: 'Sombre' },
];

export function Reglages({ theme, onTheme }: { theme: Theme; onTheme: (t: Theme) => void }) {
  const { data, savedAt, stockage, remplacerTout, fusionner, reinitialiser, chargerDemo } = useStore();
  const toast = useToast();
  const [texteImport, setTexteImport] = useState('');
  const fichier = useRef<HTMLInputElement | null>(null);

  const fermes = data.projets.filter((p) => !estOuvert(p)).length;

  function importer(texte: string, mode: 'remplacer' | 'ajouter') {
    let incoming;
    try {
      incoming = lireSauvegarde(texte);
    } catch (e) {
      toast(e instanceof ImportInvalideError ? e.message : 'Import impossible.');
      return;
    }
    if (mode === 'remplacer') {
      if (!window.confirm('Remplacer toutes les données actuelles par cette sauvegarde ?')) return;
      remplacerTout(incoming);
    } else {
      fusionner(incoming);
    }
    setTexteImport('');
    toast(`Import terminé — ${incoming.projets.length} projet(s).`);
  }

  function importerDepuisFichier(f: File | undefined) {
    if (!f) return;
    f.text()
      .then((t) => importer(t, 'remplacer'))
      .catch(() => toast('Lecture du fichier impossible.'));
  }

  return (
    <div className="grid2">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section className="card">
          <div className="card-h">
            <h3>Sauvegarde et export</h3>
          </div>
          <div className="card-b" style={{ display: 'grid', gap: 12 }}>
            <p style={{ color: 'var(--ink2)', maxWidth: '60ch' }}>
              Les données vivent dans ce navigateur. Exportez régulièrement : le fichier JSON
              contient l’intégralité des projets, jalons, tâches, journaux et extras, et se
              réimporte ici — c’est aussi la façon de passer d’un poste à l’autre.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => { exporterJSON(data); toast('Sauvegarde JSON générée.'); }}>
                Exporter en JSON
              </button>
              <button className="btn" onClick={() => exporterProjetsCSV(data)}>
                Exporter les projets (CSV)
              </button>
              <button className="btn" onClick={() => exporterJalonsCSV(data)}>
                Exporter les jalons (CSV)
              </button>
            </div>

            <div>
              <input
                type="file"
                accept="application/json,.json"
                ref={fichier}
                style={{ display: 'none' }}
                onChange={(e) => {
                  importerDepuisFichier(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <button className="btn" onClick={() => fichier.current?.click()}>
                Restaurer depuis un fichier…
              </button>
            </div>

            <div>
              <label className="fl">
                <span>Ou coller le contenu d’une sauvegarde</span>
                <textarea
                  className="ta"
                  rows={4}
                  value={texteImport}
                  placeholder="Collez ici le contenu d’un fichier de sauvegarde…"
                  onChange={(e) => setTexteImport(e.target.value)}
                />
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  className="btn"
                  disabled={!texteImport.trim()}
                  onClick={() => importer(texteImport, 'remplacer')}
                >
                  Remplacer les données
                </button>
                <button
                  className="btn"
                  disabled={!texteImport.trim()}
                  onClick={() => importer(texteImport, 'ajouter')}
                >
                  Ajouter aux projets existants
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-h">
            <h3>Processus standard</h3>
          </div>
          <div className="card-b">
            <p style={{ color: 'var(--ink2)', maxWidth: '60ch', marginBottom: 12 }}>
              Les 13 jalons ci-dessous structurent chaque projet. Le poids détermine la part de
              l’avancement global.
            </p>
            <div className="tw">
              <table className="t" style={{ minWidth: 420 }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Jalon</th>
                    <th>Étape</th>
                    <th>Équipe</th>
                    <th className="tar">Poids</th>
                  </tr>
                </thead>
                <tbody>
                  {JALONS.map((j) => (
                    <tr key={j.k}>
                      <td className="cellnum" style={{ color: 'var(--ink3)' }}>{j.n}</td>
                      <td>{j.nom}</td>
                      <td>{etapeNom(j.e)}</td>
                      <td className="sub">{j.eq}</td>
                      <td className="tar cellnum">{j.p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section className="card">
          <div className="card-h">
            <h3>État des données</h3>
          </div>
          <ul className="alist">
            <li>
              <div style={{ flex: 1 }}>Projets enregistrés</div>
              <span className="cellnum">{data.projets.length}</span>
            </li>
            <li>
              <div style={{ flex: 1 }}>Projets fermés ou terminés</div>
              <span className="cellnum">{fermes}</span>
            </li>
            <li>
              <div style={{ flex: 1 }}>Dernier enregistrement</div>
              <span className="mono-sm">{savedAt ? fmtDateTime(savedAt) : '—'}</span>
            </li>
            <li>
              <div style={{ flex: 1 }}>Stockage du navigateur</div>
              <span className={`pill ${stockage === 'ok' ? 'pill-accent' : 'pill-crit'}`}>
                {stockage === 'ok' ? 'Actif' : stockage === 'plein' ? 'Saturé' : 'Indisponible'}
              </span>
            </li>
          </ul>
        </section>

        <section className="card">
          <div className="card-h">
            <h3>Comment fonctionne la sauvegarde</h3>
          </div>
          <div className="card-b notice">
            <p>
              Chaque modification est écrite dans le navigateur une demi-seconde après votre
              dernière frappe : il n’y a pas de bouton « Enregistrer » à surveiller.
            </p>
            <p>
              Les données ne quittent jamais votre appareil. Un autre poste, un autre navigateur ou
              une navigation privée ne verront pas ces projets.
            </p>
            <p>
              Vider les données de site du navigateur efface tout : gardez un export JSON récent.
            </p>
          </div>
        </section>

        <section className="card">
          <div className="card-h">
            <h3>Affichage</h3>
          </div>
          <div className="card-b">
            <label className="fl" style={{ maxWidth: 240 }}>
              <span>Thème</span>
              <select
                className="sel"
                value={theme}
                onChange={(e) => onTheme(e.target.value as Theme)}
              >
                {THEMES.map((t) => (
                  <option value={t.k} key={t.k}>
                    {t.l}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="card">
          <div className="card-h">
            <h3>Zone sensible</h3>
          </div>
          <div className="card-b" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (!window.confirm('Effacer tous les projets ? Cette action est irréversible.')) return;
                reinitialiser();
                naviguer('#/dashboard');
                toast('Toutes les données ont été effacées.');
              }}
            >
              Effacer toutes les données
            </button>
            <button
              className="btn"
              onClick={() => {
                if (!window.confirm('Remplacer les données actuelles par les deux projets d’exemple ?')) return;
                chargerDemo();
                toast('Projets d’exemple rechargés.');
              }}
            >
              Recharger les exemples
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
