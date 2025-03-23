import readlineSync from 'readline-sync';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


const db = new sqlite3.Database('meme_game.sqlite', (err) => {
    if (err) console.log("DB problems", err);
});

function Caption(id, text) {
    this.id = id;
    this.text = text;
}

function Image(id, name, path, suitableCaptions) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.suitableCaptions = suitableCaptions;
}

function ImageContainer() {
    this.images = [];

    this.performQuery = async (image_id) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT images.id AS image_id, images.name, images.path, captions.id AS caption_id, captions.text 
                FROM images
                JOIN image_captions ON images.id = image_captions.image_id
                JOIN captions ON image_captions.caption_id = captions.id
                WHERE images.id = ?`;

            db.all(query, [image_id], (err, rows) => {
                if (err) {
                    console.log("Query problems", err);
                    reject(err);
                } else if (rows.length === 0) {
                    resolve(null);
                } else {
                    const suitableCaptions = rows.map(row => new Caption(row.caption_id, row.text));
                    resolve(new Image(rows[0].image_id, rows[0].name, rows[0].path, suitableCaptions));
                }
            });
        });
    };

    this.populateImages = async function () {
        let images_ids = [];
        while (images_ids.length < 3) {
            let id = Math.floor(Math.random() * 5) + 1;
            if (!images_ids.includes(id)) {
                images_ids.push(id);
            }
        }
        this.images = await Promise.all(images_ids.map(id => this.performQuery(id)));
    };
}

async function retrieveCaption(capt_id) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM captions WHERE id = ?";
        db.get(query, [capt_id], (err, row) => {
            if (err) {
                console.log("Query problems", err);
                reject(err);
            } else {
                resolve(row ? new Caption(row.id, row.text) : null);
            }
        });
    });
}

function Meme(image, selectedCaption) {
    this.image = image;
    this.selectedCaption = selectedCaption;
    this.isCorrect = image.suitableCaptions.some(cptn => cptn.text === selectedCaption.text);
}

function Score() {
    this.score = 0;
    this.incrementScore = function () {
        this.score += 5;
    };
}

class Round {
    constructor(roundNumber, imageContainer) {
        this.roundNumber = roundNumber;
        this.imageContainer = imageContainer;
    }

    async playRound() {
        let image = this.imageContainer.images[this.roundNumber - 1];
        if (!image) {
            console.log("Error: Image not found for this round.");
            return null;
        }
        let possibleCaptions = [...image.suitableCaptions];

        while (possibleCaptions.length < 7) {
            let capt_id = Math.floor(Math.random() * 10) + 1;
            let capt = await retrieveCaption(capt_id);
            if (capt && !possibleCaptions.some(cptn => cptn.text === capt.text)) {
                possibleCaptions.push(capt);
            }
        }

        console.log("Image: " + image.name);
        console.log("Possible captions:");
        possibleCaptions.forEach((caption, index) => console.log(`${index} - ${caption.text}`));

        let selectedIndex = -1;
        while (selectedIndex < 0 || selectedIndex >= possibleCaptions.length) {
            selectedIndex = readlineSync.questionInt("Enter your selected caption index: ");
        }
        return new Meme(image, possibleCaptions[selectedIndex]);
    }
}


class Game {
    constructor(imageContainer) {
        this.imageContainer = imageContainer;
        this.memes = [];
        this.score = new Score();
    }

    async playGame(user) {
        console.log("\nHi "+user.name+"! Welcome to the Meme Game!\n");
        // rounds
        for (let i = 0; i < 3; i++) {
            console.log("\n~~~~~~~~ Round " + (i + 1) + "/3 ~~~~~~~~");
            let round = new Round(i + 1, this.imageContainer);
            let meme = await round.playRound();
            if (meme && meme.isCorrect) {
                this.score.incrementScore();
            }
            if (meme) this.memes.push(meme);
        }
        // end game
        if(this.score.score > user.personaBest) {
            await user.updatePersonaBest(this.score);
            console.log("\nGame Over! New personal best: " + this.score.score+"!!!");
        }else{
            console.log("\nGame Over! Your score is: " + this.score.score);
        }
    }
}

class User {
    constructor(name, personaBest = 0) {
        this.name = name;
        this.personaBest = personaBest;
    }

    async updatePersonaBest(score) {
        this.personaBest = score.score;
        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE users SET personalBest = ? WHERE username = ?", 
                [this.personaBest, this.name], 
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }
}

// main

async function selectUser() {
    console.log("Welcome to the Meme Game!\n\n 0 - Create new user");
    const query = "SELECT * FROM users";
    const users = await new Promise((resolve, reject) => {
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.log("Query problems", err);
                reject(err);
            } else {
                let i = 1;
                let users = [];
                rows.forEach(row => {
                    console.log(` ${i} - ${row.username} - PB: ${row.personalBest}`);
                    users.push(new User(row.username, row.personalBest));
                    i++;
                });
                resolve(users);
            }
        });

    });;

    do {
        var selectedUser = readlineSync.questionInt("\nSelect user: ");
    }while(selectedUser < 0 || selectedUser > users.length);

    if (selectedUser === 0) {
        let username = readlineSync.question("Enter your username: ");
        let user = new User(username);
        await db.run("INSERT INTO users (username) VALUES (?)", [username]);
        return user;
    } else {
        return users[selectedUser - 1];
    }
}

(async () => {

    let user = await selectUser();

    var imageContainer = new ImageContainer();
    await imageContainer.populateImages();

    var game = new Game(imageContainer);
    await game.playGame(user);
})();
