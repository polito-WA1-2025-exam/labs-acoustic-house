import sqlite3 from 'sqlite3'

class Meme {
    constructor(image, bestCaption1, bestCaption2) {
        this.id = Math.floor(Math.random() * 1000);
        this.image = image;
        this.bestCaption1 = bestCaption1;
        this.bestCaption2 = bestCaption2;
    }

    getMeme(){
        return this.image;
    }

}

class BestCaptions{
    constructor(memeId,text) {
        this.id = Math.floor(Math.random() * 1000);
        this.memeId = memeId;
        this.text = text;
    }

    getBestCaption(){
        return this.text;
    }

}

class Caption {
    constructor(text) {
        this.id = Math.floor(Math.random() * 1000);
        this.text = text;
    }

    getCaption(){
        return this.text;
    }

}

class Round {
    constructor(meme, captions=[]) {
        this.meme = meme;
        this.captions = captions;
        this.selectedCaption = null;
        this.score = 0; //5 punti per ogni risposta corretta
        this.id = Math.floor(Math.random() * 1000);
    }
}

class Game {
    constructor(playerInstance, roundIstance, totalScore) {
        this.id = Math.floor(Math.random() * 1000);
        this.player = playerInstance;
        this.rounds = roundIstance;
        this.totalScore = totalScore;
        this.roundsCount = playerInstance.isGuest ? 1 : 3; // 1 round per ospiti, 3 per registrati
    }

    addRound(round) {
        if (this.rounds.length >= this.roundsCount) {
            throw new Error("Numero massimo di round raggiunto.");
        }
        this.rounds=round;
    }

    calculateTotalScore() {
        this.totalScore = this.rounds.reduce((sum, round) => sum + round.score, 0);
    }
}

class Player {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.isGuest = email === null && password === null; //ospite
    }

    login(username, password) {
        if (this.isGuest) {
            throw new Error("Gli ospiti non possono effettuare il login.");
        }
        return this.username === username && this.password === password;
    }

    register(email, username, password) {
        if (!this.isGuest) {
            throw new Error("Il giocatore è già registrato.");
        }
        this.email = email;
        this.username = username;
        this.password = password;
        this.isGuest = false;
    }

    getUsername() {
        return this.username;
    }
}

class MemeCollection {
    constructor() {
        this.memes = [];
    }

    addMeme(meme) {
        this.memes.push(meme);
    }

    getRandomMeme(usedMemes) {
        const availableMemes = this.memes.filter(m => !usedMemes.includes(m.id));
        return availableMemes.length ? availableMemes[Math.floor(Math.random() * availableMemes.length)] : null;
    }
}

class BestCaptionsCollection {

    constructor() {
        this.bestCaptions = [];
    }

    addBestCaption(bestCaption) {
        this.bestCaptions.push(bestCaption);
    }

    getBestCaptionBymemeId(memeId) {
        return this.bestCaptions.filter(bc => bc.memeId === memeId);
    }

}

class CaptionCollection {
    constructor() {
        this.captions = [];
    }

    addCaption(caption) {
        this.captions.push(caption);
    }

    getRandomCaptions() {
        const captions = [];
        for (let i = 0; i < 3; i++) {
            captions.push(this.captions[Math.floor(Math.random() * this.captions.length)]);
        }
        return captions;
    }
}

class RoundCollection {
    constructor() {
        this.rounds = [];
    }

    addRound(round) {
        this.rounds.push(round);
    }

    getRoundById(id) {
        return this.rounds.find(round => round.id === id);
    }
}

class GameCollection {
    constructor() {
        this.games = [];
    }

    addGame(game) {
        this.games.push(game);
    }

    getGameById(id) {
        return this.games.find(game => game.id === id);
    }
}

class PlayerCollection {
    constructor() {
        this.players = [];
    }

    addPlayer(player) {
        this.players.push(player);
    }

    getPlayerByUsername(username) {
        return this.players.find(player => player.username === username);
    }
}

function startGame(playerInstance, memeCollection, captionCollection) {
    let game = new Game(playerInstance);
    let usedMemes = [];
    let roundsCount = playerInstance.isGuest ? 1 : 3;

    for (let i = 0; i < roundsCount; i++) {
        let meme = memeCollection.getRandomMeme(usedMemes);
        if (!meme) break;
        usedMemes.push(meme.id);
        let captions = captionCollection.getRandomCaptions(meme.bestCaptions);
        let round = new Round(meme, captions);
        game.addRound(round);
    }
    
    return game;
}

