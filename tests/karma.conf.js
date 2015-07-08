// Karma configuration
// Generated on Tue Oct 21 2014 20:57:02 GMT+0200 (CEST)

module.exports = function (config) {
    config.set({
        basePath: '../',

        plugins: ['karma-systemjs', 'karma-jasmine', 'karma-phantomjs-launcher'],
        frameworks: ['systemjs', 'jasmine'],

        systemjs: {
            // File patterns for your application code, dependencies, and test suites
            files: [
                'bower_components/angular/angular.js',
                'bower_components/angular-mocks/angular-mocks.js',
                'bower_components/luxyflux/dist/system/ng-luxyflux.js',
                'dist/system/**/*.js',
                'tests/spec/**/*.js'
            ],

            // SystemJS configuration specifically for tests, added after your config file.
            // Good for adding test libraries and mock modules
            config: {
                baseURL: '',
                paths: {
                    'anglue/*': 'dist/system/*.js',
                    'angular': 'bower_components/angular/angular.js',
                    'babel': 'node_modules/grunt-babel/node_modules/babel-core/browser.js',
                    'es6-module-loader': 'node_modules/es6-module-loader/dist/es6-module-loader.js',
                    'systemjs': 'node_modules/systemjs/dist/system.js',
                    'system-polyfills': 'node_modules/systemjs/dist/system-polyfills.js',
                    'phantomjs-polyfill': 'node_modules/phantomjs-polyfill/bind-polyfill.js',
                    'angular-mocks': 'bower_components/angular-mocks/angular-mocks.js'
                },
                transpiler: 'babel'
            },

            // Specify the suffix used for test suite file names.  Defaults to .test.js, .spec.js, _test.js, and _spec.js
            testFileSuffix: '.spec.js'
        },

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['PhantomJS'],
        singleRun: true
    });
};
