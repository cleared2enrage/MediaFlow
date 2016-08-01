'use strict';

var delay = function(seconds) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve();
    }, seconds * 1000);
  });
};

module.exports = delay;
