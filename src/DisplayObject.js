'use strict';

var EventEmitter = require('eventemitter3');

var DisplayObject = function() {

};

DisplayObject.prototype = Object.create(EventEmitter.prototype);
DisplayObject.prototype.constructor = DisplayObject;
module.exports = DisplayObject;
