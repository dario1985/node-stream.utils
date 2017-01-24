'use strict';

var StreamTest = require('streamtest')
  , Reducer    = require('../../').Reducer
  , should     = require('chai').should();

describe('Reducer', function() {
  StreamTest.versions.forEach(function(version) {
    describe('for ' + version + ' streams', function() {
      it('should work in NON objectMode', function(done) {
        var reducer = new Reducer({
          objectMode: false,
          reduce    : function(state, chunk, encoding, next) {
            next(null, state + ' ' + chunk);
          }
        });

        StreamTest[version].fromChunks(['I', 'work', 'good'])
          .pipe(reducer)
          .pipe(StreamTest[version].toText(function(err, text) {
            if (err) return done(err);
            text.trim().should.be.equal('I work good');
            done();
          }));
      });

      it('should work in objectMode', function(done) {
        var reducer = new Reducer({
          memo  : '',
          reduce: function(state, chunk, _, next) {
            next(null, state + chunk.msg);
          }
        });

        StreamTest[version].fromObjects([{msg: 'hello'}, {msg: ' bye bye'}])
          .pipe(reducer)
          .pipe(StreamTest[version].toText(function(err, objects) {
            if (err) return done(err);
            objects.should.be.equal('hello bye bye');
            done();
          }));
      });
    });
  });
});
