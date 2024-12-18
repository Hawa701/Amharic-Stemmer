const punctuationList = require("../constants/punctuations.js");
const stopwordList = require("../constants/stopwords.js");
const suffixList = require("../constants/suffixes.js");

const dictionary = require("../constants/dictionary.json");

// Function to remove punctuation
function removePunctuation(text) {
  punctuationList.forEach((p) => {
    text = text.replace(new RegExp(`\\${p}`, "g"), "");
  });
  return text;
}

// Function to remove stopwords
function removeStopWords(text) {
  const words = text.split(" ");
  return words.filter((word) => !stopwordList.includes(word)).join(" ");
}

// Function to look up a word in the dictionary
function lookupInDictionary(word) {
  return dictionary[word] || word;
}

// Function to remove suffixes
function removeSuffix(word) {
  for (let suffix of suffixList) {
    if (word.endsWith(suffix)) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

// Main function to stem words
function stemWord(word) {
  let stemmedWord = lookupInDictionary(word);

  if (stemmedWord !== word) {
    console.log(`Dictionary lookup: ${word} -> ${stemmedWord}`);
  } else {
    // Fallback to suffix removal
    stemmedWord = removeSuffix(word);
  }

  return stemmedWord;
}

function stemText(text) {
  console.log("Input text:", text);

  // Remove punctuation
  text = removePunctuation(text);
  console.log("After removing punctuation:", text);

  // Remove stopwords
  text = removeStopWords(text);
  console.log("After removing stopwords:", text);

  // Stem each word
  const words = text.split(" ");
  const stemmedWords = words.map((word) => stemWord(word));

  console.log("Stemmed words:", stemmedWords);

  return stemmedWords.join(" ");
}

module.exports = {
  removePunctuation,
  removeStopWords,
  removeSuffix,
  stemWord,
  stemText,
};
