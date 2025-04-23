import React from "react";
import "../styles/searchBar.scss";

const SearchBar = ({
  placeholder = "Search your username...",
  value,
  setValue,
  onSearch,
}) => {
  const handleInputChange = (e) => {
    const input = e.target.value;
    setValue(input); // Update the parent state
    if (onSearch) {
      onSearch(input); // Trigger search logic
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        value={value} // Controlled from parent
        onChange={handleInputChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
