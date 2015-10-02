var babel = require('babel');

module.exports = function (wallaby) {
    return {
        files: [
            {pattern: 'node_modules/babel/node_modules/babel-core/browser-polyfill.js', instrument: false},
            {pattern: 'src/**/*.js', load: false},
            {pattern: 'bower_components/requirejs/require.js', instrument: false},
            {pattern: 'tests/test-main.wallaby.js', instrument: false}
        ],

        tests: [
            { pattern: 'tests/spec/*.spec.js', load: false}
        ],

        env: {
            type: 'browser',
            runner: './node_modules/phantomjs2/bin/phantomjs'
            // or
            // runner: 'C:\\Tmp\\phantomjs-2.0.0-windows\\bin\\phantomjs.exe'
        },

        compilers: {
            '**/*.js': wallaby.compilers.babel({
                babel: babel,
                // https://babeljs.io/docs/usage/experimental/
                stage: 0,
                modules: 'amd'
            })
        }
    };
};
