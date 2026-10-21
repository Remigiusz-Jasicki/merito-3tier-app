import { useEffect, useState } from 'react';
import { pobierzSale } from '../services/api';

export default function DataList() {
  const [sale, setSale] = useState([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [blad, setBlad] = useState(null);
  const [tylkoWolne, setTylkoWolne] = useState(false);
  const [minPojemnosc, setMinPojemnosc] = useState(0);

  useEffect(() => {
    pobierzSale()
      .then(setSale)
      .catch((e) => setBlad(e.message))
      .finally(() => setLadowanie(false));
  }, []);

  if (ladowanie) return <p className="info">Ładowanie sal…</p>;
  if (blad) return <p className="info blad">{blad}</p>;

  const widoczne = sale.filter(
    (s) => (!tylkoWolne || s.dostepna) && s.pojemnosc >= minPojemnosc
  );

  return (
    <section>
      <div className="filtry">
        <label>
          <input
            type="checkbox"
            checked={tylkoWolne}
            onChange={(e) => setTylkoWolne(e.target.checked)}
          />
          Tylko wolne sale
        </label>
        <label>
          Min. liczba miejsc:
          <select value={minPojemnosc} onChange={(e) => setMinPojemnosc(Number(e.target.value))}>
            <option value={0}>dowolna</option>
            <option value={20}>20+</option>
            <option value={50}>50+</option>
            <option value={100}>100+</option>
          </select>
        </label>
        <span className="licznik">Znaleziono: {widoczne.length}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sala</th>
            <th>Budynek</th>
            <th>Piętro</th>
            <th>Miejsca</th>
            <th>Wyposażenie</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {widoczne.map((sala) => (
            <tr key={sala.id}>
              <td><strong>{sala.nazwa}</strong></td>
              <td>{sala.budynek}</td>
              <td>{sala.pietro}</td>
              <td>{sala.pojemnosc}</td>
              <td>{sala.wyposazenie.join(', ')}</td>
              <td>
                <span className={sala.dostepna ? 'status wolna' : 'status zajeta'}>
                  {sala.dostepna ? 'Wolna' : 'Zajęta'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}