
import { useState } from 'react';

const pustyFormularz = {
  nazwa: '',
  budynek: '',
  pietro: 0,
  pojemnosc: 1,
  wyposazenie: [],
  dostepna: true
};

export default function SalaForm({ sala, onSave, onCancel, saving }) {
  const [formularz, setFormularz] = useState(
    sala ? { ...sala } : { ...pustyFormularz }
  );

  const [blad, setBlad] = useState('');

  // Przechowujemy wyposażenie jako tekst podczas wpisywania.
  const [wyposazenieTekst, setWyposazenieTekst] = useState(
    (sala?.wyposazenie || []).join(', ')
  );

  // Obsługa zmian w formularzu.
  function zmienPole(event) {
    const { name, value, type, checked } = event.target;

    let nowaWartosc = value;

    if (type === 'checkbox') {
      nowaWartosc = checked;
    }

    if (type === 'number') {
      nowaWartosc = value === '' ? '' : Number(value);
    }

    setFormularz({
      ...formularz,
      [name]: nowaWartosc
    });
  }

  // Walidacja i zapisywanie formularza.
  async function zapisz(event) {
    event.preventDefault();
    setBlad('');

    if (!formularz.nazwa.trim()) {
      setBlad('Podaj nazwę sali');
      return;
    }

    if (!formularz.budynek.trim()) {
      setBlad('Podaj budynek');
      return;
    }

    if (
      !Number.isInteger(formularz.pietro) ||
      formularz.pietro < 0
    ) {
      setBlad('Piętro musi być liczbą całkowitą nieujemną');
      return;
    }

    if (
      !Number.isInteger(formularz.pojemnosc) ||
      formularz.pojemnosc <= 0
    ) {
      setBlad('Pojemność musi być dodatnią liczbą całkowitą');
      return;
    }

    // Zamieniamy tekst wyposażenia na tablicę dopiero przy zapisie.
    const daneDoZapisu = {
      ...formularz,
      wyposazenie: wyposazenieTekst
        .split(',')
        .map(x => x.trim())
        .filter(Boolean)
    };

    await onSave(daneDoZapisu);
  }

  return (
    <form onSubmit={zapisz}>
      <h2>{sala ? 'Edytuj salę' : 'Dodaj nową salę'}</h2>

      <label>
        Nazwa sali:
        <input
          type="text"
          name="nazwa"
          value={formularz.nazwa}
          onChange={zmienPole}
          required
          maxLength={50}
        />
      </label>

      <label>
        Budynek:
        <input
          type="text"
          name="budynek"
          value={formularz.budynek}
          onChange={zmienPole}
          required
          maxLength={20}
        />
      </label>

      <label>
        Piętro:
        <input
          type="number"
          name="pietro"
          value={formularz.pietro}
          onChange={zmienPole}
          min="0"
          step="1"
          required
        />
      </label>

      <label>
        Liczba miejsc:
        <input
          type="number"
          name="pojemnosc"
          value={formularz.pojemnosc}
          onChange={zmienPole}
          min="1"
          step="1"
          required
        />
      </label>

      <label>
        Wyposażenie (oddziel przecinkami):
        <input
          type="text"
          value={wyposazenieTekst}
          onChange={(event) =>
            setWyposazenieTekst(event.target.value)
          }
          placeholder="np. rzutnik, komputery, tablica"
        />
      </label>

      <label>
        <input
          type="checkbox"
          name="dostepna"
          checked={formularz.dostepna}
          onChange={zmienPole}
        />
        Sala dostępna
      </label>

      {blad && (
        <p role="alert" style={{ color: 'red' }}>
          {blad}
        </p>
      )}

      <div>
        <button type="submit" disabled={saving}>
          {saving ? 'Zapisywanie...' : 'Zapisz salę'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}
