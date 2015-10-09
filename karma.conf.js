/*eslint-env node, jasmine, protractor */
// Karma configuration
// Generated on Fri Aug 28 2015 11:34:14 GMT+0200 (CEST)
module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
      'jasmine',
      'requirejs'
    ],

    // list of files / patterns to load in the browser
    files: [
      'node_modules/grunt-babel/node_modules/babel-core/browser-polyfill.min.js',
      'karma-main.js',
      {pattern: 'bower_components/angular/angular.js', included: false},
      {pattern: 'bower_components/angular-mocks/angular-mocks.js', included: false},
      {pattern: 'bower_components/angular-ui-router/release/angular-ui-router.js', included: false},
      {pattern: 'bower_components/luxyflux/dist/amd/**/*.js', included: false},
      {pattern: 'dist/amd/**/*.js', included: false},
      {pattern: 'src/**/*.spec.js', included: false}
    ],

    // list of files to exclude
    exclude: [],

    preprocessors: {
      'dist/**/*.js': ['coverage', 'sourcemap'],
      'src/**/*.spec.js': ['babel']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
      'dots',
      'coverage'
    ],

    coverageReporter: {
      reporters: [{
        type: 'json', // lcov or lcovonly are required for generating lcov.info files
        dir: 'coverage/',
        subdir: '.',
        file: 'lcov.json'
      }]
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO
    // || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'PhantomJS2'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
