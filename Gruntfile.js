'use strict';

var _ = require('lodash');
var sizeOf = require('image-size');
var getVideoDimensions = require('get-video-dimensions');
var getVideoDuration = require('get-video-duration');
var Promise = require('bluebird').Promise;

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
    var done = this.async();
    var data = {
      audio: [],
      visual: []
    };
    var files = grunt.file.expand({
      cwd: './app/media/visual'
    }, [
      '*/*'
    ]);

    var group = {
        photos:[],
        videos:[]
      },
      lastGroup = null;

    Promise.each(files, function(file) {
      var groupName = _.split(file, '/')[0];
      var extension = _.last(_.split(file, '.')).toLowerCase();

      if (groupName !== lastGroup && lastGroup != null) {
        data.visual.push(group);
        group = {
          photos:[],
          videos:[]
        };
      }
      lastGroup = groupName;

      if (extension === 'mp4') {
        var video = {
          type: 'video',
          path: 'media/visual/' + file,
        };

        return getVideoDimensions('app/media/visual/' + file).then(function(result) {
          video.width = result.width;
          video.height = result.height;
        }).then(function() {
          return getVideoDuration('app/media/visual/' + file).then(function(duration) {
            video.duration = duration;
          });
        }).then(function() {
          group.videos.push(video);
        });
      } else {
        var dim = sizeOf('app/media/visual/' + file);

        group.photos.push({
          type: 'photo',
          path: 'media/visual/' + file,
          width: dim.width,
          height: dim.height
        });
      }
    }).then(function() {
      data.visual.push(group);

      var files = grunt.file.expand({
        cwd: './app/media/audio'
      }, [
        '*.mp3'
      ]);

      _.forEach(files, function(file) {
        data.audio.push({
          path: 'media/audio/' + file
        });
      });

    }).then(function() {
      grunt.file.write('app/data.json', JSON.stringify(data));
      done();
    });
  });
};
