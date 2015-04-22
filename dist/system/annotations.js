System.register(['./application', './component', './store', './actions'], function (_export) {
    var Application, Component, Store, Actions, _classCallCheck, _createClass, AnnotationsCache;

    return {
        setters: [function (_application) {
            Application = _application['default'];
        }, function (_component) {
            Component = _component['default'];
        }, function (_store) {
            Store = _store['default'];
        }, function (_actions) {
            Actions = _actions['default'];
        }],
        execute: function () {
            'use strict';

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

            _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

            _export('Component', Component);

            _export('Store', Store);

            _export('Actions', Actions);

            AnnotationsCache = (function () {
                function AnnotationsCache() {
                    _classCallCheck(this, AnnotationsCache);

                    this.applications = new Map();
                    this.components = new Map();
                    this.stores = new Map();
                    this.actions = new Map();
                }

                _createClass(AnnotationsCache, [{
                    key: 'getApplication',
                    value: function getApplication(name, targetCls) {
                        var application = this.applications.get(name);
                        if (!application) {
                            application = new Application(name, targetCls);
                            this.applications.set(name, application);
                        }
                        return application;
                    }
                }, {
                    key: 'getComponent',
                    value: function getComponent(name, targetCls) {
                        var component = this.components.get(name);
                        if (!component) {
                            component = new Component(name, targetCls);
                            this.components.set(name, component);
                        }
                        return component;
                    }
                }, {
                    key: 'getStore',
                    value: function getStore(name, targetCls) {
                        var store = this.stores.get(name);
                        if (!store) {
                            store = new Store(name, targetCls);
                            this.stores.set(name, store);
                        }
                        return store;
                    }
                }, {
                    key: 'getActions',
                    value: function getActions(name, targetCls) {
                        var actions = this.actions.get(name);
                        if (!actions) {
                            actions = new Actions(name, targetCls);
                            this.actions.set(name, actions);
                        }
                        return actions;
                    }
                }]);

                return AnnotationsCache;
            })();

            _export('AnnotationsCache', AnnotationsCache);

            _export('default', new AnnotationsCache());
        }
    };
});
//# sourceMappingURL=annotations.js.map