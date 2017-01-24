'use strict';

exports.EMWA = EMWA;

function EMWA(timePeriod, tickInterval) {
  this._timePeriod   = timePeriod || 60000; // 1 Minute
  this._tickInterval = tickInterval || 5000; // 5 Seconds
  this._alpha        = 1 - Math.exp(-this._tickInterval / this._timePeriod);
  this._count        = 0;
  this._rate         = 0;
}

EMWA.prototype.upd = function(n) {
  this._count += n;
};

EMWA.prototype.tick = function() {
  var instantRate = this._count / this._tickInterval;
  this._count     = 0;

  this._rate += (this._alpha * (instantRate - this._rate));
};

EMWA.prototype.rate = function(timeUnit) {
  return (this._rate || 0) * timeUnit;
};

exports.ObjectBucket = ObjectBucket;
exports.BufferBucket = BufferBucket;

function ObjectBucket() {
  this._buffers = [];
}

ObjectBucket.prototype = {
  push: function(obj) {
    return this._buffers.push(obj);
  },

  drain: function() {
    var ret       = this._buffers;
    this._buffers = [];
    return ret;
  },

  get length() {
    return this._buffers.length;
  }
};

function BufferBucket() {
  this._length  = 0;
  this._buffers = [];
}

BufferBucket.prototype = {
  push: function(buf) {
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('Tried to push a non-buffer');
    }

    this._length += buf.length;
    this._buffers.push(buf);
  },

  drain: function() {
    var ret       = Buffer.concat(this._buffers, this._length);
    this._buffers = [];
    this._length  = 0;
    return ret;
  },

  get length() {
    return this._length;
  }
};
