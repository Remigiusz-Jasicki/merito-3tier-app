import mockSale from '../data/sale.json';

// Adres API pochodzi ze zmiennej środowiskowej – brak adresów wpisanych na sztywno.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function pobierzSale() {
  if (USE_MOCK) {
    // Dane makietowe udające odpowiedź API
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockSale;
  }

  if (!API_BASE_URL) {
    throw new Error('Brak zmiennej VITE_API_BASE_URL – uzupełnij plik .env.local');
  }

  const odpowiedz = await fetch(`${API_BASE_URL}/sale`);
  if (!odpowiedz.ok) {
    throw new Error(`Błąd API: ${odpowiedz.status}`);
  }
  return odpowiedz.json();
}

export const trybDanych = USE_MOCK ? 'dane makietowe (JSON)' : `API: ${API_BASE_URL}`;

// Dodawanie nowej sali
export async function dodajSale(dane) {
  const odpowiedz = await fetch(`${API_BASE_URL}/sale`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dane)
  });

  if (!odpowiedz.ok) {
    const blad = await odpowiedz.json();
    throw new Error(blad.error || 'Nie udało się dodać sali');
  }

  return odpowiedz.json();
}

// Edytowanie istniejącej sali
export async function edytujSale(id, dane) {
  const odpowiedz = await fetch(`${API_BASE_URL}/sale/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dane)
  });

  if (!odpowiedz.ok) {
    const blad = await odpowiedz.json();
    throw new Error(blad.error || 'Nie udało się edytować sali');
  }

  return odpowiedz.json();
}

// Usuwanie sali
export async function usunSale(id) {
  const odpowiedz = await fetch(`${API_BASE_URL}/sale/${id}`, {
    method: 'DELETE'
  });

  if (!odpowiedz.ok) {
    throw new Error('Nie udało się usunąć sali');
  }

  return true;
}
