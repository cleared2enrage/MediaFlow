'use strict';

var MAX_VISUALS_PER_SLIDE = 4;

var $ = require('jquery');
var _ = require('lodash');
global.jQuery = $;
require('jquery.facedetection');
require('./MP3Player.js');
var delay = require('./utils/delay.js');

var DataProvider = require('./DataProvider.js');
var LayoutBuilder = require('./LayoutBuilder');
var TweenMax = require('gsap');

var MediaFlow = function() {
  this._currentVisuals = null;
  this._showCompletePromise = Promise.resolve();
  this._layoutBuilder = new LayoutBuilder();

  this._renderNextSlide();
};

module.exports = MediaFlow;

MediaFlow.prototype._prepareNextSlide = function() {
  var count = _.random(1, MAX_VISUALS_PER_SLIDE, false);
  var visuals = DataProvider.getNextVisuals(count);
  var layoutRects = this._layoutBuilder.generateLayout(visuals.length);

  visuals = _.sortBy(visuals, function(v) { return v.width / v.height; });
  layoutRects = _.sortBy(layoutRects, 'aspectRatio');

  return _.zipWith(visuals, layoutRects, function(visual, rect) {
    return {
      type: visual.type,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      src: visual.type === 'photo'
        ? visual.path + '?width=' + rect.width + '&height=' + rect.height
        : visual.path
    };
  });
};

MediaFlow.prototype._preloadNextSlide = function(visuals) {
  return Promise.all(_.map(visuals, MediaFlow.prototype._preloadVisual.bind(this)));
};

MediaFlow.prototype._preloadVisual = function(visual) {
  switch (visual.type) {
  case 'photo':
    return this._preloadPhoto(visual);
  case 'video':
    return this._preloadVideo(visual);
  default:
    return Promise.reject('Unsupported Visual Type: ' + visual.type);
  }
};

MediaFlow.prototype._preloadPhoto = function(photo) {
  return new Promise(function(resolve) {
    var element = new Image();
    element.onload = function() {
      element.onload = null;
      resolve(photo);
    };
    element.src = photo.src;
  });
};

MediaFlow.prototype._preloadVideo = function(video) {
  return new Promise(function(resolve) {
    var element = document.createElement('video');
    element.oncanplay = function() {
      element.oncanplay = null;
      resolve(video);
    };
    element.src = video.src;
    element.load();
  });
};

MediaFlow.prototype._createElementsForSlide = function(visuals) {
  return _.map(visuals, MediaFlow.prototype._createElementForVisual.bind(this));
};

MediaFlow.prototype._createElementForVisual = function(visual) {
  switch (visual.type) {
  case 'photo':
    return this._createElementForPhoto(visual);
  case 'video':
    return this._createElementForVideo(visual);
  }
};

MediaFlow.prototype._createElementForPhoto = function(photo) {
  return $('<img>').attr({
    src: photo.src
  }).css({
    position: 'absolute',
    left: photo.x,
    top: photo.y,
    width: photo.width,
    height: photo.height,
    opacity: 0
  })[0];
};

MediaFlow.prototype._createElementForVideo = function(video) {
  return $('<div>').css({
    position: 'absolute',
    left: video.x,
    top: video.y,
    width: video.width,
    height: video.height,
    opacity: 0,
    overflow: 'hidden'
  }).append($('<video>').attr({
    preload: 'auto',
    controls: false,
    muted: true,
    src: video.src
  }).css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '100%',
    minHeight: '100%'
  }))[0];
};

MediaFlow.prototype._appendSlideVisualsToContainer = function(elements) {
  $('#main').append(elements);
  return elements;
};

MediaFlow.prototype._fadeVisualElements = function(elements, targetOpacity) {
  return new Promise(function(resolve) {
    TweenMax.staggerTo(_.shuffle(elements), 1, {css: {opacity: targetOpacity}, onStart: function() {
      if (this.target.tagName !== 'IMG' && this.vars.css.opacity === 1) {
        this.target.children[0].play();
      }
    }}, 1 / elements.length, function() {
      resolve(elements);
    });
  });
};

MediaFlow.prototype._transitionOutPreviousSlide = function(elements) {
  if (this._currentVisuals != null) {
    return this._fadeVisualElements(this._currentVisuals, 0).then(function(oldElements) {
      $(oldElements).remove();
      return elements;
    });
  }
  return elements;
};

MediaFlow.prototype._transitionToNextSlide = function(elements) {
  return this._fadeVisualElements(elements, 1).then(function(newElements) {
    this._currentVisuals = newElements;
    this._showCompletePromise = this._getShowCompletePromise(newElements);
  }.bind(this));
};

MediaFlow.prototype._getShowCompletePromise = function(elements) {
  return Promise.all(_.map(elements, function(element) {
    if (element.tagName === 'IMG') {
      return delay(4); // TODO: Extract constant
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

MediaFlow.prototype._renderNextSlide = function() {
  Promise.resolve()
    .then(MediaFlow.prototype._prepareNextSlide.bind(this))
    .then(function(visuals) {
      return Promise.all([
        this._preloadNextSlide(visuals),
        this._showCompletePromise
      ]).then(function(results) {
        return results[0];
      });
    }.bind(this))
    .then(MediaFlow.prototype._createElementsForSlide.bind(this))
    .then(MediaFlow.prototype._appendSlideVisualsToContainer.bind(this))
    .then(MediaFlow.prototype._transitionOutPreviousSlide.bind(this))
    .then(MediaFlow.prototype._transitionToNextSlide.bind(this))
    .then(MediaFlow.prototype._renderNextSlide.bind(this));
};
