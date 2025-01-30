const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const stemmer = require("./stemmer.js");

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
    idfMap[term] = Math.log2(totalDocuments / docCount);
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
function saveToXLSX(tfMap, idfMap, tfidfMap, totalDocuments) {
  const workbook = xlsx.utils.book_new();
  const data = [];

  // Create header row
  const header = ["Term", "DF", "IDF"];
  for (let i = 1; i <= totalDocuments; i++) {
    header.push(`TF Doc ${i}`);
    header.push(`Wi Doc ${i}`);
  }
  data.push(header);

  // Create data rows
  for (const [term, docFreqs] of Object.entries(tfMap)) {
    const row = [term, Object.keys(docFreqs).length, idfMap[term]];

    for (let i = 1; i <= totalDocuments; i++) {
      const docName = `Document ${i}.txt`;
      const tf = docFreqs[docName] || 0;
      const wi = tfidfMap[term][docName] || 0;
      row.push(tf);
      row.push(wi);
    }

    data.push(row);
  }

  const worksheet = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, "TF-IDF");
  xlsx.writeFile(workbook, "tfidf.xlsx");
}

// Function to calculate cosine similarity
function cosineSimilarity(vec1, vec2) {
  const dotProduct = Object.keys(vec1).reduce((sum, key) => {
    return sum + (vec1[key] * (vec2[key] || 0));
  }, 0);

  const magnitude1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val * val, 0));

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}

// Function to process the search query and documents
function processQueryAndDocuments(query) {
  console.log("Received search query:", query); // Add logging
  const documents = readDocuments();
  const totalDocuments = Object.keys(documents).length;

  const tfMap = createTFMap(documents);
  const idfMap = createIDFMap(tfMap, totalDocuments);
  const tfidfMap = createTFIDFMap(tfMap, idfMap);

  saveToXLSX(tfMap, idfMap, tfidfMap, totalDocuments);

  // Process the query as a single document
  const queryStemmed = stemmer.stemText(query);
  const queryWords = queryStemmed.split(" ");
  const queryTF = {};
  queryWords.forEach(word => {
    if (!queryTF[word]) queryTF[word] = 0;
    queryTF[word]++;
  });

  const queryTFIDF = {};
  for (const word of queryWords) {
    queryTFIDF[word] = (queryTF[word] || 0) * (idfMap[word] || 0);
  }

  // Calculate cosine similarity
  const similarities = [];
  for (const docName of Object.keys(documents)) {
    const docTFIDF = {};
    for (const word of queryWords) {
      docTFIDF[word] = tfidfMap[word] ? (tfidfMap[word][docName] || 0) : 0;
    }
    const similarity = cosineSimilarity(queryTFIDF, docTFIDF);
    similarities.push({ docName, similarity });
  }

  // Sort documents by similarity
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Prepare results
  const results = similarities.map(sim => ({
    title: sim.docName,
    link: `http://localhost:3001/documents/${sim.docName}`
  }));

  return results;
}

// Main function to process documents and create the TF-IDF map
function processDocumentsAndQuery(query) {
  const documents = readDocuments();
  const totalDocuments = Object.keys(documents).length;

  const tfMap = createTFMap(documents);
  const idfMap = createIDFMap(tfMap, totalDocuments);
  const tfidfMap = createTFIDFMap(tfMap, idfMap);

  saveToXLSX(tfMap, idfMap, tfidfMap, totalDocuments);

  // Process the query as a single document
  const queryStemmed = stemmer.stemText(query);
  const queryWords = queryStemmed.split(" ");
  const queryTF = {};
  queryWords.forEach(word => {
    if (!queryTF[word]) queryTF[word] = 0;
    queryTF[word]++;
  });

  const queryTFIDF = {};
  for (const word of queryWords) {
    queryTFIDF[word] = (queryTF[word] || 0) * (idfMap[word] || 0);
  }

  // Calculate cosine similarity
  let similarities = [];
  for (const docName of Object.keys(documents)) {
    const docTFIDF = {};
    for (const word of queryWords) {
      docTFIDF[word] = tfidfMap[word] ? (tfidfMap[word][docName] || 0) : 0;
    }
    const similarity = cosineSimilarity(queryTFIDF, docTFIDF);
    similarities.push({ docName, similarity });
  }

  // Sort documents by similarity
  similarities.sort((a, b) => b.similarity - a.similarity);
  similarities = Array.from(similarities.filter((sim)=>sim.similarity > 0));
  // Prepare results
  const results = similarities.map(sim => ({
    title: sim.docName,
    link: `http://localhost:3001/documents/${sim.docName}`
  }));

  return results;
}

module.exports = { processDocumentsAndQuery };
