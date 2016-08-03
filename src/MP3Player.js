'use strict';

var AppInitializer = require('./AppInitializer.js');
var DataProvider = require('./DataProvider.js');
var TweenMax = require('gsap');

var audioElement = null,
  fadeOutTriggered = false,

  createAudioElement = function() {
    audioElement = document.createElement('audio');
    audioElement.autoplay = false;
    audioElement.preload = 'auto';
    audioElement.volume = 0;

    audioElement.addEventListener('timeupdate', onTimeUpdate);
    audioElement.addEventListener('ended', onEnded);
  },

  loadNextSong = function() {
    var song = DataProvider.getNextSong();

    audioElement.pause();
    audioElement.src = song.path;
    audioElement.play();

    fadeIn();
  },

  fadeIn = function() {
    TweenMax.to(audioElement, 5, {volume: 1});
  },

  fadeOut = function() {
    TweenMax.to(audioElement, 5, {volume: 0});
  },

  onEnded = function() {
    fadeOutTriggered = false;
    loadNextSong();
  },

  onTimeUpdate = function() {
    if (!fadeOutTriggered && audioElement.duration - audioElement.currentTime < 5) { // TODO: Extend to configuration
      fadeOutTriggered = true;
      fadeOut();
    }
  },

  start = function() {
    createAudioElement();
    document.body.appendChild(audioElement);
    loadNextSong();
  };

AppInitializer.init().then(start);
