import React from "react";
import "../styles/text.scss";

const Title = ({ text }) => {
  return (
    <div>
      <p className="title">{text}</p>
    </div>
  );
};

export default Title;
