var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

System.register(['angular', './annotation'], function (_export) {
    var angular, Annotation, _classCallCheck, _createClass, _inherits, Application;

    return {
        setters: [function (_angular) {
            angular = _angular['default'];
        }, function (_annotation) {
            Annotation = _annotation['default'];
        }],
        execute: function () {
            'use strict';

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

            _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

            _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _defaults(subClass, superClass); };

            Application = (function (_Annotation) {
                function Application() {
                    _classCallCheck(this, Application);

                    if (_Annotation != null) {
                        _Annotation.apply(this, arguments);
                    }
                }

                _inherits(Application, _Annotation);

                _createClass(Application, [{
                    key: 'dependencies',
                    get: function () {
                        var targetCls = this.targetCls;
                        var extraDependencies = ['luxyflux'];
                        if (targetCls.routes) {
                            extraDependencies.push('ui.router');
                        }
                        return extraDependencies.concat(targetCls.dependencies || [], Annotation.getModuleNames(targetCls.components), Annotation.getModuleNames(targetCls.stores), Annotation.getModuleNames(targetCls.actions));
                    }
                }, {
                    key: 'module',
                    get: function () {
                        if (!this._module) {
                            this._module = angular.module(this.name, this.dependencies);

                            var annotationNames = Annotation.getAnnotationNames(this.targetCls.stores);
                            var controllerDeps = annotationNames.concat([function () {}]);

                            this._module.controller('AnglueAppController', controllerDeps);

                            this.configure(this._module);
                        }

                        return this._module;
                    }
                }, {
                    key: 'configure',
                    value: function configure(angularModule) {
                        // The ApplicationDispatcher is the (singleton) dispatcher instance used
                        // in our entire application. Every ActionCreator in this app dispatches
                        // through this instance and all app stores are registered to it
                        angularModule.service('ApplicationDispatcher', ['LuxyFluxDispatcher', function (Dispatcher) {
                            return new Dispatcher('ApplicationDispatcher');
                        }]);

                        var routes = this.targetCls.routes;
                        if (routes) {
                            angularModule.config(['$stateProvider', '$urlRouterProvider', function routerConfig($stateProvider, $urlRouterProvider) {
                                if (routes.defaultRoute) {
                                    $urlRouterProvider.otherwise(routes.defaultRoute);
                                    delete routes.defaultRoute;
                                }

                                Object.keys(routes).forEach(function (name) {
                                    $stateProvider.state(name, routes[name]);
                                });
                            }]);
                        }
                    }
                }]);

                return Application;
            })(Annotation);

            _export('Application', Application);

            _export('default', Application);
        }
    };
});
//# sourceMappingURL=application.js.map