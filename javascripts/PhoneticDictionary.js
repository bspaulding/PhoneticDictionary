var PhoneticDictionary = {
  loaded: false, // Marked as true once the dictionary data has been loaded.
  load: function(callback) {
    var self = PhoneticDictionary;

    var request = new XMLHttpRequest();
    request.open('GET', 'PhoneticDictionary.txt', true);
    request.onreadystatechange = function(event) {
      var request = event.target;
      if ( request.readyState !== 4 ) { // 4 = DONE
        return;
      }

      // For some reason request.status = 0 when runnning in PhoneGap... :/
      if ( request.status === 200 || request.status === 0 ) {
        self.importDictionaryData(request.responseText);
        self.loaded = true;
        if ( callback ) { callback(self); }
      } else {
        console.log('Error loading Dictionary data.');
      }
    }
    request.send();
  },

  importDictionaryData: function(text) {
    var self = PhoneticDictionary;
    var lines = text.split("\n");

    if ( 'undefined' === typeof self.phonemes ) {
      self.phonemes = {};
    }

    for ( var i = 0; i < lines.length; i += 1 ) {
      var line = lines[i];
      var tokens = line.split(" ");
      self.phonemes[tokens[0]] = tokens.splice(2, tokens.length);
    }
  },

  lookup: function(word) {
    var self = PhoneticDictionary;
    return self.perfectRhymes(word);
  },

  // Perfect Rhyme Rules:
  //   1. The vowel sound in both words must be identical. — e.g. "sky" and high"
  //   2. The articulation that precedes the vowel sound must differ.
  //      i.e: "leave" and "believe" is an imperfect rhyme,
  //      whereas "green" and "spleen" are perfect rhymes.
  perfectRhymes: function(targetWord) {
    var self = PhoneticDictionary;
    var targetWordUpcase = targetWord.toUpperCase();
    var wordPhonemes = self.phonemes[targetWordUpcase];

    if ( 'undefined' === typeof wordPhonemes ) {
      return results;
    }

    targetRhymeInfo = self.rhymeInfo(targetWord, wordPhonemes);
    var matches = self.selectHash(self.phonemes, function(word, phonemes) {
      if ( word === targetWordUpcase ) { return false; }

      var wordRhymeInfo = self.rhymeInfo(word, phonemes);
      return targetRhymeInfo.stressedVowel === wordRhymeInfo.stressedVowel
          && arrayEqual(targetRhymeInfo.phonemesAfterStressedVowel, wordRhymeInfo.phonemesAfterStressedVowel)
          && targetRhymeInfo.phonemeBeforeStressedVowel !== wordRhymeInfo.phonemeBeforeStressedVowel;
    });

    return mapHash(matches, function(key, value) {
      return { word: key, phonemes: value };
    });
  },

  rhymeInfo: function(word, phonemes) {
    var self = PhoneticDictionary;
    var stressedVowel = phonemes[self.indexOfStress(phonemes)];
    return {
      stressedVowel: stressedVowel,
      phonemesAfterStressedVowel: self.findPhonemesAfterLastMatch(phonemes, stressedVowel),
      phonemeBeforeStressedVowel: self.findPhonemesBeforeLastMatch(phonemes, stressedVowel).at(-1)
    }
  },

  mapVowels: function(phonemes) {
    var self = PhoneticDictionary;
    return map(phonemes, self.isVowel);
  },

  indexOfStress: function(phonemes) {
    var self = PhoneticDictionary;
    for ( var i = phonemes.length - 1; i >= 0; i -= 1 ) {
      if ( self.isVowel(phonemes[i]) ) {
        return i;
      }
    }
  },

  findFirstVowelInPhonemes: function(wordPhonemes) {
    var self = PhoneticDictionary;
    return find(wordPhonemes, self.isVowel);
  },

  findLastVowelInPhonemes: function(wordPhonemes) {
    var self = PhoneticDictionary;
    return reverseFind(wordPhonemes, self.isVowel);
  },

  findPhonemesBeforeLastMatch: function(wordPhonemes, phoneme) {
    var lastIndex = wordPhonemes.lastIndexOf(phoneme);
    return wordPhonemes.slice(0, lastIndex);
  },

  findPhonemesAfterLastMatch: function(wordPhonemes, phoneme) {
    var lastIndex = wordPhonemes.lastIndexOf(phoneme);
    return wordPhonemes.slice(lastIndex + 1);
  },

  // Utility Functions
  selectHash: function(hash, aFunction) {
    var results = {};

    for ( var key in hash ) {
      if ( aFunction(key, hash[key]) ) {
        results[key] = hash[key];
      }
    }

    return results;
  },

  rejectHash: function(hash, aFunction) {
    var results = {};

    for ( var key in hash ) {
      if ( !aFunction(key, hash[key]) ) {
        results[key] = hash[key];
      }
    }

    return results;
  },

  words: function() {
    var self = PhoneticDictionary;
    if ( 'undefined' !== typeof self._words ) {
      return self._words;
    }

    var words = [];
    for ( var key in self.phonemes ) {
      words.push(key);
    }

    self._words = words;
    return words;
  },

  isVowel: function(string) {
    return PhoneticDictionary.vowels.indexOf(string) > -1;
  },

  isConsonant: function(string) {
    return PhoneticDictionary.consonants.indexOf(string) > -1;
  },

  consonants: ['B', 'CH', 'D', 'DH', 'F', 'G', 'HH', 'JH', 'K', 'L', 'M', 'N', 'NG', 'P', 'R', 'S', 'SH', 'T', 'TH', 'V', 'W', 'Y', 'Z', 'ZH'],
  vowels: ['AA0', 'AA1', 'AA2', 'AE0', 'AE1', 'AE2', 'AH0', 'AH1', 'AH2', 'AO0', 'AO1', 'AO2', 'AW0', 'AW1', 'AW2', 'AY0', 'AY1', 'AY2', 'EH0', 'EH1', 'EH2', 'ER0', 'ER1', 'ER2', 'EY0', 'EY1', 'EY2', 'IH0', 'IH1', 'IH2', 'IY0', 'IY1', 'IY2', 'OW0', 'OW1', 'OW2', 'OY0', 'OY1', 'OY2', 'UH0', 'UH1', 'UH2', 'UW0', 'UW1', 'UW2'],
  phonemes: {}
}

if ( window.exports ) { exports.PhoneticDictionary = PhoneticDictionary; }
