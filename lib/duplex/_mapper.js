'use strict';

var util      = require('util')
  , common    = require('./_common')
  , Transform = require('stream').Transform;

function Mapper(options) {
  if (!options || typeof options.map !== 'function')
    throw new TypeError('Invalid options. `map` should be a function');

  options = Object.assign({objectMode: true, highWaterMark: common.MAX_OBJECT_HIGHWATERMARK}, options);

  Transform.call(this, options);

  this._mapFn = options.map;
}

util.inherits(Mapper, Transform);

module.exports = Mapper;

Mapper.prototype._transform = function(data, encoding, done) {
  this._mapFn.call(null, data, encoding, done);
};
