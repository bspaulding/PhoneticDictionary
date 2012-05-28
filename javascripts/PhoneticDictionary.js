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
    request.open('GET', '/PhoneticDictionary.txt', false);
    request.send();
    if ( request.status === 200 ) {
      self.importDictionaryData(request.responseText);
      self.loaded = true;
      if ( callback ) { callback(self); }
    } else {
      console.log('Error loading Dictionary data.');
    }
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

    var lastWordPhoneme = wordPhoneme.at(-1);
    var potentialRhymes = self.rejectHash(self.phonemes, function(anotherWord, phonemes) {
      return anotherWord === word.toUpperCase() || phonemes.at(-1) !== lastWordPhoneme;
    });

    for ( var anotherWord in potentialRhymes ) {
      var score = self.matchScore(word, anotherWord);

      if ( score >= 50 ) {
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

  phonemes: {}
}

if ( window.exports ) { exports.PhoneticDictionary = PhoneticDictionary; }