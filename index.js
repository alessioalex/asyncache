"use strict";

var debug = require('debug')('asyncache');
var utils = require('./lib/utils');

var cache = {};
var oneDay = (24 * 60 * 60 * 1000);

cache.remember = function(originalFunc, opts) {
  opts = opts || {};

  var that = this;

  // default ttl one day
  var ttl = opts.ttl || oneDay;
  // if the function is called multiple times with the same arguments
  // (multiple funcs trying to access the same key) before finishing its task
  // (executing the original function and adding the item to the cache),
  // make sure to only call the original && cache.set functions once
  // and after that execute all pending callbacks
  var pendingFuncs = {};

  return function() {
    var args = Array.prototype.slice.call(arguments);
    // extract the callback from the function's arguments (should be the last one)
    var callback = args.pop();
    var key = opts.key || utils.getHash(opts.key, args, opts.prefix);

    // try to fetch the data from the cache
    that.get(key, function(err, val) {
      if (err) { return callback(err); }

      if (!utils.exists(val)) {
        debug('cache miss', key);
        // if there are pending functions for the key then push this callback
        // to the array and return, because the first function call will be
        // taking care of the rest
        if (pendingFuncs['get_' + key]) {
          return pendingFuncs['get_' + key].push(callback);
        } else {
          // since it's the first function call for `key`
          // we will continue to call the original function and add the value
          // to the cache (if there's no error and the value is not empty)
          pendingFuncs['get_' + key] = [callback];
        }

        // remember we have the arguments that we need to pass to the original
        // function, but without the callback
        // now we are adding our own callback (that will execute all the pending functions once called)
        // to the `args` array (so we can use `originalFunc.apply` later)
        args.push(function(err, value) {
          // if there's an error or if the value wasn't found,
          // call all functions early
          if (err || !utils.exists(value)) {
            return utils.callFunctions(pendingFuncs['get_' + key], [err]);
          }

          // value found, add it to the cache and execute pending functions
          debug('cache set ' + key);
          that.set(key, value, ttl, function(err) {
            utils.callFunctions(pendingFuncs['get_' + key], [err, value]);
            delete pendingFuncs['get_' + key];
          });
        });

        originalFunc.apply(null, args);
      } else {
        debug('cache hit', key);
        // data found in cache, no need to get it by using the original function
        callback(null, val);
      }
    });
  };
};

cache.forget = function(originalFunc, opts) {
  opts = opts || {};

  // default ttl one day
  var ttl = opts.ttl || oneDay;
  // if the function is called multiple times with the same arguments
  // (multiple funcs trying to access the same key) before finishing its task
  // (executing the original function and removing the item from the cache),
  // make sure to only call the original && cache.del functions once
  // and after that execute all pending callbacks
  var pendingFuncs = {};

  return function() {
    var args = Array.prototype.slice.call(arguments);
    // extract the callback from the function's arguments (should be the last one)
    var callback = args.pop();
    var key = getHash(opts.key, args, opts.prefix);

    // if there are pending functions for the key then push this callback
    // to the array and return, because the first function call will be
    // taking care of the rest
    if (pendingFuncs['del_' + key]) {
      return pendingFuncs['del_' + key].push(callback);
    } else {
      // since it's the first function call for `key`
      // we will continue to remove the value from the cache and call the original function
      pendingFuncs['del_' + key] = [callback];
    }

    // first delete the value from the cache
    cache.del(key, function(err) {
      // if there's an error, execute all pending functions early
      // but not the original function
      if (err) {
        callFunctions(pendingFuncs['del_' + key], [err]);
        delete pendingFuncs['del_' + key];
      } else {
        // execute the original function and all the pending functions after
        args.push(function(err) {
          callFunctions(pendingFuncs['del_' + key], [err]);
          delete pendingFuncs['del_' + key];
        });

        originalFunc.apply(null, args);
      }
    });
  };
};

['get', 'set', 'del'].forEach(function(method) {
  cache[method] = function() {
    throw new Error('cache.' + method + ' not implemented');
  };
});

module.exports = function() {
  return Object.create(cache);
};
