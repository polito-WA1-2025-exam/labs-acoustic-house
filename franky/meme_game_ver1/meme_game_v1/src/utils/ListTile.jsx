import React from "react";
import "../styles/listTile.scss"; // Import custom styles for ListTile

const ListTile = ({ title, subtitle, onClick, className = "" }) => {
  return (
    <div className={`list-tile ${className}`} onClick={onClick}>
      <div className="list-tile-content">
        <h4 className="list-tile-title">{title}</h4>
        <p className="list-tile-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

export default ListTile;
