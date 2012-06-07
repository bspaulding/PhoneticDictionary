var bind = function(fn, scope) { return function() { return fn.apply(scope, arguments); } };
var bindAll = function(o) { for ( var k in o ) { if ( 'function' === typeof o[k] ) { o[k] = bind(o[k], o); }}};
var map = function(a, fn) { var r = []; for ( var i = 0; i < a.length; i += 1 ) { r.push(fn(a[i])); } return r; }
var uniq = function(a, fn) {
  var indices = {};

  for ( var i = 0; i < a.length; i += 1) {
    var key = fn(a[i]);
    if ( 'undefined' === typeof indices[key] ) {
      indices[key] = i;
    }
  }

  var r = [];
  for ( var key in indices ) {
    r.push(a[indices[key]]);
  }

  return r;
}

function RhymingDictionary() {
  if ( RhymingDictionary.theRhymingDictionary ) { return RhymingDictionary.theRhymingDictionary; } // Singleton

  bindAll(this);

  document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    return false;
  });

  this.searchInput = document.querySelector('input[name="lookup-word"]');
  this.searchInput.addEventListener('search', this.handleSearch, false);
  this.searchInput.addEventListener('blur', this.handleSearch);
  this.searchInput.addEventListener('keyup', this.updateClearButtonVisibility, false);
  this.searchInput.addEventListener('change', this.updateClearButtonVisibility, false);

  this.clearButton = document.querySelector('header>form>img');
  this.clearButton.addEventListener('mousedown', this.handleSearchClear, true);

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

  Serenade.view('result', 'li\n  @word');
  Serenade.view('results', 'article\n  h1 @query\n    small @num_results\n  ul\n    - collection @results\n      - view "result"');
  var element = Serenade.render('results', this);
  document.body.appendChild(element);
  // Enable scrolling on the article
  document.querySelector('article').addEventListener('touchmove', function(e) { e.stopImmediatePropagation(); return true; }, false);

  this.set('query', 'Loading Dictionary...');
  PhoneticDictionary.load(this.phoneticDictionaryLoaded);
};

RhymingDictionary.prototype.phoneticDictionaryLoaded = function() {
  this.set('query', '');
  this.searchInput.setAttribute('placeholder', 'Search for rhymes');

  this.restoreState();
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

RhymingDictionary.prototype.handleSearch = function() {
  this.searchInput.blur();
  var query = this.searchInput.value;
  if ( query ) { query = query.trim() }
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

var appDelegate = function() { window.mainRhymingDictionary = new RhymingDictionary(); };
if ( window.device ) {
  document.addEventListener('deviceready', appDelegate);
} else {
  document.addEventListener('DOMContentLoaded', appDelegate);
}