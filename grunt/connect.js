'use strict';

var _ = require('lodash');
var console = require('console');
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
        if (_.startsWith(urlObj.pathname, '/media/visual') && !_.endsWith(urlObj.pathname, '.mp4')) {
          var query = urlObj.query || {};
          if (query.width && query.height) {
            var width = query.width;
            var height = query.height;
            var image = './app' + urlObj.pathname;

            smartcrop.crop(image, {width: width, height: height}).then(function(result) {
              var crop = result.topCrop;
              gm(image)
                .autoOrient()
                .crop(crop.width, crop.height, crop.x, crop.y)
                .resize(width, height)
                .stream()
                .pipe(res);
            }).catch(function(error) {
              console.log(error);
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
