var bind = function(fn, scope) { return function() { return fn.apply(scope, arguments); } };
var bindAll = function(o) { for ( var k in o ) { if ( 'function' === typeof o[k] ) { o[k] = bind(o[k], o); }}};

function RhymingDictionary() {
  bindAll(this);
  this.searchInput = document.querySelector('input[name="lookup-word"]');
  this.searchInput.addEventListener('search', this.handleSearch);

  // Serenade
  Serenade.extend(this, Serenade.Properties);
  this.property('results');
  this.set('results', new Serenade.Collection([]));

  Serenade.view('result', 'span\n  @word\n<wbr/>');
  Serenade.view('results', 'div\n  - collection @results\n    - view "result"');
  var element = Serenade.render('results', this);
  document.body.appendChild(element);

  PhoneticDictionary.load();
};

RhymingDictionary.prototype.handleSearch = function() {
  var query = this.searchInput.value;
  if ( 'undefined' === typeof query || query.length === 0 ) {
    this.get('results').update([]);
  } else {
    var results = PhoneticDictionary.lookup(query);
    results = results.sort(function(a,b) {
      return b.score - a.score;
    });
    this.get('results').update(results);
  }
}

document.addEventListener('DOMContentLoaded', function() { window.mainRhymingDictionary = new RhymingDictionary(); });