const memeCollection = new MemeCollection();
const captionCollection = new CaptionCollection();
const roundCollection = new RoundCollection();
const gameCollection = new GameCollection();
const playerCollection = new PlayerCollection();
const bestCaptionsCollection = new BestCaptionsCollection();


const db = new sqlite3.Database('memeGame.db', (err) => {
    if (err) {
        console.error('Errore nella connessione al database:', err.message);
    } else {
        console.log('Connesso al database SQLite.');
    }
});

function createTables() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Memes (
            id INTEGER PRIMARY KEY,
            image TEXT,
            bestCaptions TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS BestCaptions (
            id INTEGER PRIMARY KEY,
            memeId INTEGER,
            text TEXT
        )`);
    
        db.run(`CREATE TABLE IF NOT EXISTS Captions (
            id INTEGER PRIMARY KEY,
            text TEXT
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Players (
            username TEXT PRIMARY KEY,
            email TEXT,
            password TEXT
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Games (
            id INTEGER PRIMARY KEY,
            player TEXT,
            totalScore INTEGER
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Rounds (
            id INTEGER PRIMARY KEY,
            gameId INTEGER,
            memeId INTEGER,
            selectedCaptionId INTEGER,
            score INTEGER
        )`);

    });
}

function insertMeme(memeCollection) {
    const insertMemes = db.prepare(`INSERT INTO Memes (id,image, bestCaptions) VALUES (?,?, ?)`);
    memeCollection.memes.forEach(meme => {
        insertMemes.run(meme.id,meme.image, meme.bestCaptions);
    });
    insertMemes.finalize();
}

function insertBestCaption(bestCaptionCollection) {
    const insertBestCaption = db.prepare(`INSERT INTO BestCaptions (id, memeId, text) VALUES (?, ?, ?)`);
    bestCaptionCollection.bestCaptions.forEach(bestCaption => {
        insertBestCaption.run(bestCaption.id, bestCaption.memeId, bestCaption.text);
    });
    insertBestCaption.finalize();
}

function insertCaption(captionCollection) {
    const insertCaption = db.prepare(`INSERT INTO Captions (id, text) VALUES (?, ?)`);
    captionCollection.captions.forEach(caption => {
        insertCaption.run(caption.id, caption.text);
    });
    insertCaption.finalize();
}

function insertPlayer(playerCollection) {
    const insertPlayer = db.prepare(`INSERT INTO Players (username, email, password) VALUES (?, ?, ?)`);
    playerCollection.players.forEach(player => {
        insertPlayer.run(player.username, player.email, player.password);
    });
    insertPlayer.finalize();
}

function insertGame(gameCollection) {
    const insertGame = db.prepare(`INSERT INTO Games (id, player, totalScore) VALUES (?, ?, ?)`);
    gameCollection.games.forEach(game => {
        insertGame.run(game.id, game.player, game.totalScore);
    });
    insertGame.finalize();
}

function insertRound(roundCollection) {
    const insertRound = db.prepare(`INSERT INTO Rounds (id, gameId, memeId, selectedCaptionId, score) VALUES (?, ?, ?, ?, ?)`);
    roundCollection.rounds.forEach(round => {
        insertRound.run(round.id, round.gameId, round.memeId, round.selectedCaptionId, round.score);
    });
    insertRound.finalize();
}
/*
bestCaptionsCollection.addBestCaption(new BestCaptions("meme1.jpg", "fantastic"));
bestCaptionsCollection.addBestCaption(new BestCaptions("meme1.jpg", "wonderful"));
bestCaptionsCollection.addBestCaption(new BestCaptions("meme2.jpg", "emotional"));

const bc11= bestCaptionsCollection.getBestCaptionBymemeId("meme1.jpg")[0];
const bc22= bestCaptionsCollection.getBestCaptionBymemeId("meme1.jpg")[1];
const bc33= bestCaptionsCollection.getBestCaptionBymemeId("meme2.jpg")[0];
const bc44= bestCaptionsCollection.getBestCaptionBymemeId("meme2.jpg")[1];

const meme1 = new Meme("meme1.jpg", bc11, bc22);
const meme2 = new Meme("meme2.jpg", bc33, bc44);

memeCollection.addMeme(meme1);
memeCollection.addMeme(meme1);
memeCollection.addMeme(meme2);
memeCollection.addMeme(meme2);

captionCollection.addCaption(new Caption("caption"));
captionCollection.addCaption(new Caption("Random joke"));
captionCollection.addCaption(new Caption("Hilarious punchline"));

const player1 = new Player("lollegro", "eg@gmail.com", "fulmicotone");
const player2 = new Player("pippo", "eg@gmail.com", "torino");
const player3 = new Player("pluto", "exp@libero.it", "roma");

playerCollection.addPlayer(player1);
playerCollection.addPlayer(player2);
playerCollection.addPlayer(player3);

roundCollection.addRound(new Round(memeCollection.memes[0].getMeme(), captionCollection.getRandomCaptions()));
roundCollection.addRound(new Round(memeCollection.memes[1].getMeme(), captionCollection.getRandomCaptions()));

const game1 = new Game(player1.getUsername(), 3, 15);
const game2 = new Game(player2.getUsername(), 3, 5);
const game3 = new Game(player3.getUsername(), 3, 10);

game1.addRound(roundCollection.rounds[0]);
game2.addRound(roundCollection.rounds[1]);
game3.addRound(roundCollection.rounds[0]);

gameCollection.addGame(game1);
gameCollection.addGame(game2);
gameCollection.addGame(game3);
*/


function getAllMemes() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM Memes`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => ({
                    id: row.id,
                    image: row.image,
                    bestCaptions: row.bestCaptions
                })));
            }
        });
    });
}

