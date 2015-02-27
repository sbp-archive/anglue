System.register(["angular", "./annotation"], function (_export) {
	"use strict";

	var angular, Annotation, _prototypeProperties, _inherits, _classCallCheck, Application;
	return {
		setters: [function (_angular) {
			angular = _angular["default"];
		}, function (_annotation) {
			Annotation = _annotation["default"];
		}],
		execute: function () {
			_prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

			_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

			_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

			Application = _export("Application", (function (Annotation) {
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
							return ["ui.router", "luxyflux"].concat(targetCls.dependencies || [], this.getModuleNames(targetCls.components), this.getModuleNames(targetCls.stores), this.getModuleNames(targetCls.actions));
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
			})(Annotation));
			_export("default", Application);
		}
	};
});
//# sourceMappingURL=application.js.map