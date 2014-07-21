"use strict";

var should = require('should');
var sinon = require('sinon');

var asyncache = require('../');
var noop = function() {};

describe('asyncache', function() {
  it('show throw an error if .set, .get and .del are not implemented', function() {
    (asyncache().set).should.throw();
  });

  describe('.remember', function() {
    var mockAsyncFn = function(key, cb) {
      setImmediate(function() {
        cb(null, 'res-' + key);
      });
    };

    it('should call the .get() function with the key', function() {
      var key = 'sample-key';
      var cache = asyncache();

      cache.get = sinon.spy();
      var cachedAsyncFn = cache.remember(mockAsyncFn);

      cachedAsyncFn(key, noop);

      cache.get.calledWith(key).should.be.true;
    });

    it("should return the value from cache if it's available", function(done) {
      var val = 'cached-val';
      var cache = asyncache();
      cache.get = sinon.stub();
      cache.get.callsArgWith(1, null, val);

      var cachedAsyncFn = cache.remember(mockAsyncFn);

      cachedAsyncFn('key', function(err, cachedVal) {
        cachedVal.should.eql(val);
        done();
      });
    });

    it("should cache the value after the first get and execute the callback", function(done) {
      var cache = asyncache();
      cache.get = sinon.stub();
      cache.get.callsArgWith(1, null, null);
      cache.set = sinon.stub();
      cache.set.callsArgWith(3, null);

      var key = 'sample-key';

      var cachedAsyncFn = cache.remember(mockAsyncFn);

      cachedAsyncFn(key, function(err, val) {
        var expectedVal = 'res-' + key;
        val.should.eql(expectedVal);
        cache.set.calledWith(key, expectedVal);
        done();
      });
    });
  });
});
