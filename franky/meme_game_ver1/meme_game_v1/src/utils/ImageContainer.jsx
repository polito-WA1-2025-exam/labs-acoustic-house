import React from "react";
import "../styles/imageContainer.scss";

const ImageContainer = ({ src, alt }) => {
  return (
    <div className="image-container">
      <img src={src} alt={alt} className="image" />
    </div>
  );
};

export default ImageContainer;
