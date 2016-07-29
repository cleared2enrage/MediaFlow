'use strict';

var $ = require('jquery');

var ImageProvider = (function () {
  var images = null,
    groupIndex = 0,
    imageIndex = 0,

    advanceImageIndexes = function () {
      imageIndex = (imageIndex + 1) % images[groupIndex].length;
      if (imageIndex === 0) {
        groupIndex = (groupIndex + 1) % images.length;
      }
    },

    getNextImage = function () {
      var image = images[groupIndex][imageIndex];
      advanceImageIndexes();
      return new Promise(function (resolve) {
        $.get(image.path, function() {
          resolve(image);
        });
      });
    },

    init = function (dataFilePath) {
      return new Promise(function(resolve) {
        $.getJSON(dataFilePath, function (data) {
          images = data;
          resolve();
        });
      });
    };

  return {
    getNextImage: getNextImage,
    init: init
  };
})();

module.exports = ImageProvider;
