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
        configFile: 'karma.conf.js'
      }
    },

    coveralls: {
      src: 'coverage/lcov.info'
    },

    babel: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: [
              '**/*.js',
              '!**/*.spec.js'
            ],
            dest: 'dist/amd/'
          }
        ]
      }
    }
  });

  grunt.file.expand('node_modules/grunt-*/tasks')
    .forEach(grunt.loadTasks);

  // Default task.
  grunt.registerTask('build', [
    'eslint',
    'karma',
    'clean',
    'babel'
  ]);
  grunt.registerTask('default', ['build']);
};
