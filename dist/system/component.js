System.register(["angular", "./annotation"], function (_export) {
    "use strict";

    var angular, Annotation, _prototypeProperties, _get, _inherits, _classCallCheck, Component;
    return {
        setters: [function (_angular) {
            angular = _angular["default"];
        }, function (_annotation) {
            Annotation = _annotation["default"];
        }],
        execute: function () {
            _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

            _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

            _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            Component = _export("Component", (function (Annotation) {
                function Component() {
                    _classCallCheck(this, Component);

                    if (Annotation != null) {
                        Annotation.apply(this, arguments);
                    }
                }

                _inherits(Component, Annotation);

                _prototypeProperties(Component, null, {
                    controllerCls: {
                        get: function () {
                            var annotation = this;
                            var TargetCls = this.targetCls;

                            var ControllerCls = (function (TargetCls) {
                                function ControllerCls($scope) {
                                    _classCallCheck(this, ControllerCls);

                                    var injected = Array.from(arguments).slice(1);

                                    annotation.applyInjectionBindings(this, injected);
                                    annotation.applyDecorators(this);

                                    _get(Object.getPrototypeOf(ControllerCls.prototype), "constructor", this).apply(this, injected);

                                    if (this.onDestroy instanceof Function) {
                                        $scope.$on("$destroy", this.onDestroy.bind(this));
                                    }

                                    if (this.activate instanceof Function) {
                                        this.activate();
                                    }
                                }

                                _inherits(ControllerCls, TargetCls);

                                return ControllerCls;
                            })(TargetCls);

                            return ControllerCls;
                        },
                        configurable: true
                    },
                    getInjectionTokens: {
                        value: function getInjectionTokens() {
                            return ["$scope"].concat(_get(Object.getPrototypeOf(Component.prototype), "getInjectionTokens", this).call(this));
                        },
                        writable: true,
                        configurable: true
                    },
                    dependencies: {
                        get: function () {
                            var targetCls = this.targetCls;
                            return [].concat(targetCls.dependencies || [], Annotation.getModuleNames(targetCls.components));
                        },
                        configurable: true
                    },
                    template: {
                        get: function () {
                            return this.targetCls.template || null;
                        },
                        configurable: true
                    },
                    bindings: {
                        get: function () {
                            return this.targetCls.bindings || null;
                        },
                        configurable: true
                    },
                    module: {
                        get: function () {
                            if (!this._module) {
                                var name = this.name;
                                var template = this.template;
                                var bindings = this.bindings;

                                this._module = angular.module("components." + name, this.dependencies);

                                var directiveConfig = {
                                    restrict: "EA",
                                    controllerAs: name,
                                    bindToController: true,
                                    scope: true,
                                    controller: this.getInjectionTokens().concat([this.controllerCls])
                                };

                                if (template) {
                                    if (template.url) {
                                        directiveConfig.templateUrl = template.url;
                                    } else if (template.inline) {
                                        directiveConfig.template = template.inline;
                                    }
                                }

                                if (bindings) {
                                    var scope = directiveConfig.scope = {};
                                    for (var _iterator = Object.keys(bindings)[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
                                        var binding = _step.value;
                                        var attr = bindings[binding];
                                        scope[binding] = "=" + attr;
                                    }
                                }

                                this._module.directive(name, function () {
                                    return directiveConfig;
                                });

                                this.configure(this._module);
                            }

                            return this._module;
                        },
                        configurable: true
                    }
                });

                return Component;
            })(Annotation));
            _export("default", Component);
        }
    };
});
//# sourceMappingURL=component.js.map