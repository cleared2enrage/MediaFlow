'use strict';

var DataProvider = require('./DataProvider.js');

var AppInitializer = (function () {
  var promise = null;

  var init = function () {
    if (!promise) {
      promise = Promise.all([
        DataProvider.init('data.json')
      ]);
    }

    return promise;
  };

  return {
    init: init
  };
})();

module.exports = AppInitializer;
