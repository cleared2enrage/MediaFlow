'use strict';

var Rectangle = function(x, y, width, height) {
  this._x = x || 0;
  this._y = y || 0;
  this._width = width || 0;
  this._height = height || 0;
};

module.exports = Rectangle;

Object.defineProperties(Rectangle.prototype, {
  x: {
    get: function() {
      return this._x;
    }
  },
  y: {
    get: function() {
      return this._y;
    }
  },
  width: {
    get: function() {
      return this._width;
    }
  },
  height:
  {
    get: function() {
      return this._height;
    }
  },
  aspectRatio:
  {
    get: function() {
      return this._width / this._height;
    }
  }
});
