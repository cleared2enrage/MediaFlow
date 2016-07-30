'use strict';

var $ = require('jquery');
// var EventEmitter = require('eventemitter3');

var Photo = function(data) {
  this._data = data;
};

Photo.prototype = Object.create(Photo.prototype);
Photo.prototype.constructor = Photo;
module.exports = Photo;

Photo.prototype.render = function() {
  return $('<div>').attr({
    'class': 'photo'
  }).append($('<img>').attr({
    src: this.data.path
  }));
};

Photo.prototype.onAdded = function() {
  // TODO: Add logic here to determine when the asset is ready for display

  this.emit('added');
};

Photo.prototype.onReady = function() {


  this.emit('ready');
};

Photo.prototype.show = function() {

};

Photo.prototype.onShowComplete = function() {
  // TODO: Is there anything to do here?

  this.emit('showcomplete');
};

// TODO: Is there anything we need to do to let the parent know that we no longer
// need to be displayed? or is this something that should be handled by some other object

Photo.prototype.hide = function() {

};

Photo.prototype.onHideComplete = function() {
  // TODO: Is there anything to do here?

  this.emit('showcomplete');
};

Photo.prototype.onRemoved = function() {

  this.emit('removed');
};

Photo.prototype.destroy = function() {

};
