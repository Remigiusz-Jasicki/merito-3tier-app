
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Lokalizacja pliku bazy danych.
const sciezkaBazy = path.join(__dirname, 'salago.db');

// Sprawdzamy, czy baza już istnieje.
const nowaBaza = !fs.existsSync(sciezkaBazy);

// Otwieramy lub tworzymy bazę SQLite.
const db = new Database(sciezkaBazy);

// Tworzymy tabelę sal.
db.exec(`
  CREATE TABLE IF NOT EXISTS sale (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nazwa TEXT NOT NULL,
    budynek TEXT NOT NULL,
    pietro INTEGER NOT NULL,
    pojemnosc INTEGER NOT NULL,
    wyposazenie TEXT NOT NULL,
    dostepna INTEGER NOT NULL
  )
`);

// Przy pierwszym uruchomieniu dodajemy 8 sal testowych.
if (nowaBaza) {
  const saleStartowe = require('../frontend/src/data/sale.json');

  const dodaj = db.prepare(`
    INSERT INTO sale (
      id, nazwa, budynek, pietro,
      pojemnosc, wyposazenie, dostepna
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const zapiszSale = db.transaction((lista) => {
    for (const sala of lista) {
      dodaj.run(
        sala.id,
        sala.nazwa,
        sala.budynek,
        sala.pietro,
        sala.pojemnosc,
        JSON.stringify(sala.wyposazenie),
        sala.dostepna ? 1 : 0
      );
    }
  });

  zapiszSale(saleStartowe);

  console.log('Dodano 8 początkowych sal.');
}

console.log('Baza danych SalaGo jest gotowa.');

module.exports = db;
