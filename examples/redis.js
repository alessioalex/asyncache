"use strict";

process.env.DEBUG = 'asyncache:example';
var cache = require('../index')();
var debug = require('debug')('asyncache:example');

if (!process.env.REDIS_URL) {
  console.error('Please provide the REDIS_URL environment variable.');
  process.exit(1);
}

var redis = require("redis");
var rtg = require("url").parse(process.env.REDIS_URL);
var redis = require("redis").createClient(rtg.port, rtg.hostname);

redis.auth(rtg.auth.split(":")[1]);

// Implement cache methods: set, get, del
cache.set = function(key, val, ttl, cb) {
  var ttlInSeconds = Math.floor(ttl / 1000);
  redis.setex(key, ttlInSeconds, val, cb);
};

cache.get = function(key, cb) {
  redis.get(key, cb);
};

cache.del = function(key, cb) {
  redis.del(key, cb);
};

// defining a sample async function that executes the cb after a couple of seconds
var asyncGetFn = function(key, cb) {
  setTimeout(function() {
    cb(null, 'response');
  }, 2500);
};

// TTL set to 5 seconds
asyncGetFn = cache.remember(asyncGetFn, { ttl: 5000 });

debug('go');

var key = 'sample-key';

asyncGetFn(key, function(err, val) {
  debug('should return slow', err, val);

  asyncGetFn(key, function(err, val) {
    debug('should be instant', err, val);

    setTimeout(function() {
      redis.get(key, function(err, val) {
        debug('should return null because key-val expired', err, val);

        // close redis connection
        redis.end();
      });
    }, 5000);
  });
});
