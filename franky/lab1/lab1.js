const readlineSync = require('readline-sync');

// image
// caption
// meme
// score
// game
// round


function Caption(text){
    this.text = text;
}

function CaptionContainer(){
    this.captions = [];

    this.addCaption = function(caption){
        if(caption instanceof Caption && !this.captions.some(function(cptn){return cptn.text === caption.text;})){
            this.captions.push(caption);
        }
    }

    this.getRandomCaption = function(){
        var index = Math.floor(Math.random() * this.captions.length);   // floor funtc rounds the double argument to the nearest integer less than or equal to a given number
        return this.captions[index];
    }
}

function Image(name, path, suitableCaptions){
    this.name = name;
    this.path = path;
    this.suitableCaptions = suitableCaptions;
}

function ImageContainer(){
    this.images = [];

    this.addImage = function(image){
        if(image instanceof Image && !this.images.some(function(img){return img.name === image.name;})){    // chech whether the image is an instance of Image and whether the image is already in the images array
            this.images.push(image);
        }
    }

    this.getRandomImage = function(){
        var index = Math.floor(Math.random() * this.images.length);
        return this.images[index];
    }

}

function Meme(image, selectedCaption){
    this.image = image;
    this.selectedCaption = selectedCaption;
    this.isCorrect = image.suitableCaptions.some(function(cptn){return cptn.text === selectedCaption.text;});
}

function Score(){
    this.score = 0;

    this.incrementScore = function(){
        this.score += 5;
    }

}

function Round(roundNumber){
    this.roundNumber = roundNumber;

    this.playRound = function(){

        var imageContainer = new ImageContainer();
        var captionContainer = new CaptionContainer();

        // Populate captions
        var captions = [
            new Caption("Caption 1"), new Caption("Caption 2"), new Caption("Caption 3"),
            new Caption("Caption 4"), new Caption("Caption 5"), new Caption("Caption 6"),
            new Caption("Caption 7"), new Caption("Caption 8"), new Caption("Caption 9"),
            new Caption("Caption 10")
        ];
        captionContainer.captions.push(...captions);
        
        // Populate images with captions
        var images = [
            new Image("Image 1", "path/to/image1.jpg", [captions[0], captions[1]]),
            new Image("Image 2", "path/to/image2.jpg", [captions[2], captions[3]]),
            new Image("Image 3", "path/to/image3.jpg", [captions[4], captions[5]]),
            new Image("Image 4", "path/to/image4.jpg", [captions[6], captions[7]]),
            new Image("Image 5", "path/to/image5.jpg", [captions[8], captions[9]])
        ];
        imageContainer.images.push(...images);


        var image = imageContainer.getRandomImage();
        var possibleCaptions = image.suitableCaptions.slice();
        
        while (possibleCaptions.length < 7){
            capt = captionContainer.getRandomCaption();
            if(capt !== undefined && !possibleCaptions.some(function(cptn){return cptn.text === capt.text;})){
                possibleCaptions.push(capt);
            }
        }

        // show image and possible captions to the user
        console.log("Image: " + image.name);
        console.log("Possible captions: ");
        for(var i = 0; i < possibleCaptions.length; i++){
            console.log(i + " - " + possibleCaptions[i].text);
        }

        // get user's selected caption
        var selectedIndex = -1;
        while(selectedIndex < 0 || selectedIndex >= possibleCaptions.length){
            selectedIndex = readlineSync.questionInt("Enter your selected caption index: ");
        }
        var selectedCaption = possibleCaptions[selectedIndex];

        return new Meme(image, selectedCaption);

    }
}

function Game(){
    this.memes = [];
    this.score = new Score();

    this.playGame = function(){

        for(var i = 0; i < 3; i++){
            var round = new Round(i + 1);
            console.log("------ Round " + (i + 1)+"/3 ------");
            var meme = round.playRound();
            if(meme.isCorrect){
                this.score.incrementScore();
            }
            this.memes.push(meme);
        }

        console.log("Game Over! Your score is: " + this.score.score);
    }
}


var game = new Game();
game.playGame();
