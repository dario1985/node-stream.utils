'use strict';

exports.Mapper  = require('./duplex/_mapper');
exports.Shaper  = require('./duplex/_shaper');
exports.Filter  = require('./duplex/_filter');
exports.Reducer = require('./duplex/_reducer');

exports.Executor  = require('./writers/_executer');
exports.BlackHole = require('./writers/_blackhole');
