const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const stemmer = require("stemmer.js");

// Function to read all documents
function readDocuments() {
  const documentsPath = path.join(__dirname, "../documents");
  const files = fs.readdirSync(documentsPath);
  const documents = {};

  files.forEach((file) => {
    const content = fs.readFileSync(path.join(documentsPath, file), "utf-8");
    documents[file] = content;
  });

  console.log(documents);
  return documents;
}

// Function to create a term frequency (TF) map
function createTFMap(documents) {
  const tfMap = {};

  for (const [docName, content] of Object.entries(documents)) {
    const stemmedContent = stemmer.stemText(content);
    const words = stemmedContent.split(" ");

    words.forEach((word) => {
      if (!tfMap[word]) {
        tfMap[word] = {};
      }
      if (!tfMap[word][docName]) {
        tfMap[word][docName] = 0;
      }
      tfMap[word][docName]++;
    });
  }

  return tfMap;
}

// Function to create an inverse document frequency (IDF) map
function createIDFMap(tfMap, totalDocuments) {
  const idfMap = {};

  for (const [term, docFreqs] of Object.entries(tfMap)) {
    const docCount = Object.keys(docFreqs).length;
    idfMap[term] = Math.log(totalDocuments / docCount);
  }

  return idfMap;
}

// Function to create a TF-IDF map
function createTFIDFMap(tfMap, idfMap) {
  const tfidfMap = {};

  for (const [term, docFreqs] of Object.entries(tfMap)) {
    tfidfMap[term] = {};

    for (const [docName, tf] of Object.entries(docFreqs)) {
      tfidfMap[term][docName] = tf * idfMap[term];
    }
  }

  return tfidfMap;
}

// Function to save the TF-IDF map to an xlsx file
function saveToXLSX(tfidfMap) {
  const workbook = xlsx.utils.book_new();
  const data = [];

  for (const [term, docFreqs] of Object.entries(tfidfMap)) {
    for (const [docName, tfidf] of Object.entries(docFreqs)) {
      data.push({ Term: term, Document: docName, TFIDF: tfidf });
    }
  }

  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, "TF-IDF");
  xlsx.writeFile(workbook, "tfidf.xlsx");
}

// Main function to process documents and create the TF-IDF map
function processDocuments() {
  const documents = readDocuments();
  const totalDocuments = Object.keys(documents).length;

  const tfMap = createTFMap(documents);
  const idfMap = createIDFMap(tfMap, totalDocuments);
  const tfidfMap = createTFIDFMap(tfMap, idfMap);

  saveToXLSX(tfidfMap);
}

processDocuments();
