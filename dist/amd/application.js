define(["exports", "angular", "./annotation"], function (exports, _angular, _annotation) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var angular = _interopRequire(_angular);

    var Annotation = _interopRequire(_annotation);

    var Application = exports.Application = (function (Annotation) {
        function Application() {
            _classCallCheck(this, Application);

            if (Annotation != null) {
                Annotation.apply(this, arguments);
            }
        }

        _inherits(Application, Annotation);

        _prototypeProperties(Application, null, {
            dependencies: {
                get: function () {
                    var targetCls = this.targetCls;
                    var extraDependencies = ["luxyflux"];
                    if (targetCls.routes) {
                        extraDependencies.push("ui.router");
                    }
                    return extraDependencies.concat(targetCls.dependencies || [], Annotation.getModuleNames(targetCls.components), Annotation.getModuleNames(targetCls.stores), Annotation.getModuleNames(targetCls.actions));
                },
                configurable: true
            },
            module: {
                get: function () {
                    if (!this._module) {
                        this._module = angular.module(this.name, this.dependencies);

                        this.configure(this._module);
                    }

                    return this._module;
                },
                configurable: true
            },
            configure: {
                value: function configure(angularModule) {
                    // The ApplicationDispatcher is the (singleton) dispatcher instance used
                    // in our entire application. Every ActionCreator in this app dispatches
                    // through this instance and all app stores are registered to it
                    angularModule.service("ApplicationDispatcher", ["LuxyFluxDispatcher", function (Dispatcher) {
                        return new Dispatcher("ApplicationDispatcher");
                    }]);

                    var routes = this.targetCls.routes;
                    if (routes) {
                        angularModule.config(["$stateProvider", "$urlRouterProvider", function routerConfig($stateProvider, $urlRouterProvider) {
                            if (routes.defaultRoute) {
                                $urlRouterProvider.otherwise(routes.defaultRoute);
                                delete routes.defaultRoute;
                            }

                            Object.keys(routes).forEach(function (name) {
                                $stateProvider.state(name, routes[name]);
                            });
                        }]);
                    }
                },
                writable: true,
                configurable: true
            }
        });

        return Application;
    })(Annotation);
    exports["default"] = Application;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
});
//# sourceMappingURL=application.js.map