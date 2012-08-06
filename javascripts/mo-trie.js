var MOTrie = (function() {
  var bindAll = function(o) { for ( var k in o ) { if ( 'function' === typeof o[k] ) { o[k] = bind(o[k], o); }}};

  function MOTrie() {
    bindAll(this);
    this.root = {};
  };

  MOTrie.prototype.insert = function(string) {
    var node = this.root;
    for ( var i = 0; i < string.length; i += 1 ) {
      var character = string[i];
      if ( 'undefined' === typeof node[character] ) {
        node[character] = {};
      }
      node = node[character];
    }
    node["end"] = true;
  };

  MOTrie.prototype.find = function(string) {
    return this.wordsForNode(this.findNode(string), string);
  };

  MOTrie.prototype.wordsForNode = function(node, prefix) {
    var words = [];

    if ( node.end ) {
      words.push(prefix);
    }

    for ( var key in node ) {
      if ( !node.hasOwnProperty(key) ) { continue; }

      var childWords = this.wordsForNode(node[key], prefix + key);
      words = words.concat(childWords);
    }

    return words;
  }

  MOTrie.prototype.findNode = function(string) {
    var node = this.root;

    for ( var i = 0; i < string.length; i += 1 ) {
      var character = string[i];
      if ( 'undefined' === node[character] ) {
        return;
      } else {
        node = node[character];
      }
    }

    return node;
  };

  return MOTrie;
}());