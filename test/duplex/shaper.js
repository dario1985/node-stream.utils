'use strict';

var StreamTest = require('streamtest')
  , Shaper     = require('../../').Shaper
  , should     = require('chai').should();

describe('Shaper', function() {

  StreamTest.versions.forEach(function(version) {
    describe('for ' + version + ' streams', function() {

      it('should work in NON objectMode', function(done) {
        var t0           = Date.now()
          , maxPerSecond = 25
          , shaper       = new Shaper({
          objectMode  : false,
          maxPerSecond: maxPerSecond
        });

        StreamTest[version].fromChunks(['I ', 'throttle ', 'good', ' chunked', ' buffers!'], 100)
          .pipe(shaper)
          .pipe(StreamTest[version].toText(function(err, text) {
            if (err) return done(err);
            text.should.be.equal('I throttle good chunked buffers!');
            (Date.now() - t0).should.be.least(Math.floor(text.length / maxPerSecond) * 1000);
            done();
          }));
      });

      it('should work in objectMode', function(done) {
        var t0           = Date.now()
          , maxPerSecond = 1500
          , reducer      = new Shaper({
          maxPerSecond: maxPerSecond
        })
          , biglist      = Array.apply(null, new Array(1000)).map(function(_, i) {
          return {value: i};
        });

        StreamTest[version].fromObjects(biglist.slice())
          .pipe(reducer)
          .pipe(StreamTest[version].toObjects(function(err, objects) {
            if (err) return done(err);
            objects.should.be.eqls(biglist);
            (Date.now() - t0).should.be.least(Math.floor(biglist.length / maxPerSecond) * 1000);
            done();
          }));
      });
    });
  });
});
