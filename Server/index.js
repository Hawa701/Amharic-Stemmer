const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { stemText } = require("./utils/stemmer");

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(cors());

app.get("/stemmer/:word", (req, res) => {
  const word = req.params.word;
  const stemmedWord = stemText(word);
  res.json({ original: word, stemmed: stemmedWord });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
