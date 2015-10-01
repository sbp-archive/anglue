/*global module:false*/
module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),

		clean: {
			build: './dist/*'
		},

		eslint: {
			options: {
				configFile: '.eslintrc'
			},
			local: {
				src: [
					'src/**/*.js'
				]
			}
		},

		release: {
			options: {
				file: 'bower.json',
				npm: false
			}
		},

		karma: {
			unit: {
				configFile: 'tests/karma.conf.js'
			}
		},

		watch: {
			run_tests: {
				files: [
					'tests/**/*.js',
					'src/**/*.js'
				],
				tasks: [
					'karma:unit'
				]
			}
		},

		babel: {
			build: {
				files: [
					{
						expand: true,
						cwd: 'src/',
						src: [
							'**/*.js'
						],
						dest: 'dist/amd/'
					}
				]
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-release');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-babel');

	// Default task.
	grunt.registerTask('build', [
		'eslint',
		'clean',
		'babel'
	]);
	grunt.registerTask('default', ['build']);
};
