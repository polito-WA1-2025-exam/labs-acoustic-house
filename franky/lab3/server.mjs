
import express from 'express'
import morgan from 'morgan';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express() ;
app.use(express.json())
app.use(morgan('dev'))

// Open SQLite database with async/await support
let db;
(async () => {
    db = await open({
        filename: 'meme_game.sqlite',
        driver: sqlite3.Database
    });
    console.log("Database connected");
})();

// Define routes and web pages
app.get('/', (req, res) =>	res.send('Hello World!')) ;


app.get('/users', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).send("Database not initialized yet. Try again later.");
        }
        const users = await db.all('SELECT * FROM users');
        res.json(users);
    } catch (error) {
        console.error("Query problems:", error);
        res.status(500).send("Database query error");
    }
});

app.get('/captions/:id', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).send("Database not initialized yet. Try again later.");
        }
        const caption = await db.get('SELECT * FROM captions WHERE id = ?', [req.params.id]);
        res.json(caption);
    } catch (error) {
        console.error("Query problems:", error);
        res.status(500).send("Database query error");
    }
});

app.get('/images/:id', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).send("Database not initialized yet. Try again later.");
        }
        const query = `
                SELECT images.id AS image_id, images.name, images.path, captions.id AS caption_id, captions.text 
                FROM images
                JOIN image_captions ON images.id = image_captions.image_id
                JOIN captions ON image_captions.caption_id = captions.id
                WHERE images.id = ?`;

        const rows = await db.all(query, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Image not found" });
        }

        const meme = {
            image_id: rows[0].image_id,
            name: rows[0].name,
            path: rows[0].path,
            captions: rows.map(row => ({
                caption_id: row.caption_id,
                text: row.text
            }))
        };

        res.json(meme);
        
    } catch (error) {
        console.error("Query problems:", error);
        res.status(500).send("Database query error");
    }
});


app.put('/updatePB/:username/:personalBest', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).send("Database not initialized yet. Try again later.");
        }

        const username = req.params.username;
        const personalBest = parseInt(req.params.personalBest);

        await db.run("UPDATE users SET personalBest = ? WHERE username = ?", [personalBest, username]);

        return res.status(200).json({ message: "Personal best updated successfully!" });

    } catch (error) {
        console.error("Database update error:", error);
        return res.status(500).json({ error: "Failed to update personal best." });
    }
});

app.put('/adduser/:username', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).send("Database not initialized yet. Try again later.");
        }

        const username = req.params.username;
        const userAlreadyExist = await db.get("SELECT * FROM users WHERE username = ?", [username]);

        if (userAlreadyExist) {
            return res.status(409).json({ error: "User already exists" });
        }

        await db.run("INSERT INTO users (username) VALUES (?)", [username]);

        return res.status(200).json({ message: "User created successfully" });

    } catch (error) {
        console.error("Database update error:", error);
        return res.status(500).json({ error: "Failed to create user" });
    }
});

// Activate server
app.listen(3000, () => console.log('Server ready'));
