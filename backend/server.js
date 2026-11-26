// SalaGo API – wersja chmurowa (Express + PostgreSQL).
const express = require('express');
const { pool, init } = require('./database');

const app = express();
app.use(express.json());

const wSale = (s) => ({ ...s, wyposazenie: JSON.parse(s.wyposazenie), dostepna: Boolean(s.dostepna) });

function sprawdzSale(d) {
  if (!d || typeof d !== 'object') return 'Brak danych sali';
  if (typeof d.nazwa !== 'string' || !d.nazwa.trim()) return 'Nazwa sali jest wymagana';
  if (typeof d.budynek !== 'string' || !d.budynek.trim()) return 'Budynek jest wymagany';
  if (!Number.isInteger(d.pietro) || d.pietro < 0) return 'Niepoprawne piętro';
  if (!Number.isInteger(d.pojemnosc) || d.pojemnosc <= 0) return 'Niepoprawna pojemność';
  if (!Array.isArray(d.wyposazenie) || !d.wyposazenie.every((x) => typeof x === 'string')) return 'Niepoprawne wyposażenie';
  if (typeof d.dostepna !== 'boolean') return 'Niepoprawna dostępność';
  return null;
}

const wartosci = (d) => [d.nazwa.trim(), d.budynek.trim(), d.pietro, d.pojemnosc, JSON.stringify(d.wyposazenie), d.dostepna];
const obsluz = (fn) => (req, res) => fn(req, res).catch((e) => { console.error(e); res.status(500).json({ error: 'Błąd serwera' }); });

app.get('/api/health', obsluz(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', db: 'postgres' });
}));

app.get('/api/sale', obsluz(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM sale ORDER BY id');
  res.json(rows.map(wSale));
}));

app.get('/api/sale/:id', obsluz(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM sale WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Nie znaleziono sali' });
  res.json(wSale(rows[0]));
}));

app.post('/api/sale', obsluz(async (req, res) => {
  const blad = sprawdzSale(req.body);
  if (blad) return res.status(400).json({ error: blad });
  const { rows } = await pool.query(
    'INSERT INTO sale (nazwa, budynek, pietro, pojemnosc, wyposazenie, dostepna) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    wartosci(req.body));
  res.status(201).json(wSale(rows[0]));
}));

app.put('/api/sale/:id', obsluz(async (req, res) => {
  const blad = sprawdzSale(req.body);
  if (blad) return res.status(400).json({ error: blad });
  const { rows } = await pool.query(
    'UPDATE sale SET nazwa=$1, budynek=$2, pietro=$3, pojemnosc=$4, wyposazenie=$5, dostepna=$6 WHERE id=$7 RETURNING *',
    [...wartosci(req.body), req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Nie znaleziono sali' });
  res.json(wSale(rows[0]));
}));

app.delete('/api/sale/:id', obsluz(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM sale WHERE id = $1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'Nie znaleziono sali' });
  res.status(204).send();
}));

const PORT = process.env.PORT || 3000;
init()
  .then(() => app.listen(PORT, '0.0.0.0', () => console.log(`SalaGo API + PostgreSQL na porcie ${PORT}`)))
  .catch((e) => { console.error('Brak połączenia z bazą:', e.message); process.exit(1); });
