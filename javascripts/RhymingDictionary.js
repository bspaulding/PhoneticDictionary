function RhymingDictionary() {
  if ( RhymingDictionary.theRhymingDictionary ) { return RhymingDictionary.theRhymingDictionary; } // Singleton

  bindAll(this);

  if ( window.applicationCache ) {
    applicationCache.addEventListener('updateready', function() {
      alert("An update is available. Reloading...");
      window.location.reload();
    });
  }

  document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    return false;
  });

  this.searchInput = document.querySelector('input[name="lookup-word"]');
  this.searchInput.addEventListener('search', this.handleSearch, false);
  this.searchInput.addEventListener('blur', function() {
    if ( document.querySelector('#suggestions').style.display === 'none' ) {
      this.handleSearch();
    }
  });
  this.searchInput.addEventListener('keyup', this.updateClearButtonVisibility, false);
  this.searchInput.addEventListener('keyup', this.updateQuerySuggestions, false);
  this.searchInput.addEventListener('change', this.updateClearButtonVisibility, false);

  this.clearButton = document.querySelector('header>form>img');
  this.clearButton.addEventListener('touchstart', this.handleSearchClear, false);
  this.clearButton.addEventListener('mousedown', this.handleSearchClear, false);
  this.clearButton.addEventListener('click', function(e) { e.preventDefault(); return false; }, false);

  document.body.addEventListener('orientationchange', this.handleOrientationChange);
  document.addEventListener('touchstart', function() {}, false); // Fast tapping
  document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false); // Disable scrolling on the main window.

  // Serenade
  Serenade.extend(this, Serenade.Properties);
  this.property('query');
  this.set('query', '');
  this.property('results');
  this.set('results', new Serenade.Collection([]));
  this.property('num_results');
  this.set('num_results', '');
  this.property('suggestions');
  this.set('suggestions', new Serenade.Collection([]));

  Serenade.view('result', 'li\n  @word');
  Serenade.view('results', 'article\n  h1 @query\n    small @num_results\n  ul\n    - collection @results\n      - view "result"\n');
  var element = Serenade.render('results', this);
  document.body.appendChild(element);

  Serenade.view('suggestion', 'li[event:click=suggestionClicked]\n  @word');
  Serenade.view('suggestions', 'section\n  ul#suggestions[style="display:none;"]\n    - collection @suggestions\n      - view "suggestion"');
  var element = Serenade.render('suggestions', this, this);
  document.body.appendChild(element);

  // Enable scrolling on the article, suggestion list
  document.querySelector('article').addEventListener('touchmove', function(e) { e.stopImmediatePropagation(); return true; }, false);
  document.querySelector('#suggestions').addEventListener('touchmove', function(e) { e.stopImmediatePropagation(); return true; }, false);

  this.set('query', 'Loading Dictionary...');
  PhoneticDictionary.load(this.phoneticDictionaryLoaded);
};

RhymingDictionary.prototype.suggestionClicked = function(event) {
  if ( "LI" !== event.target.tagName ) {
    return;
  }

  console.log(event.target.textContent);
  this.handleSearch(event.target.textContent);
}

RhymingDictionary.prototype.phoneticDictionaryLoaded = function() {
  this.set('query', '');
  this.searchInput.setAttribute('placeholder', 'Search for rhymes');

  this.populateQuerySuggestions();

  this.restoreState();
};

RhymingDictionary.prototype.populateQuerySuggestions = function() {
  this.querySuggestions = new MOTrie();

  var words = PhoneticDictionary.words();
  for ( var i = 0; i < words.length; i += 1 ) {
    this.querySuggestions.insert(words[i].toLowerCase());
  }
};

RhymingDictionary.prototype.restoreState = function() {
  if ( window.localStorage ) {
    var lastQuery = localStorage.getItem('lastQuery');
    if ( lastQuery && lastQuery.length > 0 ) {
      this.searchInput.value = lastQuery;
      this.updateClearButtonVisibility();
      this.handleSearch();
    }
  }
};

RhymingDictionary.prototype.handleSearch = function(query) {
  if ( 'string' === typeof query ) {
    this.searchInput.value = query;
  } else {
    query = this.searchInput.value;
  }
  this.searchInput.blur();
  if ( query ) { query = query.trim(); }
  if ( query === this.get('query') ) { return; }

  this.set('query', query);
  if ( window.localStorage ) {
    localStorage.setItem('lastQuery', query);
  }

  if ( 'undefined' === typeof query || query.length === 0 ) {
    this.get('results').update([]);
    this.set('num_results', '');
  } else {
    var results = PhoneticDictionary.lookup(query);
    results = results.sort(function(a,b) { return b.score - a.score; });
    results = map(results, function(i) { i.word = i.word.replace(/[^a-z]/ig, ""); return i; });
    results = uniq(results, function(i) { return i.word; });

    this.set('num_results', this.pluralize(results.length, 'result', 'results'));

    // Hack to get webkit to recalculate the width of the small element.
    var small = document.querySelector('small');
    small.parentElement.removeChild(small);
    document.querySelector('h1').appendChild(small);

    this.get('results').update(results);
  }
  this.hideSuggestions();
}

RhymingDictionary.prototype.handleSearchClear = function(event) {
  event.preventDefault();

  this.searchInput.value = '';
  this.searchInput.focus();
  this.hideClearButton();

  return false;
}

RhymingDictionary.prototype.updateClearButtonVisibility = function() {
  if ( this.searchInput.value.length > 0 ) {
    this.showClearButton();
  } else {
    this.hideClearButton();
  }
}

RhymingDictionary.prototype.showClearButton = function() {
  this.clearButton.removeAttribute('style');
}

RhymingDictionary.prototype.hideClearButton = function() {
  this.clearButton.setAttribute('style', 'display:none;');
}

RhymingDictionary.prototype.pluralize = function(number, singular, plural) {
  return String(number) + ' ' + (parseInt(number) === 1 ? singular : plural);
}

RhymingDictionary.prototype.handleOrientationChange = function(event) {
  // alert('orientationchange')
}

RhymingDictionary.prototype.updateQuerySuggestions = function(event) {
  var query = this.searchInput.value;
  if ( query.length === 0 ) {
    this.hideSuggestions();
    return;
  }
  var suggestions = this.querySuggestions.find(query);
  suggestions = map(suggestions, function(word) { return word.replace(/[^a-z]/ig, ""); });
  suggestions = uniq(suggestions, function(word) { return word; });
  suggestions = map(suggestions, function(word) { return { word: word }; });

  if ( suggestions.length > 0 ) {
    this.get('suggestions').update(suggestions);
    this.showSuggestions();
  }
}

RhymingDictionary.prototype.hideSuggestions = function() {
  document.querySelector('ul#suggestions').style.display = 'none';
}

RhymingDictionary.prototype.showSuggestions = function() {
  document.querySelector('ul#suggestions').style.display = '';
}

var appDelegate = function() {
  window.mainRhymingDictionary = new RhymingDictionary();
};

if ( window.device ) {
  document.addEventListener('deviceready', appDelegate);
} else {
  document.addEventListener('DOMContentLoaded', appDelegate);
}
