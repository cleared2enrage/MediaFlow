'use strict';

var $ = require('jquery');
var AppInitializer = require('./AppInitializer.js');
var DataProvider = require('./DataProvider.js');

AppInitializer.init().then(function() {
  var container = $('#main');

  var createPhoto = function (image) {
    return $('<div>').attr({
      'class': 'photo'
    }).append($('<img>').attr({
      src: image.path
    }));
  };

  var createVideo = function (video) {
    return $('<div>').attr({
      'class': 'photo'
    }).append($('<video>').attr({
      muted: true,
      preload: 'auto',
      src: video.path,
      autoplay: true
    }));
  };

  var showPhoto = function () {
    $('.photo').toggleClass('show');
  };

  var onPhotoReady = function (image) {
    var newMedia = image.type === 'photo'
      ? createPhoto(image)
      : createVideo(image);

    container.append(newMedia);
    setTimeout(showPhoto, 250);

    if (image.type === 'photo') {
      setTimeout(changePhoto, 4000);
    } else {
      var triggered = false;
      $('video', newMedia).on('timeupdate', function() {
        console.log(triggered, this.duration, this.currentTime, this.duration - this.currentTime);
        if (!triggered && this.duration - this.currentTime < 1.25) {
          triggered = true;
          changePhoto();
        }
      });
    }
  };

  var changePhoto = function () {
    DataProvider.getNextImage().then(onPhotoReady);
  };

  container.on('transitionend', function() {
    $('.photo:not(.show)').remove();
  });

  changePhoto();
}, function (message) {
  console.error(message);
});
