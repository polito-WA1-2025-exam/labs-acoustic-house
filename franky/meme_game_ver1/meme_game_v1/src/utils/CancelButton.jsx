import React from "react";
import "../styles/cancelButton.scss"; // opzionale se vuoi usare SCSS

const CancelButton = ({ onClick }) => {
  return (
    <button className="cancel-button" onClick={onClick}>
      Cancel
    </button>
  );
};

export default CancelButton;
