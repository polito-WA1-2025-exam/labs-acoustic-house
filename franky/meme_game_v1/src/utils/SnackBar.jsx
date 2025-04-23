import React, { useEffect, useState } from "react";
import "../styles/snackbar.scss";

const SnackBar = ({ text, duration = 3000, isError, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsFadingOut(true);

      // Wait for fadeout animation to finish before unmounting
      setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 300); // match the fadeout animation duration
    }, duration);

    return () => clearTimeout(showTimer);
  }, [duration, onClose]);

  return visible ? (
    <div
      className={`snackbar 
      ${isError ? "error" : "success"} 
      ${isFadingOut ? "fade-out" : "fade-in"}`}
    >
      {text}
    </div>
  ) : null;
};

export default SnackBar;
