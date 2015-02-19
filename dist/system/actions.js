System.register(["angular", "./annotation"], function (_export) {
    "use strict";

    var angular, Annotation, _applyConstructor, _toConsumableArray, _prototypeProperties, _get, _inherits, _classCallCheck, Actions;
    return {
        setters: [function (_angular) {
            angular = _angular["default"];
        }, function (_annotation) {
            Annotation = _annotation["default"];
        }],
        execute: function () {
            _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

            _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

            _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

            _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

            _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            Actions = _export("Actions", (function (Annotation) {
                function Actions() {
                    _classCallCheck(this, Actions);

                    if (Annotation != null) {
                        Annotation.apply(this, arguments);
                    }
                }

                _inherits(Actions, Annotation);

                _prototypeProperties(Actions, null, {
                    serviceName: {
                        get: function () {
                            var name = this.name;
                            return name[0].toUpperCase() + name.slice(1) + "Actions";
                        },
                        configurable: true
                    },
                    getInjectionTokens: {
                        value: function getInjectionTokens() {
                            return ["LuxyFlux", "ApplicationDispatcher"].concat(_get(Object.getPrototypeOf(Actions.prototype), "getInjectionTokens", this).call(this));
                        },
                        writable: true,
                        configurable: true
                    },
                    factoryFn: {
                        get: function () {
                            var TargetCls = this.targetCls;
                            var annotation = this;

                            return function (LuxyFlux, ApplicationDispatcher) {
                                var injected = Array.from(arguments).slice(2);
                                var instance = _applyConstructor(TargetCls, _toConsumableArray(injected));

                                annotation.applyInjectionBindings(instance, injected);
                                annotation.applyDecorators(instance);

                                return LuxyFlux.createActions({
                                    dispatcher: ApplicationDispatcher,
                                    serviceActions: TargetCls.serviceActions,
                                    decorate: instance
                                });
                            };
                        },
                        configurable: true
                    },
                    module: {
                        get: function () {
                            if (!this._module) {
                                this._module = angular.module("actions." + this.name, this.dependencies);

                                this._module.factory(this.serviceName, this.getInjectionTokens().concat([this.factoryFn]));

                                this.configure(this._module);
                            }
                            return this._module;
                        },
                        configurable: true
                    }
                });

                return Actions;
            })(Annotation));
            _export("default", Actions);
        }
    };
});
//# sourceMappingURL=actions.js.map