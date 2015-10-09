/*global module:false*/
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: './dist/*',
      coverage: './coverage/*'
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

    remapIstanbul: {
      build: {
        src: 'coverage/lcov.json',
        options: {
          reports: {
            'lcovonly': 'coverage/lcov-remapped.info',
            'text-summary': null,
            'html': 'coverage/html'
          }
        }
      }
    },

    coveralls: {
      src: 'coverage/lcov-remapped.info'
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

  grunt.loadNpmTasks('remap-istanbul');
  grunt.file.expand('node_modules/grunt-*/tasks')
    .forEach(grunt.loadTasks);

  // Default task.
  grunt.registerTask('build', [
    'eslint',
    'clean',
    'babel',
    'karma',
    'remapIstanbul'
  ]);

  grunt.registerTask('default', ['build']);
};
