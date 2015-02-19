System.register(["./component", "./store", "./actions"], function (_export) {
    "use strict";

    var Application, Component, Store, Actions, _prototypeProperties, _classCallCheck, AnnotationsCache;
    return {
        setters: [function (_component) {
            Application = _component["default"];
            Component = _component["default"];
        }, function (_store) {
            Store = _store["default"];
        }, function (_actions) {
            Actions = _actions["default"];
        }],
        execute: function () {
            _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            _export("Component", Component);

            _export("Store", Store);

            _export("Actions", Actions);

            AnnotationsCache = _export("AnnotationsCache", (function () {
                function AnnotationsCache() {
                    _classCallCheck(this, AnnotationsCache);

                    this.components = new Map();
                    this.stores = new Map();
                    this.actions = new Map();
                }

                _prototypeProperties(AnnotationsCache, null, {
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
                            return Actions;
                        },
                        configurable: true
                    },
                    Application: {
                        get: function () {
                            return Application;
                        },
                        configurable: true
                    },
                    getApplication: {
                        value: function getApplication(name, targetCls) {
                            var application = this.components.get(name);
                            if (!application) {
                                application = new Application(name, targetCls);
                                this.components.set(name, application);
                            }
                            return application;
                        },
                        writable: true,
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

                return AnnotationsCache;
            })());
            _export("default", new AnnotationsCache());
        }
    };
});
//# sourceMappingURL=annotations.js.map