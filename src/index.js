'use strict';

var $ = require('jquery');
var AppInitializer = require('./AppInitializer.js');
var DataProvider = require('./DataProvider.js');
var TweenMax = require('gsap');
window.$ = $;

window.run = function() {
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
};


window.Test = (function() {
  var generateRectangles = function() {
    var windowWidth = window.innerWidth, // TODO: change to innerWidth
      windowHeight = window.innerHeight, // TODO: change to innerHeight
      minWidth = Math.floor(windowWidth / 4),
      minHeight = Math.floor(windowHeight / 3),
      rects = [],
      numRects = Math.floor(Math.random() * 5) + 1,
      gapSize = 5;

    while (rects.length < numRects) {
      var numIterations = 0;
      rects = [{
        x: gapSize,
        y: gapSize,
        width: windowWidth - 2 * gapSize,
        height: windowHeight - 2 * gapSize
      }];

      while (rects.length < numRects && numIterations++ < 100) {

        // Pick rectangle at random
        var index = Math.floor(Math.random() * rects.length);
        var rectangle = rects[index];

        // Split rectangle at random
        if (Math.random() < 0.5) { // Split vertically
          if (rectangle.height < minHeight * 2 + gapSize) {
            continue;
          }

          var randomHeight = Math.floor(Math.random() * (rectangle.height - 2 * minHeight)) + minHeight;

          rects.splice(index, 1, {
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: randomHeight
          }, {
            x: rectangle.x,
            y: rectangle.y + randomHeight + gapSize,
            width: rectangle.width,
            height: rectangle.height - randomHeight - gapSize
          });
        } else {
          if (rectangle.width < minWidth * 2 + gapSize) {
            continue;
          }

          var randomWidth = Math.floor(Math.random() * (rectangle.width - 2 * minWidth)) + minWidth;

          rects.splice(index, 1, {
            x: rectangle.x,
            y: rectangle.y,
            width: randomWidth,
            height: rectangle.height
          }, {
            x: rectangle.x + randomWidth + gapSize,
            y: rectangle.y,
            width: rectangle.width - randomWidth - gapSize,
            height: rectangle.height
          });
        }
      }
    }
    return rects;
  };
  return {
    generateRectangles: generateRectangles
  };
}());

window.rectangleTest = function() {
  var testRects = window.Test.generateRectangles();

  for (var i = 0; i < testRects.length; i++) {
    var rect = testRects[i];

    $('#main').append($('<div>').css({
      width: rect.width,
      height: rect.height,
      backgroundColor: 'red',
      position: 'absolute',
      top: rect.y,
      left: rect.x,
    }));
  }
};
