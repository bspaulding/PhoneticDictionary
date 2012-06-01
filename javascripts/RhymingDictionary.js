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
  bindAll(this);
  this.searchInput = document.querySelector('input[name="lookup-word"]');
  this.searchInput.addEventListener('search', this.handleSearch);

  document.body.addEventListener('orientationchange', this.handleOrientationChange);

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

  PhoneticDictionary.load();

  this.searchInput.value = 'rhyme';
  this.handleSearch();
};

RhymingDictionary.prototype.handleSearch = function() {
  this.searchInput.blur();
  var query = this.searchInput.value;
  this.set('query', query);
  if ( 'undefined' === typeof query || query.length === 0 ) {
    this.get('results').update([]);
  } else {
    var results = PhoneticDictionary.lookup(query);
    results = results.sort(function(a,b) { return b.score - a.score; });
    results = map(results, function(i) { i.word = i.word.replace(/[^a-z]/ig, ""); return i; });
    results = uniq(results, function(i) { return i.word; });

    console.log(results);
    this.set('num_results', this.pluralize(results.length, 'result', 'results'));
    this.get('results').update(results);
  }
}

RhymingDictionary.prototype.pluralize = function(number, singular, plural) {
  return String(number) + ' ' + (parseInt(number) === 1 ? singular : plural);
}

RhymingDictionary.prototype.handleOrientationChange = function(event) {
  // alert('orientationchange')
}

document.addEventListener('DOMContentLoaded', function() { window.mainRhymingDictionary = new RhymingDictionary(); });