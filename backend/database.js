// Połączenie z bazą PostgreSQL w prywatnej podsieci (warstwa Data).
const { Pool } = require('pg');
const saleStartowe = require('../frontend/src/data/sale.json');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sale (
      id SERIAL PRIMARY KEY,
      nazwa TEXT NOT NULL,
      budynek TEXT NOT NULL,
      pietro INTEGER NOT NULL,
      pojemnosc INTEGER NOT NULL,
      wyposazenie TEXT NOT NULL,
      dostepna BOOLEAN NOT NULL
    )`);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM sale');
  if (rows[0].n === 0) {
    for (const s of saleStartowe) {
      await pool.query(
        'INSERT INTO sale (nazwa, budynek, pietro, pojemnosc, wyposazenie, dostepna) VALUES ($1,$2,$3,$4,$5,$6)',
        [s.nazwa, s.budynek, s.pietro, s.pojemnosc, JSON.stringify(s.wyposazenie), s.dostepna]
      );
    }
    console.log('Dodano początkowe sale.');
  }
  console.log('Baza danych PostgreSQL SalaGo jest gotowa.');
}

module.exports = { pool, init };
