import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./styles/text.scss";
import "./styles/gamePage.scss";
import ImageContainer from "./utils/ImageContainer";
import ListTile from "./utils/ListTile";
import { Caption } from "./models/Caption.mjs";

const GamePage = ({ images }) => {
  const ip_address = "http://localhost:3000/";
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const [score, setScore] = useState(0);
  const [captions, setCaptions] = useState([]);
  const [round, setRound] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  async function retrieveCaption(capt_id) {
    const captionJson = await fetch(ip_address + "captions/" + capt_id)
      .then((response) => response.json())
      .catch((error) => console.error("Query problems", error));

    return new Caption(captionJson.id, captionJson.text);
  }

  function showCorrectAnswers(index) {
    const correctCaptions = images[round - 1].suitableCaptions.map(
      (caption) => caption.id
    );

    const selectedCaptionId = captions[index].id;
    const correct = correctCaptions.includes(selectedCaptionId);

    setSelectedIndex(index);
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 5);
    }

    const updatedScore = score + (correct ? 5 : 0);

    setTimeout(() => {
      if (round === 3) {
        navigate("/gameover", {
          state: { user: user, score: updatedScore },
        });
      } else {
        setSelectedIndex(null);
        setIsCorrect(null);
        setRound((prev) => prev + 1);
      }
    }, 1000); // 1 second delay
  }

  useEffect(() => {
    setCaptions([]); // Reset captions while loading new ones

    const loadCaptions = async () => {
      let possibleCaptions = [...images[round - 1].suitableCaptions];

      while (possibleCaptions.length < 7) {
        let id = Math.floor(Math.random() * 14);
        let currIds = possibleCaptions.map((caption) => caption.id);
        if (!currIds.includes(id)) {
          const newCaption = await retrieveCaption(id);
          if (newCaption) {
            possibleCaptions.push(newCaption);
          }
        }
      }
      // Optional: shuffle captions
      possibleCaptions.sort(() => 0.5 - Math.random());

      setCaptions(possibleCaptions);
    };

    if (images[round - 1]) {
      loadCaptions();
    }
  }, [round, images]);

  if (!user) {
    return <p>Error: No user data provided.</p>;
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <p className="title">Round #{round}</p>
        <p className="subtitle">score = {score}</p>
      </div>

      <div className="game-content">
        {/* <ImageContainer src={memeImage} alt="Meme for round" /> */}
        {images[round - 1] ? (
          <ImageContainer
            src={ip_address + images[round - 1].path}
            alt={images[round - 1].name}
          />
        ) : (
          <p>Loading image...</p>
        )}

        {captions.length === 7 ? (
          <ul className="caption-list">
            {captions.map((caption, index) => (
              <ListTile
                key={index}
                title={caption.text}
                onClick={() => {
                  if (selectedIndex === null) {
                    showCorrectAnswers(index);
                  }
                }}
                className={
                  index === selectedIndex
                    ? isCorrect
                      ? "list-tile correct"
                      : "list-tile wrong"
                    : "list-tile"
                }
              />
            ))}
          </ul>
        ) : (
          <p>Loading captions...</p>
        )}
      </div>
    </div>
  );
};

export default GamePage;
