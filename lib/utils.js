"use strict";

exports.exists = function(val) {
  return (val != null);
};

// generate a unique string for a set of arguments
exports.getHash = function(key, args, prefix) {
  prefix = prefix || '';
  return prefix + (key || args.toString());
};

// execute all functions with the `args` array
exports.callFunctions = function(functionsArray, args) {
  functionsArray.forEach(function(cb) {
    cb.apply(null, args);
  });
};
