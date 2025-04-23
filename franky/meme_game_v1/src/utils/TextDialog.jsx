import React from "react";
import "../styles/textDialog.scss";
import TextButton from "./TextButton";
import CancelButton from "./CancelButton";

const TextDialog = ({ text, onClose, onDone }) => {
  const placeholder = "Enter your username...";
  const [inputText, setInputText] = React.useState("");

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  function handleDone() {
    onDone(inputText);
    setInputText("");
    onClose();
  }
  return (
    <div className="text-dialog-backdrop" onClick={onClose}>
      <div className="text-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="dialog-text">{text}</p>
        <input
          type="text"
          className="search-input"
          value={inputText}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
        <CancelButton onClick={onClose} />
        <TextButton
          text={"done"}
          variant={"primary"}
          isDisabled={inputText === ""}
          onClick={handleDone}
        />
      </div>
    </div>
  );
};

export default TextDialog;
