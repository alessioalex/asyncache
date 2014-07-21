"use strict";

var should = require('should');
var sinon = require('sinon');

var utils = require('../lib/utils');

describe('utils', function() {
  describe('.exists', function() {
    it('should return false for nully values', function() {
      var exists = utils.exists;
      var undef;

      exists(0).should.be.true;
      exists('').should.be.true;
      exists(null).should.be.false;
      exists(undef).should.be.false;
    });
  });

  describe('.getHash', function() {
    var getHash = utils.getHash;

    it('should return the key if present', function() {
      var key = 'sample-key';

      getHash(key).should.eql(key);
    });

    it('should return the string version for args if key is missing', function() {
      var args = ['array', 'of', 'args'];
      getHash(null, args).should.eql(args.toString());
    });

    it('should add a prefix when present', function() {
      var prefix = 'pre';
      var key = 'sample-key';
      var args = ['array', 'of', 'args'];

      getHash(key, null, prefix).should.match(/^pre/);
      getHash(null, args, prefix).should.match(/^pre/);
    });
  });

  describe('.callFunctions', function() {
    it('should call all the functions in the array with the args', function() {
      var callFunctions = utils.callFunctions;

      var args = [0, 1, 2];
      var fns = [];
      fns.push(sinon.spy());
      fns.push(sinon.spy());

      callFunctions(fns, args);

      fns.forEach(function(fn) {
        fn.calledWith(0, 1, 2).should.be.true;
      });
    });
  });
});
