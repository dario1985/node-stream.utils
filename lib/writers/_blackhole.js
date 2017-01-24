'use strict';

var Writable = require('stream').Writable
  , util     = require('util');

util.inherits(BlackHole, Writable);

function BlackHole(options) {
  Writable.call(this, options);

  this._write  = blackhole;
  this._writev = blackhole;

  function blackhole() {
    process.nextTick(arguments[arguments.length - 1]);
  }
}
