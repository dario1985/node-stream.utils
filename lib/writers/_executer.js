'use strict';

var Writable = require('stream').Writable
  , util     = require('util');

util.inherits(Executer, Writable);

function Executer(options) {
  if (!options || typeof options.execute !== 'function')
    throw new TypeError('Invalid options. `execute` should be a function');

  options.objectMode    = true;
  options.highWaterMark = options.highWaterMark || 256;
  options.parallel      = options.parallel === undefined || !!options;

  Writable.call(this, options);

  this._write = options.execute.bind(null);

  if (options.parallel) {
    this._writev = function(chunks, callback) {
      async.map(chunks, function(chunk, next) {
        write.call(null, chunk.chunk, null, next);
      }, callback);
    };
  }
}
