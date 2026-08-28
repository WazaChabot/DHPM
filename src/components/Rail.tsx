/** Barre de navigation latérale (barre d'onglets en bas sur mobile). */
import { estOuvert } from '../domain/compute';
import { useStore } from '../store/AppStore';

const NAV = [
  { h: '#/dashboard', l: 'Tableau de bord', i: 'M3 12h5l2-6 3 12 2-6h6' },
  { h: '#/projets', l: 'Projets', i: 'M3 5h18M3 12h18M3 19h18' },
  { h: '#/jalons', l: 'Jalons', i: 'M5 3v18M5 4h11l-2 3 2 3H5' },
  { h: '#/reglages', l: 'Réglages', i: 'M12 8a4 4 0 100 8 4 4 0 000-8zM3 12h2m14 0h2M12 3v2m0 14v2' },
] as const;

function Ico({ d }: { d: string }) {
  return (
    <svg
      className="nav-ico"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export function Rail({
  active,
  onNouveauProjet,
}: {
  active: string;
  onNouveauProjet: () => void;
}) {
  const { data } = useStore();
  const ouverts = data.projets.filter(estOuvert).length;

  return (
    <nav className="rail">
      <div className="brand">
        <div className="brand-mark" />
        <div>
          <div className="brand-name">Division 08</div>
          <div className="brand-sub">DonloxHarmer</div>
        </div>
      </div>

      {NAV.map((n) => (
        <a
          className="nav-item"
          href={n.h}
          key={n.h}
          {...(active === n.h ? { 'aria-current': 'page' as const } : {})}
        >
          <Ico d={n.i} />
          <span>{n.l}</span>
          {n.h === '#/projets' && <span className="nav-count">{ouverts}</span>}
        </a>
      ))}

      <div className="rail-foot">
        <div className="rail-sep" />
        <button className="btn btn-primary" onClick={onNouveauProjet}>
          ＋ Nouveau projet
        </button>
      </div>
    </nav>
  );
}
