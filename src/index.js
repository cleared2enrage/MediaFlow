'use strict';

var $ = require('jquery');
var _ = require('lodash');
global.jQuery = $;
require('jquery.facedetection');
require('./MP3Player.js');
var delay = require('./utils/delay.js');

var AppInitializer = require('./AppInitializer.js');
var DataProvider = require('./DataProvider.js');
var TweenMax = require('gsap');
// var smartcrop = require('smartcrop');

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
  var generateRectangles = function(count) {
    var windowWidth = window.innerWidth,
      windowHeight = window.innerHeight,
      minWidth = Math.floor(windowWidth / 4),
      minHeight = Math.floor(windowHeight / 3),
      minAspectRatio = 1 / 2.5,
      maxAspectRatio = 2.5,
      rects = [],
      gapSize = 5;

    while (rects.length < count) {
      var numIterations = 0;
      rects = [{
        x: gapSize,
        y: gapSize,
        width: windowWidth - 2 * gapSize,
        height: windowHeight - 2 * gapSize
      }];

      while (rects.length < count && numIterations++ < 100) {

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
        } else { // Split Horizontally
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

      for (var i = 0; i < rects.length; i++) {
        var aspectRatio = rects[i].width / rects[i].height;
        if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
          rects = [];
          break;
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
  AppInitializer.init().then(function() {

    var getNextLayout = function () {
      var count = Math.floor(Math.random() * 4) + 1;
      var visuals = [];
      var testRects = [];

      visuals = DataProvider.getNextVisuals(count);
      testRects = window.Test.generateRectangles(visuals.length);

      visuals = _.sortBy(visuals, function(v) {
        return v.width / v.height;
      });

      testRects = _.sortBy(testRects, function(r) {
        return r.width / r.height;
      });

      var arr = _.map(_.range(visuals.length), function(i) {
        var visual = visuals[i];
        var rect = testRects[i];

        if (visual.type === 'video') {
          return new Promise(function(resolve) {
            var video = document.createElement('video');
            video.oncanplay = function() {
              video.oncanplay = null;
              resolve({
                type: 'video',
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                src: visual.path
              });
            };
            video.src = visual.path;
            video.load();
          });
        }

        return new Promise(function(rslv) {
          var image = null;

          return new Promise(function(resolve) {
            image = new Image();
            image.onload = function() {
              image.onload = null;
              resolve();
            };
            image.src = visual.path + '?width=' + rect.width + '&height=' + rect.height;
          }).then(function() {
            rslv({
              type: 'photo',
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              src: visual.path + '?width=' + rect.width + '&height=' + rect.height
            });
          });
        });
      });

      return Promise.all(arr);
    };

    var generateImageElements = function(images) {
      return _.map(images, function(image) {
        if (image.type === 'photo') {
          return $('<img>').attr({
            src: image.src
          }).css({
            position: 'absolute',
            left: image.x,
            top: image.y,
            width: image.width,
            height: image.height,
            opacity: 0
          })[0];
        } else {
          return $('<div>').css({
            position: 'absolute',
            left: image.x,
            top: image.y,
            width: image.width,
            height: image.height,
            opacity: 0,
            overflow: 'hidden'
          }).append($('<video>').attr({
            preload: 'auto',
            controls: false,
            muted: true,
            src: image.src
          }).css({
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%'
          }))[0];
        }
      });
    };

    var fadeImages = function (images, targetOpacity) {
      return new Promise(function(resolve) {
        TweenMax.staggerTo(_.shuffle(images), 1, {css: {opacity: targetOpacity}, onStart: function() {
          if (this.target.tagName !== 'IMG' && this.vars.css.opacity === 1) {
            this.target.children[0].play();
          }
        }}, 1 / images.length, function() {
          resolve(images);
        });
      });
    };

    var getShowCompletePromise = function(elements) {
      return Promise.all(_.map(elements, function(element) {
        if (element.tagName === 'IMG') {
          return delay(4);
        }

        var video = element.children[0];
        return new Promise(function(resolve) {
          video.onended = function() {
            video.onended = null;
            resolve();
          };
        });
      }));
    };

    var visibleImages = null;
    var showComplete = Promise.resolve();

    var renderLoop = function() {
      Promise.all([
        getNextLayout(),
        showComplete,
      ]).then(function(results) {
        var images = results[0];
        var imageNodes = generateImageElements(images);

        $('#main').append(imageNodes);

        var step1;
        if (visibleImages != null) {
          step1 = fadeImages(visibleImages, 0).then(function(oldImages) {
            $(oldImages).remove();
          });
        } else {
          step1 = Promise.resolve();
        }

        step1.then(function() {
          return fadeImages(imageNodes, 1).then(function(newImages) {
            visibleImages = newImages;
            showComplete = getShowCompletePromise(newImages);
          });
        }).then(function() {
          renderLoop();
        });
      });
    };

    renderLoop();
  });
};
