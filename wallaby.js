var wallabyWebpack = require('wallaby-webpack');
var babel = require('babel');
var path = require('path');
var ROOT_PATH = path.resolve(__dirname);

module.exports = function (wallaby) {

    var babelCompiler = wallaby.compilers.babel({
        babel: babel,
        // babel options
        stage: 0
    });

    var webpackPostprocessor = wallabyWebpack({
        // webpack options
        loaders: [
            {
                test  : ROOT_PATH + '/bower_components/angular/angular',
                loader: 'exports?window.angular'
            }
        ],
        resolve: {
            alias     : {
                'anglue'           : ROOT_PATH + '/src',
                'angular'          : ROOT_PATH + '/bower_components/angular/angular',
                'luxyflux'         : ROOT_PATH + '/bower_components/luxyflux/dist/amd',
                'angular-mocks'    : ROOT_PATH + '/bower_components/angular-mocks/angular-mocks',
                'angular-ui-router': ROOT_PATH + '/bower_components/angular-ui-router/release/angular-ui-router'
            },
            extensions: ['', '.js']
        }
    });

    return {
        files: [
            // you may just add the file separately,
            // like done here https://github.com/wallabyjs/wallaby-react-todomvc-sample/blob/master/wallaby-babel.js
            {pattern: 'node_modules/grunt-babel/node_modules/babel-core/browser-polyfill.min.js', instrument: false},
            {pattern: 'src/**/*.js', load: false}
        ],

        tests: [
            {pattern: 'tests/spec/**/*.spec.js', load: false}
        ],

        compilers: {
            '**/*.js': babelCompiler
        },

        postprocessor: webpackPostprocessor,

        bootstrap: function () {
            window.__moduleBundler.loadTests();
        }
    };
};
