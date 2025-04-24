import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SnackBar from "./utils/SnackBar";
import TextButton from "./utils/TextButton";

const GameOverPage = ({ retrieveImages }) => {
  const navigate = useNavigate();
  const ip_address = "http://localhost:3000/";
  const location = useLocation();
  const user = location.state?.user;
  const finalScore = location.state?.score;

  const [snackbarText, setSnackbarText] = useState("");

  const [showSnackbar, setShowSnackbar] = useState(false);

  const [recordHasBeenBroken, setRecordHasBeenBroken] = useState(false);

  async function updatepersonalBest() {
    try {
      const response = await fetch(
        `${ip_address}updatePB/${user.name}/${finalScore}`,
        {
          method: "PUT",
        }
      );
      if (response.ok) {
        startSnackbar(
          `Personal best successfully updated to ${finalScore} for ${user.name}`
        );
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  }

  function startSnackbar(text) {
    setSnackbarText(text);
    setShowSnackbar(true);
  }

  useEffect(() => {
    if (finalScore > user.personalBest) {
      updatepersonalBest();
      user.personalBest = finalScore;
      setRecordHasBeenBroken(true);
    }
  });

  return (
    <div>
      <p className="title">Game Over</p>
      {recordHasBeenBroken ? (
        <>
          <p className="subtitle">
            Great job {user.name}! New personal best !!!
          </p>
          <p className="subtitle">final score: {finalScore}</p>
        </>
      ) : (
        <p className="subtitle">
          {user.name} your final score is: {finalScore}
        </p>
      )}

      {/* Snackbar for notifications */}
      {showSnackbar && (
        <SnackBar
          text={snackbarText}
          duration={5000}
          onClose={() => {
            setShowSnackbar(false);
          }}
        />
      )}

      {/* Change user button */}
      <TextButton
        text="Change User"
        variant={"primary"}
        onClick={() => {
          navigate("/login", {
            state: { user: user },
          });
        }}
      />

      {/* New game button */}
      <TextButton
        text="New Game"
        variant={"success"}
        onClick={async () => {
          await retrieveImages();
          navigate("/game", {
            state: { user: user },
          });
        }}
      />
    </div>
  );
};

export default GameOverPage;
