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
    var lowerString = String(string).toLowerCase();
    return this.childrenForNode(this.findNode(lowerString), lowerString);
  };

  MOTrie.prototype.childrenForNode = function(node, prefix) {
    var children = [];

    if ( 'undefined' === typeof node || node === null ) {
      return children;
    }

    if ( node.end ) {
      children.push(prefix);
    }

    for ( var key in node ) {
      if ( !node.hasOwnProperty(key) ) { continue; }

      var childWords = this.childrenForNode(node[key], prefix + key);
      children = children.concat(childWords);
    }

    return children;
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
