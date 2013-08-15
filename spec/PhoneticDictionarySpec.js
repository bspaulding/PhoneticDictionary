describe("PhoneticDictionary", function() {
  PhoneticDictionary.loaded = true; // phonetic-dictionary.json loads data.

  describe("isConsonant", function() {
    it("should return true for all of PhoneticDictionary.consonants", function() {
      var phonemes = PhoneticDictionary.consonants;
      for ( var i = 0; i < phonemes.length; i += 1 ) {
        expect(PhoneticDictionary.isConsonant(phonemes[i])).toEqual(true);
      }
    });

    it("should return false for all of PhoneticDictionary.vowels", function() {
      var phonemes = PhoneticDictionary.vowels;
      for ( var i = 0; i < phonemes.length; i += 1 ) {
        expect(PhoneticDictionary.isConsonant(phonemes[i])).toEqual(false);
      }
    });
  });

  describe("isVowel", function() {
    it("should return true for all of PhoneticDictionary.vowels", function() {
      var phonemes = PhoneticDictionary.vowels;
      for ( var i = 0; i < phonemes.length; i += 1 ) {
        expect(PhoneticDictionary.isVowel(phonemes[i])).toEqual(true);
      }
    });

    it("should return false for all of PhoneticDictionary.consonants", function() {
      var phonemes = PhoneticDictionary.consonants;
      for ( var i = 0; i < phonemes.length; i += 1 ) {
        expect(PhoneticDictionary.isVowel(phonemes[i])).toEqual(false);
      }
    });
  });

  describe("perfectRhymes", function() {
    function makePerfectRhymeTest(a, b) {
      return {
        name: "should return the same results for '" + a + "' and '" + b + "'",
        fn: function() {
          var mapByWord = mapByKey('word');
          var aResults  = mapByWord(PhoneticDictionary.perfectRhymes(a));
          var bResults  = mapByWord(PhoneticDictionary.perfectRhymes(b));

          expect(aResults.length).toNotEqual(0);
          expect(aResults).toContain(b.toUpperCase());
          expect(bResults).toContain(a.toUpperCase());
        }
      }
    }

    var perfectRhymes = [
      ["file", "smile"],
      ["green", "spleen"],
      ["sky", "high"],
      ["great", "late"]
    ];

    for ( var i = 0; i < perfectRhymes.length; i += 1 ) {
      var a = perfectRhymes[i][0];
      var b = perfectRhymes[i][1];
      var test = makePerfectRhymeTest(a, b);
      it(test.name, test.fn);
    }

    it("should not return the target word", function() {
      var results = mapByKey('word')(PhoneticDictionary.perfectRhymes("file"));
      expect(results).not.toContain('FILE');
    });

    it("should not return results that match the last vowel, but not the phonemes after it", function() {
      var results = mapByKey('word')(PhoneticDictionary.perfectRhymes("file"));

      expect(results.length).toNotEqual(0);
      expect(results).not.toContain("BINES");
    });

    it("should not return imperfect rhymes", function() {
      var results = mapByKey('word')(PhoneticDictionary.perfectRhymes("leave"));

      expect(results.length).toNotEqual(0);
      expect(results).not.toContain("BELIEVE");
    });
  });
});
