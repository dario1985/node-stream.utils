'use strict';

var util      = require('util')
  , common    = require('./_common')
  , Transform = require('stream').Transform;

function Reducer(options) {
  if (!options || typeof options.reduce !== 'function')
    throw new TypeError('Invalid options. `reduce` should be a function');

  options = Object.assign({objectMode: true, highWaterMark: common.MAX_OBJECT_HIGHWATERMARK}, options);

  Transform.call(this, options);

  this._reduceFn = options.reduce;
  this._splitted = !!options.split;
  this._result   = options.memo;
}

util.inherits(Reducer, Transform);

module.exports = Reducer;

Reducer.prototype._transform = function(data, encoding, done) {
  var _this = this;

  if (this._result === undefined) return next(null, data);
  this._reduceFn.call(null, this._result, data, encoding, next);

  function next(err, result) {
    if (err) return done(err);

    _this._result = result;
    done();
  }
};

Reducer.prototype._flush = function(done) {
  if (this._splitted) {
    var keys = Object.keys(this._result);
    for (var i = 0; i < keys.length; i++) {
      this.push(this._result[keys[i]]);
    }
  } else this.push(this._result);
  delete this._result;
  done();
};
