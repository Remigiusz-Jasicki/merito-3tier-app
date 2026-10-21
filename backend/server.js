const express = require('express');
const app = express();
app.use(express.json());

// Baza danych w pamięci (symulacja)
let products = [{ id: 1, name: "Produkt testowy" }];

// GET: Pobranie listy (Status 200)
app.get('/api/products', (req, res) => {
    res.status(200).json(products);
});

// POST: Utworzenie nowego zasobu z walidacją (Status 201 lub 400)
app.post('/api/products', (req, res) => {
    const { name } = req.body;

    // E3: Walidacja danych - sprawdzenie czy nazwa istnieje
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: "Niepoprawne dane: pole 'name' jest wymagane i musi być tekstem." });
    }

    const newProduct = { id: products.length + 1, name };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
