const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { stemText } = require("./utils/stemmer");
const { processDocumentsAndQuery } = require("./utils/vsm");

const app = express();
const PORT = 3001;


app.use(bodyParser.json());
app.use(cors());

app.use("/documents", express.static(path.join(__dirname, "./documents")));


app.get("/stemmer/:word", (req, res) => {
  const word = req.params.word;
  const stemmedWord = stemText(word);
  res.json({ original: word, stemmed: stemmedWord });
});

app.get("/vsm/:word", (req, res) => {
  const word = req.params.word;
  const stemmedWord = processDocumentsAndQuery(word);
  res.json({ original: word, results: stemmedWord });
});

// app.get('/documents', (req, res) => {
//   const documentsPath = path.join(__dirname, './documents'); // Adjust path as needed
//   const files = fs.readdirSync(documentsPath);
//   const documents = {};

//   files.forEach(file => {
//     const filePath = path.join(documentsPath, file);
    
//     if (fs.statSync(filePath).isFile() && path.extname(file) === '.txt') {
//       const content = fs.readFileSync(filePath, 'utf-8');
//       documents[file] = content;
//     }
//   });

//   res.json(documents);
// });


app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
