import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import LoginPage from "./LoginPage";
import GamePage from "./GamePage";
import GameOverPage from "./GameOverPage";
import { User } from "./models/User.mjs";
import { Image } from "./models/Image.mjs";
import { Caption } from "./models/Caption.mjs";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  const ip_address = "http://localhost:3000/";
  const [users, setUsers] = useState([]);
  const [images, setImages] = useState([]);

  // async function retrieveUsers() {
  //   try {
  //     const usersJson = await fetch(ip_address + "users")
  //       .then((response) => response.json())
  //       .catch((error) => console.error("Query problems", error));

  //     const retrievedUsers = usersJson.map(
  //       (user) => new User(user.username, user.personalBest)
  //     );

  //     setUsers(retrievedUsers);
  //   } catch (error) {
  //     console.error("Query problems", error);
  //   }
  // }

  async function retrieveUsers() {
    try {
      const usersJson = await fetch(ip_address + "users")
        .then((response) => response.json())
        .catch((error) => {
          console.error("Query problems", error);
          return []; // fallback se la query fallisce
        });

      const retrievedUsers = usersJson.map(
        (user) => new User(user.username, user.personalBest)
      );

      setUsers(retrievedUsers);
      return retrievedUsers; // ritorna gli utenti recuperati
    } catch (error) {
      console.error("Query problems", error);
      return []; // fallback anche in caso di errore generale
    }
  }

  async function performQuery(image_id) {
    const imageJson = await fetch(ip_address + "images/" + image_id)
      .then((response) => response.json())
      .catch((error) => console.error("Query problems", error));

    return new Image(imageJson.image_id, imageJson.name, imageJson.path, [
      new Caption(imageJson.captions[0].caption_id, imageJson.captions[0].text),
      new Caption(imageJson.captions[1].caption_id, imageJson.captions[1].text),
    ]);
  }

  async function retrieveImages() {
    let images_ids = [];
    while (images_ids.length < 3) {
      let id = Math.floor(Math.random() * 7);
      if (!images_ids.includes(id)) {
        images_ids.push(id);
      }
    }

    let images = await Promise.all(images_ids.map((id) => performQuery(id)));

    setImages(images);
  }

  useEffect(() => {
    retrieveUsers();
    retrieveImages();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={<LoginPage users={users} retrieveUsers={retrieveUsers} />}
        />
        <Route path="/game" element={<GamePage images={images} />} />
        <Route
          path="/gameover"
          element={<GameOverPage retrieveImages={retrieveImages} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
