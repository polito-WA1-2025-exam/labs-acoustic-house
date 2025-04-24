import React from "react";
import { Button } from "react-bootstrap";

const TextButton = ({ text, variant, onClick, isDisabled }) => {
  return (
    <Button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        borderRadius: "25px",
        padding: "10px 20px",
        margin: "5px",
        border: "none",
        cursor: "pointer",
        boxShadow: isDisabled ? null : "0 4px 8px rgba(0, 0, 0, 0.4)",
      }}
    >
      {text}
    </Button>
  );
};

export default TextButton;
