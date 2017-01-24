'use strict';

var util        = require('util')
  , common      = require('./_common')
  , slice       = Array.prototype.slice
  , PassThrough = require('stream').PassThrough;

function MergingState(options) {
  this.pendingStreams = options.streams || [];
  this.streams        = [];
  this.merging        = false;
}

function Merger(options) {
  options = Object.assign({objectMode: true, highWaterMark: common.MAX_OBJECT_HIGHWATERMARK}, options);

  PassThrough.call(this, options);

  this._mergingState = new MergingState(options);
}

util.inherits(Merger, PassThrough);

module.exports = Merger;

Merger.prototype.add = function addStream() {
  var ms = this._mergingState;

  for (var i = 0, len = arguments.length; i < len; i++) {
    ms.pendingStreams.push(pauseStreams(arguments[i], options))
  }

  return this._merge();
};

Merger.prototype._merge = function mergeStream(merger) {
  var _this = this
    , ms    = merger._mergingState;

  if (ms.merging) return this;

  ms.merging = true;
  ms.streams = ms.pendingStreams.shift();

  if (!ms.streams) return endStream();

  if (!Array.isArray(ms.streams)) ms.streams = [streams];

  var pipesCount = streams.length++;

  function next() {
    if (--pipesCount > 0) return;
    ms.merging = false;
    _this._merge();
  }

  function pipe(stream) {
    function onend() {
      stream
        .removeListener('unpipe-end', onend)
        .removeListener('finish', onend)
        .removeListener('end', onend);
      next();
    }

    // skip ended stream
    if (stream._readableState.endEmitted) return next();

    stream
      .on('unpipe-end', onend)
      .on('finish', onend)
      .on('end', onend)
      .pipe(_this, {end: false});

    // compatible for old stream
    stream.resume()
  }

  ms.streams.map(pipe);

  next()
};

function endStream() {
  var ms     = merger._mergingState;
  ms.merging = false
  // emit 'queueDrain' when all streams merged.
  this.emit('queueDrain');
  return doEnd && mergedStream.end()
}

mergedStream.setMaxListeners(0)
mergedStream.add = addStream
mergedStream.on('unpipe', function(stream) {
  stream.emit('unpipe-end')
})

if (args.length) addStream.apply(null, args)
return mergedStream
}

// check and pause streams for pipe.
function pauseStreams(streams, options) {
  if (!Array.isArray(streams)) {
    // Backwards-compat with old-style streams
    if (!streams._readableState && streams.pipe) streams = streams.pipe(PassThrough(options))
    if (!streams._readableState || !streams.pause || !streams.pipe) {
      throw new Error('Only readable stream can be merged.')
    }
    streams.pause()
  } else {
    for (var i = 0, len = streams.length; i < len; i++) streams[i] = pauseStreams(streams[i])
  }
  return streams
}