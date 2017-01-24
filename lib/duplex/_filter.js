'use strict';

var util      = require('util')
  , common    = require('./_common')
  , Transform = require('stream').Transform;

function FilterState() {
  this.total   = 0;
  this.dropped = 0;
}

function Filter(options) {
  if (!options || typeof options.criteria !== 'function')
    throw new TypeError('Invalid options. `criteria` should be a function');

  options = Object.assign({objectMode: true, highWaterMark: common.MAX_OBJECT_HIGHWATERMARK}, options);

  Transform.call(this, options);

  this._mergingState = new FilterState();
  this.criteriaFn    = options.criteria;
}

util.inherits(Filter, Transform);

module.exports = Filter;

Filter.prototype._transform = function(data, encoding, done) {
  var fs       = this._mergingState
    , criteria = this.criteriaFn;

  fs.total++;

  criteria.call(null, data, encoding, next);

  function next(err, truth) {
    if (!!err || !truth) fs.dropped++;
    if (err) return done(err);
    else if (!!truth) return done(null, data);
    else done();
  }
};
