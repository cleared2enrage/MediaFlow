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

  var showPhoto = function () {
    $('.photo').toggleClass('show');
  };

  var onPhotoReady = function (image) {
    var newPhoto = createPhoto(image);
    container.append(newPhoto);
    setTimeout(showPhoto, 250);
    setTimeout(changePhoto, 4000);
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
