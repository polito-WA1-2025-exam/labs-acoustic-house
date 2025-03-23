import sqlite3 from 'sqlite3'
import express from 'express'


const app = express();
app.use(express.json());

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/memes', (req, res) => {
    getAllMemes()
        .then(memes => res.json(memes))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/Rounds/:score', (req, res) => {
    const score = parseInt(req.params.score);
    if (isNaN(score)) {
        return res.status(400).json({ error: "Score must be a number" });
    }

    const query = `SELECT * FROM Rounds WHERE score > ?`;
    
    db.all(query, [score], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            console.log("TEST");
            console.log("Score:",rows); 
            res.json(rows);  
        }
    });
});

app.post('/Players', (req, res) => {
    const { name, score } = req.body;
    if (!name || !score) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `INSERT INTO Players (name, score) VALUES (?, ?)`;
    db.run(query, [name, score], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, score });
    });
});

app.put('/Captions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const { caption } = req.body;
    if (!caption) return res.status(400).json({ error: "Missing required fields" });

    const query = `UPDATE Captions SET caption = ? WHERE id = ?`;
    db.run(query, [caption, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Caption not found" });
        res.json({ message: "Caption updated" });
    });
});

app.patch('/BestCaptions/id', (req, res) => {
    const { caption } = req.body;
    if (!caption) return res.status(400).json({ error: "Missing required fields" });

    const query = `UPDATE BestCaptions SET caption = ?`;
    db.run(query, [caption], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Caption updated" });
    });
});

app.delete('/Captions/:id', (req, res) => { 
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const query = `DELETE FROM Captions WHERE id = ?`;
    db.run(query, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Caption not found" });
        res.json({ message: "Caption deleted" });
    });
});

