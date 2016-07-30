'use strict';

var $ = require('jquery');
var AppInitializer = require('./AppInitializer.js');
var DataProvider = require('./DataProvider.js');
var TweenMax = require('gsap');

AppInitializer.init().then(function() {
  var container = $('#main');
  var audioPlayer = null;

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

  var onSongReady = function(song) {
    var triggered = false;
    if (audioPlayer == null) {
      audioPlayer = $('<audio>').attr({
        autoplay: true,
        preload: 'auto',
        volume: 0
      }).on('timeupdate', function() {
        if (!triggered && this.duration - this.currentTime < 5.25) {
          triggered = true;
          TweenMax.to(this, 5, {volume: 0});
        }
      }).on('ended', function() {
        triggered = false;
        changeSong();
      });
      audioPlayer[0].volume = 0;
      $('body').append(audioPlayer);
    }
    audioPlayer[0].pause();
    audioPlayer.attr({
      src: song.path
    });
    audioPlayer[0].play();
    TweenMax.to(audioPlayer, 5, { volume: 1 });
  };

  var changeSong = function() {
    DataProvider.getNextAudio().then(onSongReady);
  };

  container.on('transitionend', function() {
    $('.photo:not(.show)').remove();
  });

  changePhoto();
  changeSong();
}, function (message) {
  console.error(message);
});
