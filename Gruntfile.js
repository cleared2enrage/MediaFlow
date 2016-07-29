'use strict';

var _ = require('lodash');
var sizeOf = require('image-size');

module.exports = function (grunt) {
  // Time how long tasks take
  require('time-grunt')(grunt);

  // Load grunt configurations automatically
  require('load-grunt-config')(grunt);

  grunt.registerTask('default', [
    'eslint:all',
    'less:main',
    'browserify:main',
    'connect:server',
    'watch'
  ]);

  grunt.registerTask('gather_media', function () {
    var files = grunt.file.expand({
      cwd: './app/media/visual'
    }, [
      '*/*{jpg,jpeg,JPG,JPEG}'
    ]);

    var groups = [],
      group = [],
      lastGroup = null;
    _.forEach(files, function(file) {
      var parts = _.split(file, '/');
      var groupName = parts[0];
      var dim = sizeOf('app/media/visual/' + file);

      if (groupName !== lastGroup && group.length > 0) {
        groups.push(group);
        group = [];
      }

      group.push({
        type: 'photo',
        path: '/media/visual/' + file,
        width: dim.width,
        height: dim.height
      });

      lastGroup = groupName;
    });

    groups.push(group);

    grunt.file.write('app/data.json', JSON.stringify(groups));
  });
};
