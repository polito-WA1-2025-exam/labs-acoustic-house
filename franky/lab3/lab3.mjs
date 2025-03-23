import readlineSync from 'readline-sync';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const ip_address = 'http://localhost:3000/';

class Caption {
    constructor(id, text) {
        this.id = id;
        this.text = text;
    }
}

class Image {
    constructor(id, name, path, suitableCaptions) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.suitableCaptions = suitableCaptions;
    }
}

class ImageContainer {
    constructor() {
        this.images = [];

        this.performQuery = async (image_id) => {

            const imageJson = await fetch(ip_address + "images/" + image_id)
                .then(response => response.json())
                .catch(error => console.error("Query problems", error));

            return new Image(
                imageJson.image_id,
                imageJson.name,
                imageJson.path,
                [
                    new Caption(imageJson.captions[0].caption_id, imageJson.captions[0].text),
                    new Caption(imageJson.captions[1].caption_id, imageJson.captions[1].text)
                ]
            );

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
}

async function retrieveCaption(capt_id) {

    const captionJson = await fetch(ip_address+"captions/"+capt_id)
        .then(response => response.json())
        .catch(error => console.error("Query problems", error));
    
    return new Caption(captionJson.id, captionJson.text);
}

class Meme {
    constructor(image, selectedCaption) {
        this.image = image;
        this.selectedCaption = selectedCaption;
        this.isCorrect = image.suitableCaptions.some(cptn => cptn.text === selectedCaption.text);
    }
}

class Score {
    constructor() {
        this.score = 0;
        this.incrementScore = function () {
            this.score += 5;
        };
    }
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
            user.updatePersonaBest(this.score);
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
        try {
            const response = await fetch(`${ip_address}updatePB/${this.name}/${this.personaBest}`, {
                method: "PUT",
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
    }
    
}

async function selectUser() {
    console.log("Welcome to the Meme Game!\n\n 0 - Create new user");

    const usersJson = await fetch(ip_address+"users")
        .then(response => response.json())
        .catch(error => console.error("Query problems", error));

    const users = usersJson.map(user => new User(user.username, user.personalBest));

    users.forEach((user, index) => console.log(` ${index + 1} - ${user.name} (Personal Best: ${user.personaBest})`));

    do {
        var selectedUser = readlineSync.questionInt("\nSelect user: ");
    }while(selectedUser < 0 || selectedUser > users.length);

    if (selectedUser === 0) {
        let username = readlineSync.question("Enter your username: ");
        let user = new User(username);

        try {
            const response = await fetch(ip_address+"adduser/"+username, {
                method: "PUT"
            })
            .then(response => response.json());

            if (response.status === 409) {
                console.log("Username already exists. Please select it from the list.");
                return await selectUser();
            }

            return user;
        } catch (error) {
            console.error("Database error:", error);
            return null;
        }
    } else {
        return users[selectedUser - 1];
    }
}

// main

(async () => {

    let user = await selectUser();

    var imageContainer = new ImageContainer();
    await imageContainer.populateImages();

    var game = new Game(imageContainer);
    await game.playGame(user);
})();