// delaying wallaby automatic start
wallaby.delayStart();

requirejs.config({
    baseUrl: '/src',

    paths: {
        'anglue': 'anglue',
        'luxyflux': '../bower_components/luxyflux/dist/amd',
        'angular': '../bower_components/angular/angular',
        'angular-mocks': '../bower_components/angular-mocks/angular-mocks',
        'angular-ui-router': '../bower_components/angular-ui-router/release/angular-ui-router'
    },

    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-mocks': ['angular'],
        'angular-ui-router': ['angular']
    },

    // asking require.js to load our tests
    deps: wallaby.tests,

    // starting run once require.js is done
    callback: wallaby.start
});
