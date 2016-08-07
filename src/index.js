'use strict';

var $ = require('jquery');
var _ = require('lodash');
global.jQuery = $;
require('jquery.facedetection');
require('./MP3Player.js');
var delay = require('./utils/delay.js');

var AppInitializer = require('./AppInitializer.js');
var DataProvider = require('./DataProvider.js');
var LayoutBuilder = require('./LayoutBuilder');
var TweenMax = require('gsap');

(function() {
  AppInitializer.init().then(function() {
    var layoutBuilder = new LayoutBuilder();

    var getNextLayout = function () {
      var count = _.random(1, 4, false);
      var visuals = DataProvider.getNextVisuals(count);
      var testRects = layoutBuilder.generateLayout(visuals.length);

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
}());
