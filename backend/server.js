const express = require('express');
const app = express();
app.use(express.json());

// Przykładowy endpoint GET (CRUD)
app.get('/api/products', (req, res) => {
    res.status(200).json([{ id: 1, name: "Produkt testowy" }]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
