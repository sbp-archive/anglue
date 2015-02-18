define(["exports", "./component", "./store", "./actions"], function (exports, _component, _store, _actions) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var Component = _interopRequire(_component);

    var Store = _interopRequire(_store);

    var Actions = _interopRequire(_actions);

    exports.Component = Component;
    exports.Store = Store;
    exports.Actions = Actions;
    var Annotations = exports.Annotations = (function () {
        function Annotations() {
            _classCallCheck(this, Annotations);

            this.components = new Map();
            this.stores = new Map();
            this.actions = new Map();
        }

        _prototypeProperties(Annotations, null, {
            Component: {
                get: function () {
                    return Component;
                },
                configurable: true
            },
            Store: {
                get: function () {
                    return Store;
                },
                configurable: true
            },
            Actions: {
                get: function () {
                    return ActionCreators;
                },
                configurable: true
            },
            getComponent: {
                value: function getComponent(name, targetCls) {
                    var component = this.components.get(name);
                    if (!component) {
                        component = new Component(name, targetCls);
                        this.components.set(name, component);
                    }
                    return component;
                },
                writable: true,
                configurable: true
            },
            getStore: {
                value: function getStore(name, targetCls) {
                    var store = this.stores.get(name);
                    if (!store) {
                        store = new Store(name, targetCls);
                        this.stores.set(name, store);
                    }
                    return store;
                },
                writable: true,
                configurable: true
            },
            getActions: {
                value: function getActions(name, targetCls) {
                    var actions = this.actions.get(name);
                    if (!actions) {
                        actions = new Actions(name, targetCls);
                        this.actions.set(name, actions);
                    }
                    return actions;
                },
                writable: true,
                configurable: true
            }
        });

        return Annotations;
    })();
    exports["default"] = new Annotations();
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
});
//# sourceMappingURL=annotations.js.map