'use strict';

var StreamTest = require('streamtest')
  , Filter     = require('../../').Filter
  , should     = require('chai').should();

describe('Filter', function() {
  StreamTest.versions.forEach(function(version) {
    describe('for ' + version + ' streams', function() {
      it('should work in NON objectMode', function(done) {
        var filter = new Filter({
          objectMode: false,
          criteria  : function(chunk, encoding, next) {
            next(null, chunk.indexOf('bad') === -1);
          }
        });

        StreamTest[version].fromChunks(['I ', 'badchunk', 'work', ' good'])
          .pipe(filter)
          .pipe(StreamTest[version].toText(function(err, text) {
            if (err) return done(err);
            text.should.be.equal('I work good');
            done();
          }));
      });

      it('should work in objectMode', function(done) {
        var filter = new Filter({
          criteria: function(chunk, _, next) {
            next(null, !chunk.bad);
          }
        });

        StreamTest[version].fromObjects([{msg: 'hello'}, {msg: 'bye bye', bad: true}])
          .pipe(filter)
          .pipe(StreamTest[version].toObjects(function(err, objects) {
            if (err) return done(err);
            objects.should.be.eqls([{msg: 'hello'}]);
            done();
          }));
      });
    });
  });
});
