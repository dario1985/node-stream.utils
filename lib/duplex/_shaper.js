'use strict';

var util      = require('util')
  , utils     = require('../_utils')
  , common    = require('./_common')
  , Transform = require('stream').Transform;

module.exports = Shaper;

util.inherits(Shaper, Transform);

function ShaperState(options) {
  this.bucket = options.objectMode ? new utils.ObjectBucket() : new utils.BufferBucket();

  this.draining  = false;
  this.lastDrain = Date.now();

  this.maxPerSecond = options.maxPerSecond || 65536;
  this.lowWaterMark = options.lowWaterMark || (this.maxPerSecond / 5 | 0) || 1;

  if (options.objectMode)
    this.chunkSize = options.chunkSize || this.maxPerSecond;
  else
    this.chunkSize = options.chunkSize || (this.maxPerSecond / 10 | 0) || 1;
}

function Shaper(options) {
  options = Object.assign({objectMode: true, highWaterMark: common.MAX_OBJECT_HIGHWATERMARK}, options);

  Transform.call(this, options);

  this._shapingState = new ShaperState(options);
}

Shaper.prototype._transform = function _transform(data, encoding, done) {
  var st = this._shapingState;

  if (common.isNullOrUndefined(data))
    return done();

  st.bucket.push(data);

  if (!st.draining && st.bucket.length >= st.lowWaterMark) this._drain(done);
  else done();
};

Shaper.prototype._flush = function _flush(done) {
  this._drain(done);
};

Shaper.prototype._drain = function _drain(done) {
  var st    = this._shapingState
    , _this = this
    , buf;

  if (st.draining) throw new Error('Already draining!');

  buf = st.bucket.drain();

  if (!buf.length) return done();

  st.draining = true;

  var start = 0;
  process.nextTick(drain);

  function drain() {
    var timeElapsed = Date.now() - st.lastDrain
      , maxToDrain  = Math.min(buf.length, start + st.chunkSize, start + Math.ceil(st.maxPerSecond * timeElapsed / 1000))
      , wait        = Math.floor((maxToDrain - start) * 100 / st.maxPerSecond) * 10 || 1;

    if (Buffer.isBuffer(buf)) {
      _this.push(buf.slice(start, maxToDrain));
    } else {
      for (var i = start; i < maxToDrain; i++) _this.push(buf[i]);
    }

    start        = maxToDrain;
    st.lastDrain = Date.now();

    if (buf.length > maxToDrain) setTimeout(drain, wait);
    else {
      setTimeout(function() {
        st.draining = false;
        done();
      }, wait);
    }
  }
};
