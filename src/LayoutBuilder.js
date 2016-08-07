'use strict';

var GAP_SIZE = 5;
var DEFAULTS = {
  width: 'auto',
  height: 'auto',
  minWidth: 'auto',
  minHeight: 'auto',
  maxAspectRatio: 2.5
};

var _ = require('lodash');

var Rectangle = require('./objects/Rectangle.js');

var LayoutBuilder = function(options) {
  var opts = _.assignIn({}, DEFAULTS, options || {});

  this._width = opts.width;
  this._height = opts.height;
  this._minWidth = opts.minWidth;
  this._minHeight = opts.minHeight;
  this._minAspectRatio = 1 / opts.maxAspectRatio;
  this._maxAspectRatio = opts.maxAspectRatio;
};

module.exports = LayoutBuilder;

LayoutBuilder.prototype._getWidth = function() {
  if (this._width === 'auto') {
    return window.innerWidth;
  }
  return this._width;
};

LayoutBuilder.prototype._getHeight = function() {
  if (this._height === 'auto') {
    return window.innerHeight;
  }
  return this._height;
};

LayoutBuilder.prototype._getMinWidth = function() {
  if (this._minWidth === 'auto') {
    return _.floor(this._getWidth() / 4);
  }
  return this._minWidth;
};

LayoutBuilder.prototype._getMinHeight = function() {
  if (this._minHeight === 'auto') {
    return _.floor(this._getHeight() / 3);
  }
  return this._minHeight;
};

LayoutBuilder.prototype._splitRectangle = function(rect) {

  var splitVertically = !!_.random(1, false);

  var minDimension = splitVertically
    ? this._getMinHeight()
    : this._getMinWidth();

  var maxDimension = splitVertically
    ? rect.height - minDimension - GAP_SIZE
    : rect.width - minDimension - GAP_SIZE;

  var randomLength = _.random(minDimension, maxDimension, false);

  if (splitVertically) {
    return [
      new Rectangle(
        rect.x,
        rect.y,
        rect.width,
        randomLength
      ),
      new Rectangle(
        rect.x,
        rect.y + randomLength + GAP_SIZE,
        rect.width,
        rect.height - randomLength - GAP_SIZE
      )
    ];
  } else {
    return [
      new Rectangle(
        rect.x,
        rect.y,
        randomLength,
        rect.height
      ),
      new Rectangle(
        rect.x + randomLength + GAP_SIZE,
        rect.y,
        rect.width - randomLength - GAP_SIZE,
        rect.height
      )
    ];
  }
};

LayoutBuilder.prototype._isValidLayout = function(rects) {
  var that = this;
  return _.every(rects, function(rect) {
    return (rect.aspectRatio >= that._minAspectRatio && rect.aspectRatio <= that._maxAspectRatio);
  });
};

LayoutBuilder.prototype.generateLayout = function(count) {
  var rects = [
    new Rectangle(
      GAP_SIZE,
      GAP_SIZE,
      this._getWidth() - 2 * GAP_SIZE,
      this._getHeight() - 2 * GAP_SIZE
    )
  ];

  while (rects.length < count) {
    var rectToSplit = rects.splice(_.random(rects.length - 1, false), 1)[0];
    rects = rects.concat(this._splitRectangle(rectToSplit));
  }

  if (!this._isValidLayout(rects)) {
    return this.generateLayout(count);
  }
  return rects;
};
