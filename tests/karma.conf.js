/*eslint-env node, jasmine, protractor */
// Karma configuration
// Generated on Fri Aug 28 2015 11:34:14 GMT+0200 (CEST)
module.exports = function(config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '../',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: [
			'jasmine',
			'requirejs'
		],

		// list of files / patterns to load in the browser
		files: [
			'node_modules/grunt-babel/node_modules/babel-core/browser-polyfill.min.js',
			'tests/test-main.js',
			{
				pattern: 'bower_components/angular/angular.js',
				included: false
			},
			{
				pattern: 'bower_components/angular-mocks/angular-mocks.js',
				included: false
			},
			{
				pattern: 'bower_components/angular-ui-router/release/angular-ui-router.js',
				included: false
			},
			{
				pattern: 'bower_components/luxyflux/dist/amd/**/*.js',
				included: false
			},
			{
				pattern: 'src/**/*.js',
				included: false
			},
			{
				pattern: 'tests/**/*.js',
				included: false
			}
		],

		// list of files to exclude
		exclude: [],

		preprocessors: {
			'tests/**/*.spec.js': ['babel'],
			'src/**/*.js': ['babel', 'sourcemap', 'coverage']
		},

		babelPreprocessor: {
			options: {
				sourceMap: 'inline',
				blacklist: ['useStrict']
			},
			sourceFileName: function(file) {
				return file.originalPath;
			}
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: [
			'progress',
			'coverage'
		],

		coverageReporter: {
			// configure the reporter to use isparta for JavaScript coverage
			// Only on { "karma-coverage": "douglasduteil/karma-coverage#next" }
			instrumenters: {
				isparta : require('isparta')
			},
			instrumenter: {
				'src/**/*.js': 'isparta'
			},
			reporters: [
				{
					type: 'text-summary',
				},
				{
					type: 'html',
					dir: 'coverage/'
				}
			]
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
