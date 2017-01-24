'use strict';

var StreamTest = require('streamtest')
  , Mapper     = require('../../').Mapper
  , should     = require('chai').should();

describe('Mapper', function() {
  StreamTest.versions.forEach(function(version) {
    describe('for ' + version + ' streams', function() {
      it('should work in NON objectMode', function(done) {
        var mapper = new Mapper({
          objectMode: false,
          map       : function(chunk, encoding, next) {
            next(null, chunk + ' ');
          }
        });

        StreamTest[version].fromChunks(['I', 'work', 'good'])
          .pipe(mapper)
          .pipe(StreamTest[version].toText(function(err, text) {
            if (err) return done(err);
            text.trim().should.be.equal('I work good');
            done();
          }));
      });

      it('should work in objectMode', function(done) {
        var mapper = new Mapper({
          map: function(chunk, _, next) {
            next(null, new Buffer(chunk.msg));
          }
        });

        StreamTest[version].fromObjects([{msg: 'hello'}, {msg: ' bye bye'}])
          .pipe(mapper)
          .pipe(StreamTest[version].toText(function(err, objects) {
            if (err) return done(err);
            objects.should.be.equal('hello bye bye');
            done();
          }));
      });
    });
  });
});
