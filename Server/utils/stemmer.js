const punctuationList = require("../constants/punctuations.js");
const stopwordList = require("../constants/stopwords.js");
const prefixes = require("../constants/prefixes.js");
const suffixes = require("../constants/suffixes.js");
const dictionary = require("../constants/dictionary.json");
const fidels = require("../constants/fidel.js");

// Function to remove punctuation
function removePunctuation(text) {
  return text
    .split("")
    .filter((char) => !punctuationList.includes(char))
    .join("");
}

// Function to remove stopwords
function removeStopWords(text) {
  return text
    .split(" ")
    .filter((word) => !stopwordList.includes(word))
    .join(" ");
}

// Function to look up a word in the dictionary
function lookupInDictionary(word) {
  return dictionary[word] || word;
}

// Function to remove prefixes
function removePrefix(wordEn) {
  let best_prefix = [];
  for (const prefix in prefixes) {
    if (wordEn.startsWith(prefixes[prefix])) {
      let found  = prefixes[prefix];
      best_prefix.push(found);
    }
  }
  let longestString = "";
  for (const str of best_prefix) {
    if (str.length > longestString.length) {
      longestString = str;
    }
  }

  let stemmedPrefix =  wordEn.slice(longestString.length, wordEn.length);
  // console.log(stemmedPrefix + ` len : ${stemmedPrefix.length}`);
  if(stemmedPrefix.length <5){
    stemmedPrefix = wordEn;
  }
  return stemmedPrefix;
}

// Function to remove suffixes
function removesuffix(wordEn) {
  let best_suffix = [];
  for (const suffix in suffixes) {
    if (wordEn.endsWith(suffixes[suffix])) {
      let found = suffixes[suffix];
      // let found = wordEn.slice(0, -suffixes[suffix].length);
      best_suffix.push(found);
    }
  }

  let longestString = "";
  let secondlongest = "";
  let thridlongest = "";

  for (const str of best_suffix) {
    if (str.length > longestString.length) {
      thridlongest = secondlongest;
      secondlongest = longestString;
      longestString = str; 
    }
    else if (str.length > secondlongest.length){
      thridlongest = secondlongest;
      secondlongest = str;
    }
    else if (str.length > thridlongest.length){
      thridlongest = str;
    }    
  }

  let top_three = []
  top_three.push(longestString);
  top_three.push(secondlongest);
  top_three.push(thridlongest);

  let stemmedWord;

  for(const suffix in top_three){
    stemmedWord = wordEn.slice(0, -top_three[suffix].length);
    if(stemmedWord.length>2){
      break;
      }
      else{
        stemmedWord = wordEn;
      }
  }


  return stemmedWord;
}

function removeSuffix(wordEn) {
  // Find all suffixes that match
  const matchingSuffixes = suffixes.filter(suffix => wordEn.endsWith(suffix));

  // Sort suffixes by length in descending order
  const topThreeSuffixes = matchingSuffixes
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);

  // Attempt to remove suffixes in order of priority
  for (const suffix of topThreeSuffixes) {
    const stemmedWord = wordEn.slice(0, -suffix.length);
    if (stemmedWord.length > 2) {
      return stemmedWord;
    }
  }

  // Return the original word if no valid suffix is removed
  return wordEn;
}


// Function to convert Amharic to English
function convertToEnglish(wordAm) {
  let wordEn = "";
  for (let char in wordAm) {
    if (wordAm[char] == " ") {
      wordEn += " ";
    } else {
      let fidelEn = fidels[wordAm[char]];
      wordEn += fidelEn;
    }
  }

  return wordEn;
}

// Function to convert English to Amharic
function convertToAmharic(wordEn) {
  let wordAm = "";
  let stack = [];
  const vowels = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U", "x"]; // Vowels to track

  for (let i = wordEn.length - 1; i >= 0; i--) {
    const char = wordEn[i];

    // Push vowels or ambiguous characters onto the stack
    if (vowels.includes(char) && i > 0) {
      stack.push(char);
      // console.log(char);
    } else {
      // Build possible substrings using the stack
      let possibleSubstring = char;
      // console.log(char);
      // Add characters from the stack to form a valid match
      let leng = stack.length;
      while (stack.length > 0) {
        // console.log(possibleSubstring);
        // for(i=0;i<leng;i++){
        while (leng > 0) {
          possibleSubstring = possibleSubstring + stack.pop();
          // console.log(possibleSubstring);
          leng--;
        }

        // }
        // console.log(possibleSubstring + '   Here ');

        // Check if the substring matches a fidel
        if (Object.values(fidels).includes(possibleSubstring)) {
          // Find the corresponding Amharic character
          const amharicChar = Object.keys(fidels).find(
            (key) => fidels[key] === possibleSubstring
          );

          // Add the matched character to the result
          if(amharicChar){
            wordAm = amharicChar + wordAm;
          }

          // Reset the possibleSubstring and break
          possibleSubstring = "";
          break;
        }
      }

      // If no match was found, reset the stack and process the next character
      if (possibleSubstring) {
        const amharicChar = Object.keys(fidels).find(
          (key) => fidels[key] === possibleSubstring
        );
        // console.log(possibleSubstring);
        // Add the matched character to the result
        if(amharicChar){
          wordAm = amharicChar + wordAm;

        }

        // Reset the possibleSubstring and break
        possibleSubstring = "";
      }
    }
  }

  // Process any remaining characters in the stack (if any)
  while (stack.length > 0) {
    const leftover = stack.pop();
    wordAm = leftover + wordAm; // Add leftovers to the result (optional)
  }

  return wordAm;
}

// Main function to stem words
function stemWord(word) {
  // let stemmedWord = lookupInDictionary(word);

  // if (stemmedWord !== word) {
    // console.log(`Dictionary lookup: ${word} -> ${stemmedWord}`);
  // } else {
    const wordEn = convertToEnglish(word);
    const wordWithoutPrefix = removePrefix(wordEn);
    const wordWithoutSuffix = removeSuffix(wordWithoutPrefix);
    return convertToAmharic(wordWithoutSuffix);
  // }
  // return stemmedWord;
}

// Function to stem a full text
function stemText(text) {
  text = removePunctuation(text);
  // text = removeStopWords(text);

  const words = text.split(" ");

  const stemmedWords = words.map((word) => stemWord(word));
  return stemmedWords.join(" ");
}

module.exports = { stemText };
