define(["exports"], function (exports) {
    "use strict";

    var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var Annotation = exports.Annotation = (function () {
        function Annotation(name, targetCls) {
            _classCallCheck(this, Annotation);

            this.name = name;
            this.targetCls = targetCls;
        }

        _prototypeProperties(Annotation, null, {
            getInjectionTokens: {
                value: function getInjectionTokens() {
                    var tokens = [];
                    var injections = this.injections;
                    Object.keys(injections).forEach(function (binding) {
                        tokens.push(injections[binding]);
                    });
                    return tokens;
                },
                writable: true,
                configurable: true
            },
            injections: {
                get: function () {
                    return this.targetCls.injections || {};
                },
                configurable: true
            },
            decorators: {
                get: function () {
                    return this.targetCls.decorators || [];
                },
                configurable: true
            },
            dependencies: {
                get: function () {
                    return this.targetCls.dependencies || [];
                },
                configurable: true
            },
            configure: {

                /**
                 * This method can be overriden by child classes to
                 * configure the angular module after it is created
                 * @param {module} module The created angular module
                 */
                value: function configure() {},
                writable: true,
                configurable: true
            },
            applyInjectionBindings: {

                /**
                 * This method applies all the requested injection bindings
                 * from the targetCls to the created instance
                 * @param  {TargetCls} instance The created instance that
                 * wants the bindings
                 * @param  {Array<Binding>} injected An array with the injected
                 * instances that we will apply on the class instance
                 */
                value: function applyInjectionBindings(instance, injected) {
                    var injections = this.injections;

                    Object.keys(injections).forEach(function (binding, index) {
                        Object.defineProperty(instance, binding, {
                            value: injected[index]
                        });
                    });

                    Object.defineProperty(instance, "_annotation", {
                        value: this
                    });
                },
                writable: true,
                configurable: true
            },
            applyDecorators: {

                /**
                 * This method decorates the created instance with all the
                 * targetCls decorators
                 * @param  {[type]} instance The created instance to be decorated
                 */
                value: function applyDecorators(instance) {
                    var decorators = this.decorators;
                    for (var _iterator = decorators[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
                        var decorator = _step.value;
                        decorator.decorate(instance);
                    }
                },
                writable: true,
                configurable: true
            },
            getModuleNames: {

                /**
                 * Returns all the angular module names for an array of classes
                 * @param  {Array} classes An array of classes you want to module names for
                 * @return {Array} The name of the angular modules for these classes
                 */
                value: function getModuleNames() {
                    var classes = arguments[0] === undefined ? [] : arguments[0];
                    var names = [];
                    for (var _iterator = classes[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
                        var cls = _step.value;
                        var annotation = cls.annotation;
                        if (annotation) {
                            names.push(annotation.module.name);
                        }
                    }
                    return names;
                },
                writable: true,
                configurable: true
            }
        });

        return Annotation;
    })();
    exports["default"] = Annotation;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
});
//# sourceMappingURL=annotation.js.map