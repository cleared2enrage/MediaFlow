'use strict';

var $ = require('jquery');

var DataProvider = (function () {
  var images = null,
    audio = null,
    groupIndex = 0,
    imageIndex = 0,
    audioIndex = 0,

    advanceImageIndexes = function () {
      imageIndex = (imageIndex + 1) % images[groupIndex].length;
      if (imageIndex === 0) {
        groupIndex = (groupIndex + 1) % images.length;
      }
    },

    advanceAudioIndex = function() {
      audioIndex = (audioIndex  + 1) % audio.length;
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

    getNextAudio = function() {
      var song = audio[audioIndex];
      advanceAudioIndex();
      return new Promise(function (resolve) {
        $.get(song.path, function() {
          resolve(song);
        });
      });
    },

    init = function (dataFilePath) {
      return new Promise(function(resolve) {
        $.getJSON(dataFilePath, function (data) {
          images = data.visual;
          audio = data.audio;
          resolve();
        });
      });
    };

  return {
    getNextImage: getNextImage,
    getNextAudio: getNextAudio,
    init: init
  };
})();

module.exports = DataProvider;
