Array.prototype.at = function(i) {
  if ( i < 0 ) {
    i = this.length - i * -1;
  }

  return this[i];
}

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
    var results = [];
    var wordPhoneme = self.phonemes[word.toUpperCase()];

    if ( 'undefined' === typeof wordPhoneme ) {
      return [];
    }

    var lastWordPhoneme = wordPhoneme.at(-1);
    var potentialRhymes = self.rejectHash(self.phonemes, function(anotherWord, phonemes) {
      return anotherWord === word.toUpperCase() || phonemes.at(-1) !== lastWordPhoneme;
    });

    for ( var anotherWord in potentialRhymes ) {
      var score = self.matchScore(word, anotherWord);

      if ( score > 50 ) {
        results.push({
          word: anotherWord,
          score: score,
          phoneme: self.phonemes[anotherWord]
        });
      }
    }

    return results;
  },

  matchScore: function(word, anotherWord) {
    var self = PhoneticDictionary;
    var wordPhoneme = self.phonemes[word.toUpperCase()];
    var anotherPhoneme = self.phonemes[anotherWord.toUpperCase()];
    var score = 1.0;
    var endIndex = Math.min(wordPhoneme.length, anotherPhoneme.length) * -1;
    for ( var i = -2; i >= endIndex; i -= 1 ) {
      if ( wordPhoneme.at(i) === anotherPhoneme.at(i) ) {
        score += 1.0;
      } else { break; }
    }

    return ((score / wordPhoneme.length) * 100.00);
  },

  wordsContainingPhoneme: function(phoneme) {
    var self = PhoneticDictionary;

    if ( 'undefined' === typeof self._wordsContainingPhoneme ) { self._wordsContainingPhoneme = {}; }

    if ( 'undefined' !== typeof self._wordsContainingPhoneme[phoneme] ) {
      return self._wordsContainingPhoneme[phoneme];
    }

    var words = [];
    for ( var word in self.phonemes ) {
      if ( self.phonemes[word].indexOf(phoneme) >= 0 ) {
        words.push(word);
      }
    }

    self._wordsContainingPhoneme[phoneme] = words;
    return words;
  },

  // Utility Functions
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

  phonemes: {},

  phonemeList: function() {
    var self = PhoneticDictionary;
    if ( 'undefined' !== typeof self._phonemeList ) {
      return self._phonemeList;
    }

    var phonemeList = [];
    for ( var key in self.phonemes ) {
      var wordPhonemes = self.phonemes[key];
      for ( var i = 0; i < wordPhonemes.length; i += 1 ) {
        var wordPhoneme = wordPhonemes[i];
        if ( phonemeList.indexOf(wordPhoneme) < 0 ) {
          phonemeList.push(wordPhoneme);
        }
      }
    }
    phonemeList = phonemeList.sort();

    self._phonemeList = phonemeList;
    return phonemeList;
  }
}

if ( window.exports ) { exports.PhoneticDictionary = PhoneticDictionary; }