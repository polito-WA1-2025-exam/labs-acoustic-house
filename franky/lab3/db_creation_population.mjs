import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbFile = 'meme_game.sqlite';

async function setupDatabase() {
    const db = await open({
        filename: dbFile,
        driver: sqlite3.Database
    });

    // Creazione delle tabelle
    await db.exec(`
        CREATE TABLE IF NOT EXISTS captions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            path TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS image_captions (
            image_id INTEGER,
            caption_id INTEGER,
            FOREIGN KEY(image_id) REFERENCES images(id),
            FOREIGN KEY(caption_id) REFERENCES captions(id),
            PRIMARY KEY(image_id, caption_id)
        );
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY NOT NULL,
            personalBest INTEGER NOT NULL DEFAULT 0
        );
    `);

    // Popolazione delle didascalie
    const captions = [
        "Caption 1", "Caption 2", "Caption 3", "Caption 4", "Caption 5",
        "Caption 6", "Caption 7", "Caption 8", "Caption 9", "Caption 10"
    ];
    for (const text of captions) {
        await db.run(`INSERT OR IGNORE INTO captions (text) VALUES (?)`, [text]);
    }

    // Popolazione delle immagini
    const images = [
        { name: "Image 1", path: "path/to/image1.jpg" },
        { name: "Image 2", path: "path/to/image2.jpg" },
        { name: "Image 3", path: "path/to/image3.jpg" },
        { name: "Image 4", path: "path/to/image4.jpg" },
        { name: "Image 5", path: "path/to/image5.jpg" }
    ];
    for (const image of images) {
        await db.run(`INSERT OR IGNORE INTO images (name, path) VALUES (?, ?)`, [image.name, image.path]);
    }

    // Associare le didascalie alle immagini
    const imageCaptions = [
        { image: "Image 1", captions: ["Caption 1", "Caption 2"] },
        { image: "Image 2", captions: ["Caption 3", "Caption 4"] },
        { image: "Image 3", captions: ["Caption 5", "Caption 6"] },
        { image: "Image 4", captions: ["Caption 7", "Caption 8"] },
        { image: "Image 5", captions: ["Caption 9", "Caption 10"] }
    ];

    for (const pair of imageCaptions) {
        const imageRow = await db.get(`SELECT id FROM images WHERE name = ?`, [pair.image]);
        if (imageRow) {
            for (const captionText of pair.captions) {
                const captionRow = await db.get(`SELECT id FROM captions WHERE text = ?`, [captionText]);
                if (captionRow) {
                    await db.run(`INSERT OR IGNORE INTO image_captions (image_id, caption_id) VALUES (?, ?)`,
                        [imageRow.id, captionRow.id]);
                }
            }
        }
    }

    console.log("Database setup completed!");
    await db.close();
}

setupDatabase().catch(console.error);
