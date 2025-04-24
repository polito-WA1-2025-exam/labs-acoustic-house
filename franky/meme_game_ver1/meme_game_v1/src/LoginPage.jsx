import React, { useState } from "react";
import "./styles/text.scss";
import "./styles/loginPageBox.scss";
import { useNavigate } from "react-router-dom";
import SearchBar from "./utils/SearchBar";
import TextButton from "./utils/TextButton";
import ListTile from "./utils/ListTile";
import { FaCheckCircle } from "react-icons/fa";
import TextDialog from "./utils/TextDialog";
import SnackBar from "./utils/SnackBar";

const LoginPage = ({ users, retrieveUsers }) => {
  const navigate = useNavigate();

  const ip_address = "http://localhost:3000/";

  const [searchResult, setSearchResult] = useState([]);

  const [shownUser, setShownUser] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [showDialog, setShowDialog] = useState(false);

  const [snackbarText, setSnackbarText] = useState("");

  const [showSnackbar, setShowSnackbar] = useState(false);

  const [snackbarIsError, setsnackbarIsError] = useState(false);

  const searchUsersByName = (name) => {
    if (name === "") {
      setSearchResult([]);
      return;
    }
    setSearchResult(users.filter((user) => user.name.includes(name)));
  };

  async function searchUserByName(name) {
    const updatedUsers = await retrieveUsers();

    return updatedUsers.find((user) => user.name === name);
  }

  function handleListTileClick(user) {
    setSelectedUser(user);
    setShownUser(user.name);
    setSearchResult([]); // Clear search results after selection
  }

  function startSnackbar(text, isError = false) {
    setSnackbarText(text);
    setsnackbarIsError(isError);
    setShowSnackbar(true);
  }

  async function addNewUser(newUsername) {
    try {
      const response = await fetch(ip_address + "adduser/" + newUsername, {
        method: "PUT",
      });

      const status = response.status;

      if (status === 409) {
        startSnackbar(
          "Username already exists. Please select it from the list.",
          true
        );
      } else {
        startSnackbar("User added successfully!");
        await retrieveUsers();
      }
    } catch (error) {
      console.error("Database error:", error);
      return;
    }
  }

  async function addNewUserAndSelectIt(newUsername) {
    await addNewUser(newUsername);
    const user = await searchUserByName(newUsername);
    setSelectedUser(user);
    setShownUser(user.name);
  }

  return (
    <div>
      <p className="title">Welcome to MemeGame!!!</p>
      <p className="subtitle">Let's master all these memes</p>
      <div>
        <SearchBar
          value={shownUser}
          setValue={setShownUser}
          onSearch={searchUsersByName}
        />
        {selectedUser && (
          <div className="selected-user-row">
            <p className="body-text">Selected user: {selectedUser.name}</p>
            <FaCheckCircle className="tick-icon" color="green" />
          </div>
        )}
      </div>

      {/* Display search results */}
      {searchResult.length > 0 && (
        <div className="search-results">
          <div className="results-box">
            <ul>
              {searchResult.map((user, index) => (
                <ListTile
                  key={index}
                  title={user.name}
                  subtitle={`Personal Best: ${user.personalBest}`}
                  onClick={() => handleListTileClick(user)}
                />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Create new user button */}
      <TextButton
        text="Create New User"
        variant={"primary"}
        onClick={() => setShowDialog(true)}
      />

      {/* Start game button */}
      <TextButton
        text="Start Game"
        variant={"success"}
        isDisabled={!selectedUser}
        onClick={() => {
          navigate("/game", {
            state: { user: selectedUser },
          });
        }}
      />

      {/* Dialog for adding new user */}
      {showDialog && (
        <TextDialog
          text="Enter a new username"
          onClose={() => setShowDialog(false)}
          onDone={(inputText) => {
            addNewUserAndSelectIt(inputText);
          }}
        />
      )}

      {/* Snackbar for notifications */}
      {showSnackbar && (
        <SnackBar
          text={snackbarText}
          duration={3000}
          isError={snackbarIsError}
          onClose={() => {
            setShowSnackbar(false);
          }}
        />
      )}
    </div>
  );
};

export default LoginPage;