function getBestCaptionBymemeId(memeId) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM BestCaptions WHERE memeId = ?`, [memeId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => ({
                    id: row.id,
                    memeId: row.memeId,
                    text: row.text
                })));
            }
        });
    });
}

function getCaptionsBySelectedString(specificString) {
    return new Promise((resolve, reject) => {
        const words = specificString.split(/\s+/).filter(word => word.length > 0);
        if (words.length === 0) {
            resolve([]);
            return;
        }
        const conditionSearch = words.map(() => "text LIKE ?").join(" OR ");
        const conditionValues = words.map(word => `%${word}%`);
        const sql = `SELECT * FROM Captions WHERE ${conditionSearch}`;
        db.all(sql, conditionValues, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => ({
                    id: row.id,
                    text: row.text
                })));
            }
        });
    });
}

function getTopPlayers() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT player, SUM(totalScore) AS score FROM Games GROUP BY player ORDER BY score DESC`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => ({
                    player: row.player,
                    score: row.score
                })));
            }
        });
    });
}

function getGamesByPlayer(player) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM Games WHERE player = ?`, [player], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => ({
                    id: row.id,
                    player: row.player,
                    totalScore: row.totalScore
                })));
            }
        });
    });
}

function getRoundByScore(score) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM Rounds WHERE score = ?`, [score], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => ({
                    id: row.id,
                    gameId: row.gameId,
                    memeId: row.memeId,
                    selectedCaptionId: row.selectedCaptionId,
                    score: row.score
                })));
            }
        });
    });
}

function flushDB() {
    db.serialize(() => {
        db.run(`DELETE FROM Memes`);
        db.run(`DELETE FROM BestCaptions`);
        db.run(`DELETE FROM Captions`);
        db.run(`DELETE FROM Players`);
        db.run(`DELETE FROM Games`);
        db.run(`DELETE FROM Rounds`);
    });
}

//flushDB();
createTables();
/*
insertMeme(memeCollection);
insertBestCaption(bestCaptionsCollection);
insertCaption(captionCollection);
insertPlayer(playerCollection);
insertGame(gameCollection);
insertRound(roundCollection);


console.log("Memes:", memeCollection.memes);
console.log("Best Captions:", bestCaptionsCollection.bestCaptions);
console.log("Captions:", captionCollection.captions);
console.log("Players:", playerCollection.players);
console.log("Games:", gameCollection.games);
console.log("Rounds:", roundCollection.rounds);
*/


// Test
/*
getAllMemes()
    .then(memes => console.log("All Memes:", memes))
    .catch(err => console.error(err));

getCaptionsBySelectedString("Hilarious caption")
    .then(captions => console.log("Captions containing 'Hilarious caption':", captions))
    .catch(err => console.error(err));

getTopPlayers()
    .then(players => console.log("Top Players:", players))
    .catch(err => console.error(err));

getGamesByPlayer("lollegro")
    .then(games => console.log("Games by player 'lollegro':", games))
    .catch(err => console.error(err));

getRoundByScore(5)
    .then(rounds => console.log("Rounds with score 5:", rounds))
    .catch(err => console.error(err));

getBestCaptionBymemeId("meme1.jpg")
    .then(bestCaptions => console.log("Best captions for meme1.jpg:", bestCaptions))
    .catch(err => console.error(err));
*/


