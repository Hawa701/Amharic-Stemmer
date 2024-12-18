import React, { useState } from "react";
import axios from "axios";

function App() {
  const [inputText, setInputText] = useState("");
  const [stemmedWord, setStemmedWord] = useState("");
  const [error, setError] = useState("");

  const handleStem = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/stemmer/${encodeURIComponent(inputText)}`
      );
      setStemmedWord(response.data.stemmed);
      setError("");
    } catch (err) {
      console.error("Error stemming text:", err);
      setError("Failed to stem the word. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Amharic Stemmer</h1>

      <textarea
        rows="5"
        cols="50"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter Amharic text"
      />
      <br />
      <button onClick={handleStem} style={{ marginTop: "10px" }}>
        Stem Word
      </button>

      {stemmedWord && (
        <div>
          <h2>Stemmed Word:</h2>
          <p>
            <strong>{stemmedWord}</strong>
          </p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
