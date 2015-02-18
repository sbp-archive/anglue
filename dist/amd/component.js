define(["exports", "module", "./annotation"], function (exports, module, _annotation) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var Annotation = _interopRequire(_annotation);

    var Component = (function (Annotation) {
        function Component() {
            _classCallCheck(this, Component);

            if (Annotation != null) {
                Annotation.apply(this, arguments);
            }
        }

        _inherits(Component, Annotation);

        _prototypeProperties(Component, null, {
            module: {
                get: function () {
                    var _this = this;
                    if (!this._module) {
                        var name;
                        var injections;
                        var decorators;
                        var controllerArray;
                        var ComponentCls;
                        var componentAnnotation;
                        (function () {
                            name = _this.name;
                            injections = _this.injections;
                            decorators = _this.decorators;
                            controllerArray = [];
                            ComponentCls = _this.targetCls;
                            componentAnnotation = _this;


                            Object.keys(injections).forEach(function (binding) {
                                controllerArray.push(injections[binding]);
                            });

                            var ControllerCls = (function (ComponentCls) {
                                function ControllerCls() {
                                    var _this2 = this;
                                    _classCallCheck(this, ControllerCls);

                                    var injected = Array.from(arguments);
                                    Object.keys(injections).forEach(function (binding, index) {
                                        Object.defineProperty(_this2, binding, { value: injected[index] });
                                    });
                                    Object.defineProperty(this, "_componentAnnotation", { value: componentAnnotation });

                                    for (var _iterator = decorators[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
                                        var decorator = _step.value;
                                        decorator.decorate(this);
                                    }

                                    _get(Object.getPrototypeOf(ControllerCls.prototype), "constructor", this).apply(this, arguments);

                                    if (this.activate instanceof Function) {
                                        this.activate();
                                    }
                                }

                                _inherits(ControllerCls, ComponentCls);

                                return ControllerCls;
                            })(ComponentCls);

                            ;
                            controllerArray.push(ControllerCls);

                            _this._module = angular.module("components." + name, _this.dependencies);
                            _this._module.directive(name, function () {
                                return {
                                    restrict: "E",
                                    controllerAs: name,
                                    bindToController: true,
                                    controller: controllerArray
                                };
                            });
                        })();
                    }

                    return this._module;
                },
                configurable: true
            }
        });

        return Component;
    })(Annotation);

    module.exports = Component;
});
//# sourceMappingURL=component.js.map