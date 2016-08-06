'use strict';

var _ = require('lodash');
var gm = require('gm');
var serveStatic = require('serve-static');
var smartcrop = require('smartcrop-gm');
var url = require('url');

module.exports = {
  options: {
    port: '8000',
    base: 'app',
    hostname: 'localhost',
    livereload: true,
    open: false,
    middleware: [
      function(req, res, next) {
        var urlObj = url.parse(req.url, true);
        if (_.startsWith(urlObj.pathname, '/media/visual') && _.endsWith(urlObj.pathname, '.jpg')) {
          var query = urlObj.query || {};
          if (query.width && query.height) {
            var width = query.width;
            var height = query.height;
            var image = './app' + urlObj.pathname;

            smartcrop.crop(image, {width: width, height: height}).then(function(result) {
              var crop = result.topCrop;
              gm(image)
                .crop(crop.width, crop.height, crop.x, crop.y)
                .resize(width, height)
                .stream()
                .pipe(res);
            });
          }
          return;
        }

        next();
      },
      serveStatic('app/')
    ]
  },
  server: {}
};
