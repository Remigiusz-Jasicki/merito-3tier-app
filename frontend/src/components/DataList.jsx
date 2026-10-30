
import { useEffect, useState } from 'react';
import {
  pobierzSale,
  dodajSale,
  edytujSale,
  usunSale
} from '../services/api';

import SalaForm from './SalaForm';

export default function DataList() {
  const [sale, setSale] = useState([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [zapisywanie, setZapisywanie] = useState(false);
  const [blad, setBlad] = useState('');
  const [sukces, setSukces] = useState('');

  const [formularzOtwarty, setFormularzOtwarty] = useState(false);
  const [edytowanaSala, setEdytowanaSala] = useState(null);

  const [tylkoWolne, setTylkoWolne] = useState(false);
  const [minPojemnosc, setMinPojemnosc] = useState(0);

  async function odswiezSale() {
    const dane = await pobierzSale();
    setSale(dane);
  }

  useEffect(() => {
    odswiezSale()
      .catch(e => setBlad(e.message))
      .finally(() => setLadowanie(false));
  }, []);

  function dodawanie() {
    setEdytowanaSala(null);
    setBlad('');
    setSukces('');
    setFormularzOtwarty(true);
  }

  function edytowanie(sala) {
    setEdytowanaSala(sala);
    setBlad('');
    setSukces('');
    setFormularzOtwarty(true);
  }

  function anuluj() {
    setFormularzOtwarty(false);
    setEdytowanaSala(null);
    setBlad('');
  }

  async function zapisz(dane) {
    setZapisywanie(true);
    setBlad('');
    setSukces('');

    try {
      if (edytowanaSala) {
        await edytujSale(edytowanaSala.id, dane);
        setSukces('Sala została zaktualizowana!');
      } else {
        await dodajSale(dane);
        setSukces('Nowa sala została dodana!');
      }

      await odswiezSale();
      setFormularzOtwarty(false);
      setEdytowanaSala(null);
    } catch (e) {
      setBlad(e.message);
    } finally {
      setZapisywanie(false);
    }
  }

  async function usun(id) {
    if (!window.confirm('Czy na pewno chcesz usunąć tę salę?')) {
      return;
    }

    setZapisywanie(true);
    setBlad('');
    setSukces('');

    try {
      await usunSale(id);
      await odswiezSale();
      setSukces('Sala została usunięta!');
    } catch (e) {
      setBlad(e.message);
    } finally {
      setZapisywanie(false);
    }
  }

  const widoczne = sale.filter(
    s => (!tylkoWolne || s.dostepna) &&
         s.pojemnosc >= minPojemnosc
  );

  return (
    <section>
      <button
        onClick={dodawanie}
        disabled={zapisywanie}
      >
        + Dodaj salę
      </button>

      {blad && (
        <p role="alert" style={{ color: 'red' }}>
          {blad}
        </p>
      )}

      {sukces && (
        <p role="status" style={{ color: 'green' }}>
          {sukces}
        </p>
      )}

      {formularzOtwarty && (
        <SalaForm
          key={edytowanaSala?.id ?? 'nowa'}
          sala={edytowanaSala}
          onSave={zapisz}
          onCancel={anuluj}
          saving={zapisywanie}
        />
      )}

      <div className="filtry">
        <label>
          <input
            type="checkbox"
            checked={tylkoWolne}
            onChange={e => setTylkoWolne(e.target.checked)}
          />
          Tylko wolne sale
        </label>

        <label>
          Min. liczba miejsc:
          <select
            value={minPojemnosc}
            onChange={e => setMinPojemnosc(Number(e.target.value))}
          >
            <option value={0}>dowolna</option>
            <option value={20}>20+</option>
            <option value={50}>50+</option>
            <option value={100}>100+</option>
          </select>
        </label>

        <span className="licznik">
          Znaleziono: {widoczne.length}
        </span>
      </div>

      {ladowanie ? (
        <p className="info">Ładowanie sal...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Sala</th>
              <th>Budynek</th>
              <th>Piętro</th>
              <th>Miejsca</th>
              <th>Wyposażenie</th>
              <th>Status</th>
              <th>Akcje</th>
            </tr>
          </thead>

          <tbody>
            {widoczne.map(sala => (
              <tr key={sala.id}>
                <td><strong>{sala.nazwa}</strong></td>
                <td>{sala.budynek}</td>
                <td>{sala.pietro}</td>
                <td>{sala.pojemnosc}</td>
                <td>{sala.wyposazenie.join(', ')}</td>

                <td>
                  <span className={
                    sala.dostepna
                      ? 'status wolna'
                      : 'status zajeta'
                  }>
                    {sala.dostepna ? 'Wolna' : 'Zajęta'}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => edytowanie(sala)}
                    disabled={zapisywanie}
                  >
                    Edytuj
                  </button>

                  <button
                    onClick={() => usun(sala.id)}
                    disabled={zapisywanie}
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
