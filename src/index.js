'use strict';

require('./MP3Player.js');

var AppInitializer = require('./AppInitializer.js');
var MediaFlow = require('./MediaFlow.js');

AppInitializer.init().then(function() {
  new MediaFlow();
});
