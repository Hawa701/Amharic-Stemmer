const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const stemmer = require("./stemmer.js");

// Function to read the TF-IDF data from the xlsx file
function readTFIDFData() {
  const workbook = xlsx.readFile("IndexFile.xlsx");
  const sheet = workbook.Sheets["TF-IDF"];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const tfMap = {};
  const idfMap = {};
  const tfidfMap = {};

  const header = data[0];
  const totalDocuments = (header.length - 3) / 2;

  data.slice(1).forEach((row) => {
    const term = row[0];
    const df = row[1];
    const idf = row[2];

    tfMap[term] = {};
    tfidfMap[term] = {};
    idfMap[term] = idf;

    for (let i = 0; i < totalDocuments; i++) {
      const docName = `Document ${i + 1}.txt`;
      const tf = row[3 + i * 2];
      const wi = row[4 + i * 2];

      tfMap[term][docName] = tf;
      tfidfMap[term][docName] = wi;
    }
  });

  return { tfMap, idfMap, tfidfMap, totalDocuments };
}

// Function to calculate cosine similarity
function cosineSimilarity(vec1, vec2) {
  const dotProduct = Object.keys(vec1).reduce((sum, key) => {
    return sum + vec1[key] * (vec2[key] || 0);
  }, 0);

  const magnitude1 = Math.sqrt(
    Object.values(vec1).reduce((sum, val) => sum + val * val, 0)
  );
  const magnitude2 = Math.sqrt(
    Object.values(vec2).reduce((sum, val) => sum + val * val, 0)
  );

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}

// Function to process the search query and documents using precomputed TF-IDF data
function processQuery(query) {
  const { tfMap, idfMap, tfidfMap, totalDocuments } = readTFIDFData();

  // Process the query as a single document
  const queryStemmed = stemmer.stemText(query);
  const queryWords = queryStemmed.split(" ");
  const queryTF = {};
  queryWords.forEach((word) => {
    if (!queryTF[word]) queryTF[word] = 0;
    queryTF[word]++;
  });

  const queryTFIDF = {};
  for (const word of queryWords) {
    queryTFIDF[word] = (queryTF[word] || 0) * (idfMap[word] || 0);
  }

  // Calculate cosine similarity
  let similarities = [];
  for (let i = 0; i < totalDocuments; i++) {
    const docName = `Document ${i + 1}.txt`;
    const docTFIDF = {};
    for (const word of queryWords) {
      docTFIDF[word] = tfidfMap[word] ? tfidfMap[word][docName] || 0 : 0;
    }
    const similarity = cosineSimilarity(queryTFIDF, docTFIDF);
    similarities.push({ docName, similarity });
  }

  // Sort documents by similarity
similarities.sort((a, b) => b.similarity - a.similarity);
similarities = Array.from(similarities.filter((sim) => sim.similarity > 0).slice(0,10));
console.log(similarities)

  // Prepare results
  const results = similarities.map((sim) => ({
    title: sim.docName,
    link: `http://localhost:3001/documents/${sim.docName}`,
  }));

  if (!results.length) {
    return `"No Search Result found for ${query}"`;
  }
  return results;
}

module.exports = { processQuery };
