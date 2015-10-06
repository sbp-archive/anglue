/*eslint-env node*/
var babel = require('babel');
module.exports = function(wallaby) {
  return {
    files: [
      {pattern: 'node_modules/requirejs/require.js', instrument: false},
      {pattern: 'node_modules/babel/node_modules/babel-core/browser-polyfill.js', instrument: false},
      {pattern: 'bower_components/angular/angular.js', instrument: false, load: false},
      {pattern: 'bower_components/angular-mocks/angular-mocks.js', instrument: false, load: false},
      {pattern: 'bower_components/angular-ui-router/release/angular-ui-router.js', instrument: false, load: false},
      {pattern: 'bower_components/luxyflux/dist/amd/**/*.js', instrument: false, load: false},
      {pattern: 'wallaby-main.js', instrument: false},

      // Source files
      {pattern: 'src/**/*.js', load: false},
      '!src/**/*.spec.js'
    ],
    tests: [
      {pattern: 'src/**/*.spec.js', load: false}
    ],
    compilers: {
      'src/**/*.js': wallaby.compilers.babel({
        babel: babel,
        stage: 0,
        modules: 'amd'
      })
    },
    env: {
      type: 'browser',
      runner: 'node_modules/karma-phantomjs2-launcher/node_modules/phantomjs2-ext/bin/phantomjs'
    },
    debug: true
  };
};
