import sqlite from 'sqlite3';

let captionId = 0;
let memeId = 0;

let players = [];
let memes = [];
let captions = [];

let displayedMemes = [];

const db = new sqlite.Database('meme.sqlite', (err) => { if (err) console.log("DB problems", err) })


function Caption(captionId, caption) {
    this.id = captionId;
    this.caption = caption;

    Caption.getCaptionById = function (id) {
        return captions.find(caption => caption.id === id);
    };
}

function Meme(id, image, correctCaptions) {
    this.id = id;
    this.image = image;
    this.correctCaptions = correctCaptions;

    this.getBestCaptions = () => {// query DB and return an array of all answers to this question
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT * from correctCaption JOIN Meme on correctCaption.memeId = Meme.id
                JOIN Caption on correctCaption.captionId = Caption.id
                WHERE Meme.id = ?`

            db.all(sql, [this.id], (err, rows) => {
                if (err) {
                    throw err
                } else {
                    const result = []

                    for (const item of rows) {
                        result.push(item.id)
                    }

                    resolve(result)
                }
            })
        })
    }
}

function displayMeme() {
    var meme;
    do {
        meme = memes[Math.floor(Math.random() * memes.length)];
    } while (displayedMemes.includes(meme));

    var possibleAnswers = meme.correctCaptions;

    while (possibleAnswers.length < 7) {
        let randomCaption = captions[Math.floor(Math.random() * captions.length)];
        if (!possibleAnswers.includes(randomCaption)) {
            possibleAnswers.push(randomCaption);
        }
    }
    possibleAnswers = possibleAnswers.sort(() => Math.random() - 0.5);
    console.log(meme.image);
    console.log(possibleAnswers);

    displayedMemes.push(meme);
}

function Player(username) {
    this.username = username;
    this.score = 0;

    players.push[this];

    this.increaseScore = function () {
        this.score += 5;
    }
    
    this.endGame = function () {
        this.totalScore += this.score;
        this.score = 0;
    }

    this.newPlayer = () => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO Player (username, highscore) VALUES (?, 0)`;

            db.run(sql, [this.username], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, username: this.username, highscore: 0 });
                }
            }
            );
        });
    };

    this.deletePlayer = () => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM Player WHERE username = ?`;

            db.run(sql, [this.username], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, username: this.username });
                }
            }
            );
        });
    };

    this.setHighScore = () => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO Player (username, highscore) VALUES (?, ?)`;

            db.run(sql, [this.username, this.score], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, username: this.username, highscore: this.score });
                }
            });
        });
    };
}

function getMemes() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM Meme`;

        db.all(sql, [], async (err, rows) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const memes = [];
                    for (const row of rows) {
                        const meme = new Meme(row.id, row.image, []);
                        const bestCaptions = await meme.getBestCaptions();
                        meme.correctCaptions = bestCaptions;
                        memes.push(meme);
                    }
                    resolve(memes);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
};

function getCaptions() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM Caption`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const captions = [];
                for (const row of rows) {
                    const caption = new Caption(row.id, row.caption);
                    captions.push(caption);
                }
                resolve(captions);
            }
        });
    });
}

(async () => {
    memes = await getMemes();
    captions = await getCaptions();

    console.log(memes);
    console.log(captions);
})();