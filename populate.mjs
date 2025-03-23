import sqlite from 'sqlite3'

const db = new sqlite.Database('meme.sqlite', (err) => { if (err) console.log("DB problems", err) })

const drop = 'DROP TABLE IF EXISTS Player; DROP TABLE IF EXISTS Meme; DROP TABLE IF EXISTS Caption; DROP TABLE IF EXISTS correctCaption;'

const create = 'CREATE TABLE Player (username TEXT PRIMARY KEY, highscore INTEGER); CREATE TABLE Meme (id INTEGER PRIMARY KEY, image TEXT, correctCaptions INTEGER); CREATE TABLE Caption (id INTEGER PRIMARY KEY, caption TEXT); CREATE TABLE correctCaption(memeId INTEGER, captionId INTEGER);'

// `SELECT * from user where id=${userId}` /// NOOOOOOOO

const populateMemes = 'INSERT INTO Meme (id, image, correctCaptions) VALUES (1, "meme1.jpg", 1), (2, "meme2.jpg", 2), (3, "meme3.jpg", 3), (4, "meme4.jpg", 4);'
const populateCaptions = 'INSERT INTO Caption (id, caption) VALUES (1, "caption1"), (2, "caption2"), (3, "caption3"), (4, "caption4");'
const populateCorrectCaption = 'INSERT INTO correctCaption (memeId, captionId) VALUES (1, 1), (1, 2), (2, 1), (2, 2), (3, 3), (3, 1), (4, 2), (4, 4);'

db.exec(drop, (err) => {
    if (err) {
        console.log("Error deleting tables:", err);
    } else {
        console.log("TABLES DELETED");

        db.exec(create, (err) => {
            if (err) {
                console.log("Error creating tables:", err);
            } else {
                console.log("TABLES CREATED");
                        db.exec(populateMemes, (err) => {
                            if (err) {
                                console.log("Error populating memes:", err);
                            } else {
                                console.log("MEMES POPULATED");

                                db.exec(populateCaptions, (err) => {
                                    if (err) {
                                        console.log("Error populating captions:", err);
                                    } else {
                                        console.log("CAPTIONS POPULATED");

                                        db.exec(populateCorrectCaption, (err) => {
                                            if (err) {
                                                console.log("Error populating correct captions:", err);
                                            } else {
                                                console.log("CORRECT CAPTIONS POPULATED");
                                            }
                                        });
                                    }
                                });
                            }
                        });
            }
        });
    }
});
