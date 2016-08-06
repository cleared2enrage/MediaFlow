'use strict';

var $ = require('jquery');
var _ = require('lodash');

var DataProvider = (function () {
  var data = null,
    groupIndex = 0,
    audioIndex = 0,
    photoIndex = 0,
    videoIndex = 0,

    _shuffleGroupVisuals = function() {
      var group = data.visual[groupIndex];
      group.photos = _.shuffle(group.photos);
      group.videos = _.shuffle(group.videos);
    },

    _shouldAdvanceGroupIndex = function() {
      return (photoIndex <= 0 && videoIndex <= 0);
    },

    _advanceGroupIndex = function() {
      _shuffleGroupVisuals();

      groupIndex = (groupIndex + 1) % data.visual.length;
      photoIndex = data.visual[groupIndex].photos.length;
      videoIndex = data.visual[groupIndex].videos.length;
    },

    _shouldIncludeVideo = function () {
      return (Math.random() < videoIndex / (videoIndex + photoIndex));
    },

    _areVideosRemaining = function() {
      return videoIndex > 0;
    },

    _arePhotosRemaining = function() {
      return photoIndex > 0;
    },

    _getNextPhoto = function() {
      return data.visual[groupIndex].photos[--photoIndex];
    },

    _getNextVideo = function() {
      return data.visual[groupIndex].videos[--videoIndex];
    },

    getNextSong = function() {
      var song = data.audio[audioIndex++];
      audioIndex %= data.audio.length;
      return song;
    },

    getNextVisuals = function(count) {
      var results = [],
        selectPhotos = true;

      if (_areVideosRemaining() && _shouldIncludeVideo()) {
        var video = _getNextVideo();
        results.push(video);
        count--;

        if (video.duration > 15) {
          selectPhotos = false;
        }
      }

      while (selectPhotos && _arePhotosRemaining() && count > 0) {
        results.push(_getNextPhoto());
        count--;
      }

      if (_shouldAdvanceGroupIndex()) {
        _advanceGroupIndex();
      }

      return results;
    },

    init = function (dataFilePath) {
      return new Promise(function(resolve) {
        $.getJSON(dataFilePath, function (result) {
          data = result;

          data.audio = _.shuffle(data.audio);
          data.visual = _.map(data.visual, function(group) {
            return {
              photos: _.shuffle(group.photos),
              videos: _.shuffle(group.videos)
            };
          });

          photoIndex = data.visual[groupIndex].photos.length;
          videoIndex = data.visual[groupIndex].videos.length;

          resolve();
        });
      });
    };

  return {
    getNextSong: getNextSong,
    getNextVisuals: getNextVisuals,
    init: init
  };
})();

module.exports = DataProvider;
