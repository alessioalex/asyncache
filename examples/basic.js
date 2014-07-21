"use strict";

process.env.DEBUG = 'asyncache:example';
var cache = require('../index')();
var debug = require('debug')('asyncache:example');

var store = {};
cache.set = function(key, val, ttl, cb) {
  store['prefix-' + key] = val;
  // keep it async
  setImmediate(function() {
    cb();
  });
};
cache.get = function(key, cb) {
  // keep it async
  setImmediate(function() {
    cb(null, store['prefix-' + key]);
  });
};
cache.del = function(key, cb) {
  // keep it async
  setImmediate(function() {
    delete store['prefix-' + key];
    cb();
  });
};

var users = ['John Doe', 'Jane Doe'];
var getUser = function(userId, cb) {
  debug('getUser called');
  return setTimeout(function() {
    cb(null, users[userId]);
  }, 5000);
};

var removeUser = function(userId, cb) {
  debug('removeUser called');
  return setTimeout(function() {
    delete users[userId];
    cb();
  }, 100);
};

getUser = cache.remember(getUser);
removeUser = cache.forget(removeUser);

debug('go');

getUser(0, function(err, user) {
  debug('user 0 (slow, not cached)', user);

  // much faster now, retrieved value from cache
  getUser(0, function(err, user) {
    debug("user 0 (served from cache)", user);

    getUser(1, function(err, user) {
      debug("user 1 (slow, not cached)", user);

      removeUser(1, function(err) {
        cache.get(1, function(err, user) {
          debug('user 1 should be undefined now:', user);
        });
      });
    });
  });
});
