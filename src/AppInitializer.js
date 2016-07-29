'use strict';

var ImageProvider = require('./ImageProvider.js');

var AppInitializer = (function () {
  var init = function () {
    return Promise.all([
      ImageProvider.init('data.json')
    ]);
  };

  return {
    init: init
  };
})();

module.exports = AppInitializer;
