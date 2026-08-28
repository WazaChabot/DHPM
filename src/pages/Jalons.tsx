/** Vue transversale : où se concentrent la charge et les retards, tous projets confondus. */
import { JALONS, etapeNom } from '../domain/process';
import { estOuvert, jalonEnRetard } from '../domain/compute';
import { useStore } from '../store/AppStore';

export function Jalons() {
  const { data } = useStore();
  const ouverts = data.projets.filter(estOuvert);

  const rows = JALONS.map((j) => {
    let enCours = 0;
    let complets = 0;
    let retard = 0;
    let na = 0;
    for (const p of ouverts) {
      const js = p.jalons[j.k];
      if (!js) continue;
      if (js.s === 'na') { na++; continue; }
      if (js.s === 'complete') { complets++; continue; }
      if (js.s !== 'todo') enCours++;
      if (jalonEnRetard(js)) retard++;
    }
    return { j, enCours, complets, retard, actifs: ouverts.length - na };
  });

  return (
    <>
      <p style={{ color: 'var(--ink2)', maxWidth: '62ch', marginBottom: 16 }}>
        Vue transversale du processus standard : où se concentre la charge et où s’accumulent les
        retards, sur les {ouverts.length} projets ouverts.
      </p>
      <div className="tw">
        <table className="t">
          <thead>
            <tr>
              <th style={{ width: 44 }}>#</th>
              <th>Jalon</th>
              <th>Étape</th>
              <th className="tar">Poids</th>
              <th className="tar">En cours</th>
              <th className="tar">Complétés</th>
              <th className="tar">En retard</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ j, enCours, complets, retard, actifs }) => (
              <tr key={j.k}>
                <td className="cellnum" style={{ color: 'var(--ink3)' }}>{j.n}</td>
                <td>
                  <strong>{j.nom}</strong>
                  <div className="sub">{j.eq}</div>
                </td>
                <td>{etapeNom(j.e)}</td>
                <td className="tar cellnum">{j.p}</td>
                <td className="tar cellnum">{enCours}</td>
                <td className="tar cellnum">
                  {complets} / {actifs}
                </td>
                <td className="tar">
                  {retard ? (
                    <span className="pill pill-crit">{retard}</span>
                  ) : (
                    <span className="cellnum" style={{ color: 'var(--ink3)' }}>0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
