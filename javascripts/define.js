function Definer() {
  if ( Definer.theDefiner ) { return Definer.theDefiner };

  if ( 'undefined' === typeof PhoneticDictionary ) {
    throw("[ERROR] PhoneticDictionary is not loaded, and is required.");
  }

  bindAll(this);

  PhoneticDictionary.load(this.phoneticDictionaryLoaded);
};

Definer.prototype.phoneticDictionaryLoaded = function() {
  console.log("[Definer#phoneticDictionaryLoaded]");
  this.loadUndefinedWords(this.undefinedWordsLoaded);
};

Definer.prototype.loadUndefinedWords = function() {
  console.log("[Definer#loadUndefinedWords]");
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
      console.log('[Definer#loadUndefinedWords] Error loading Dictionary data.');
    }
  }
  request.send();
};

Definer.prototype.undefinedWordsLoaded = function() {
  console.log("[Definer#undefinedWordsLoaded]");
}

document.addEventListener('DOMContentLoaded', function() {
  window.definer = new Definer();
});