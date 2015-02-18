define(["exports", "./annotation"], function (exports, _annotation) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var Annotation = _interopRequire(_annotation);

    var Store = exports.Store = (function (Annotation) {
        function Store() {
            _classCallCheck(this, Store);

            if (Annotation != null) {
                Annotation.apply(this, arguments);
            }
        }

        _inherits(Store, Annotation);

        _prototypeProperties(Store, null, {
            module: {
                get: function () {
                    if (!this._module) {
                        var name = this.name;
                        var injections = this.injections;
                        var decorators = this.decorators;
                        var factoryArray = ["LuxaFlux", "ApplicationDispatcher"];
                        var StoreCls = this.targetCls;
                        var storeAnnotation = this;
                        var factoryName = name[0].toUpperCase() + name.slice(1) + "Store";

                        Object.keys(injections).forEach(function (binding) {
                            factoryArray.push(injections[binding]);
                        });

                        var factoryFn = function () {
                            var store = new StoreCls();
                            var args = Array.from(arguments);
                            var injected = args.slice(2);
                            Object.keys(injections).forEach(function (binding, index) {
                                Object.defineProperty(store, binding, { value: injected[index] });
                            });
                            Object.defineProperty(store, "_storeAnnotation", { value: storeAnnotation });

                            for (var _iterator = decorators[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
                                var decorator = _step.value;
                                decorator.decorate(this);
                            }

                            var LuxaFlux = args[0];
                            var ApplicationDispatcher = args[1];

                            return LuxaFlux.createStore({
                                name: "store." + name,
                                dispatcher: ApplicationDispatcher,
                                handlers: StoreCls.handlers,
                                decorate: store
                            });
                        };
                        factoryArray.push(factoryFn);

                        this._module = angular.module("stores." + name, this.dependencies);
                        this._module.factory(factoryName, factoryArray);
                    }
                    return this._module;
                },
                configurable: true
            }
        });

        return Store;
    })(Annotation);
    exports["default"] = Store;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
});
//# sourceMappingURL=store.js.map