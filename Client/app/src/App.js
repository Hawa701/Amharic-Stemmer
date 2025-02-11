import React, { useState } from "react";
import axios from "axios";

function App() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/vsm/${encodeURIComponent(inputText)}`
      );

      setResults(
        response.data.results.length > 0
          ? response.data.results
          : ["No search results found."]
      );
      setError("");
    } catch (err) {
      console.error("Error searching text:", err);
      setError("Failed to search the text. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>Amharic Search Engine</h1>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter search query"
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      <button onClick={handleSearch} style={{ width: "100%", padding: "10px" }}>
        Search
      </button>
      <div className="results">
        {results.length > 0 ? (
          <>
            <h2>Search Results</h2>
            <ul>
              {results.map((result, index) => (
                <li key={index}>
                  {typeof result === "string" ? (
                    result
                  ) : (
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {result.title}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No search results found.</p>
        )}
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
