'use strict';

var DataProvider = require('./DataProvider.js');

var AppInitializer = (function () {
  var init = function () {
    return Promise.all([
      DataProvider.init('data.json')
    ]);
  };

  return {
    init: init
  };
})();

module.exports = AppInitializer;
