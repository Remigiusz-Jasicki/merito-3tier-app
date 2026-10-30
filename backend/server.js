
const express = require('express');
const db = require('./database');

const app = express();
app.use(express.json());

// Pozwalamy frontendowi komunikować się z API.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Zamiana rekordu z bazy na format API.
function przygotujSale(sala) {
  return {
    ...sala,
    wyposazenie: JSON.parse(sala.wyposazenie),
    dostepna: Boolean(sala.dostepna)
  };
}

// Walidacja danych.
function sprawdzSale(dane) {
  if (!dane || typeof dane !== 'object') {
    return 'Brak danych sali';
  }

  if (typeof dane.nazwa !== 'string' || !dane.nazwa.trim()) {
    return 'Nazwa sali jest wymagana';
  }

  if (typeof dane.budynek !== 'string' || !dane.budynek.trim()) {
    return 'Budynek jest wymagany';
  }

  if (!Number.isInteger(dane.pietro) || dane.pietro < 0) {
    return 'Niepoprawne piętro';
  }

  if (!Number.isInteger(dane.pojemnosc) || dane.pojemnosc <= 0) {
    return 'Niepoprawna pojemność';
  }

  if (!Array.isArray(dane.wyposazenie) ||
      !dane.wyposazenie.every(x => typeof x === 'string')) {
    return 'Niepoprawne wyposażenie';
  }

  if (typeof dane.dostepna !== 'boolean') {
    return 'Niepoprawna dostępność';
  }

  return null;
}

// READ - wszystkie sale.
app.get('/api/sale', (req, res) => {
  const sale = db.prepare('SELECT * FROM sale').all();
  res.status(200).json(sale.map(przygotujSale));
});

// READ - jedna sala.
app.get('/api/sale/:id', (req, res) => {
  const sala = db.prepare('SELECT * FROM sale WHERE id = ?')
    .get(req.params.id);

  if (!sala) {
    return res.status(404).json({ error: 'Nie znaleziono sali' });
  }

  res.status(200).json(przygotujSale(sala));
});

// CREATE - dodawanie sali.
app.post('/api/sale', (req, res) => {
  const blad = sprawdzSale(req.body);

  if (blad) {
    return res.status(400).json({ error: blad });
  }

  const dane = req.body;

  const wynik = db.prepare(`
    INSERT INTO sale (
      nazwa, budynek, pietro,
      pojemnosc, wyposazenie, dostepna
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    dane.nazwa.trim(),
    dane.budynek.trim(),
    dane.pietro,
    dane.pojemnosc,
    JSON.stringify(dane.wyposazenie),
    dane.dostepna ? 1 : 0
  );

  const nowaSala = db.prepare('SELECT * FROM sale WHERE id = ?')
    .get(wynik.lastInsertRowid);

  res.status(201).json(przygotujSale(nowaSala));
});

// UPDATE - edytowanie sali.
app.put('/api/sale/:id', (req, res) => {
  const blad = sprawdzSale(req.body);

  if (blad) {
    return res.status(400).json({ error: blad });
  }

  const dane = req.body;

  const wynik = db.prepare(`
    UPDATE sale
    SET nazwa = ?, budynek = ?, pietro = ?,
        pojemnosc = ?, wyposazenie = ?, dostepna = ?
    WHERE id = ?
  `).run(
    dane.nazwa.trim(),
    dane.budynek.trim(),
    dane.pietro,
    dane.pojemnosc,
    JSON.stringify(dane.wyposazenie),
    dane.dostepna ? 1 : 0,
    req.params.id
  );

  if (wynik.changes === 0) {
    return res.status(404).json({ error: 'Nie znaleziono sali' });
  }

  const sala = db.prepare('SELECT * FROM sale WHERE id = ?')
    .get(req.params.id);

  res.status(200).json(przygotujSale(sala));
});

// DELETE - usuwanie sali.
app.delete('/api/sale/:id', (req, res) => {
  const wynik = db.prepare('DELETE FROM sale WHERE id = ?')
    .run(req.params.id);

  if (wynik.changes === 0) {
    return res.status(404).json({ error: 'Nie znaleziono sali' });
  }

  res.status(204).send();
});

// Uruchomienie serwera.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`SalaGo API + SQLite działa na porcie ${PORT}`);
});
