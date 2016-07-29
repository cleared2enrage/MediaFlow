'use strict';

module.exports = {
  options: {
    livereload: true
  },
  scripts: {
    files: ['src/**/*.js'],
    tasks: [
      'eslint:all',
      'browserify:main'
    ]
  },
  styles: {
    files: ['less/**/*.less'],
    tasks: [
      'less:main'
    ]
  }
};
