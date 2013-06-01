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
