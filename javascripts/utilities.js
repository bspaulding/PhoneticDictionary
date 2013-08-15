Array.prototype.at = function(i) {
  if ( i < 0 ) {
    i = this.length - i * -1;
  }

  return this[i];
}

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
var mapByKey = function(key) {
  return function(a) {
    return map(a, function(i) {
      return i[key];
    });
  }
}
var reject = function(a, fn) {
  var results = [];
  for ( var i = 0; i < a.length; i += 1 ) {
    if ( !fn(a[i]) ) {
      results.push(a[i]);
    }
  }
  return results;
}

var arrayEqual = function(a,b) {
  if ( a.length !== b.length ) {
    return false;
  }

  for ( var i = 0; i < a.length; i += 1 ) {
    if ( a[i] !== b[i] ) {
      return false;
    }
  }

  return true;
}

var find = function(a, fn) {
  var i;
  for ( i = 0; i < a.length; i += 1 ) {
    if ( fn(a[i]) ) {
      return a[i];
    }
  }
}

var reverseFind = function(a, fn) {
  var i;
  for ( i = a.length - 1; i >= 0; i -= 1 ) {
    if ( fn(a[i]) ) {
      return a[i];
    }
  }
}

var mapHash = function(h, fn) {
  var result = [];
  var key;
  for ( key in h ) {
    if ( h.hasOwnProperty(key) ) {
      result.push(fn(key, h[key]));
    }
  }
  return result;
}
