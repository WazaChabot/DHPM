/** Coquille de l'application : navigation, en-tête et aiguillage des pages. */
import { useState, type ReactNode } from 'react';
import { Rail } from './components/Rail';
import { NouveauProjetModal } from './components/NouveauProjetModal';
import { Dashboard } from './pages/Dashboard';
import { Jalons } from './pages/Jalons';
import { Projets } from './pages/Projets';
import { Reglages } from './pages/Reglages';
import { ProjetPage } from './pages/projet/ProjetPage';
import { useStore } from './store/AppStore';
import { useRoute } from './store/router';
import { useTheme } from './store/theme';
import { fmtDateTime } from './domain/format';

export default function App() {
  const route = useRoute();
  const { data, savedAt, enregistrementEnCours, stockage } = useStore();
  const [theme, setTheme] = useTheme();
  const [nouveau, setNouveau] = useState(false);

  const page = route[0] ?? 'dashboard';
  let titre: ReactNode = 'Tableau de bord';
  let navActive = '#/dashboard';
  let contenu: ReactNode;

  if (page === 'projets') {
    titre = 'Projets';
    navActive = '#/projets';
    contenu = <Projets />;
  } else if (page === 'jalons') {
    titre = 'Jalons';
    navActive = '#/jalons';
    contenu = <Jalons />;
  } else if (page === 'reglages') {
    titre = 'Réglages';
    navActive = '#/reglages';
    contenu = <Reglages theme={theme} onTheme={setTheme} />;
  } else if (page === 'projet') {
    navActive = '#/projets';
    const id = route[1] ?? '';
    const projet = data.projets.find((p) => p.id === id);
    titre = (
      <>
        <a href="#/projets" className="crumb">Projets</a>
        <span className="crumb-sep">/</span>
        {projet ? projet.numero || projet.nom || 'Sans nom' : 'Projet introuvable'}
      </>
    );
    contenu = <ProjetPage id={id} onglet={route[2] ?? 'jalons'} />;
  } else {
    contenu = <Dashboard />;
  }

  return (
    <div className="app">
      <Rail active={navActive} onNouveauProjet={() => setNouveau(true)} />
      <div className="main">
        <header className="topbar">
          <h1>{titre}</h1>
          <div className="topbar-spacer" />
          <button className="btn btn-nouveau" onClick={() => setNouveau(true)}>
            ＋ Nouveau projet
          </button>
          <span className="savemsg">
            {stockage !== 'ok'
              ? 'Stockage local indisponible — exportez vos données'
              : enregistrementEnCours
                ? 'Enregistrement…'
                : savedAt
                  ? `Enregistré ${fmtDateTime(savedAt)}`
                  : 'Enregistrement automatique actif'}
          </span>
        </header>
        <div className="page">{contenu}</div>
      </div>
      {nouveau && <NouveauProjetModal onClose={() => setNouveau(false)} />}
    </div>
  );
}
