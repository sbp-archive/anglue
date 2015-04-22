define(['exports', './application', './component', './store', './actions'], function (exports, _application, _component, _store, _actions) {
    'use strict';

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _Application = _interopRequire(_application);

    var _Component = _interopRequire(_component);

    var _Store = _interopRequire(_store);

    var _Actions = _interopRequire(_actions);

    exports.Component = _Component;
    exports.Store = _Store;
    exports.Actions = _Actions;

    var AnnotationsCache = (function () {
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
                    application = new _Application(name, targetCls);
                    this.applications.set(name, application);
                }
                return application;
            }
        }, {
            key: 'getComponent',
            value: function getComponent(name, targetCls) {
                var component = this.components.get(name);
                if (!component) {
                    component = new _Component(name, targetCls);
                    this.components.set(name, component);
                }
                return component;
            }
        }, {
            key: 'getStore',
            value: function getStore(name, targetCls) {
                var store = this.stores.get(name);
                if (!store) {
                    store = new _Store(name, targetCls);
                    this.stores.set(name, store);
                }
                return store;
            }
        }, {
            key: 'getActions',
            value: function getActions(name, targetCls) {
                var actions = this.actions.get(name);
                if (!actions) {
                    actions = new _Actions(name, targetCls);
                    this.actions.set(name, actions);
                }
                return actions;
            }
        }]);

        return AnnotationsCache;
    })();

    exports.AnnotationsCache = AnnotationsCache;
    exports['default'] = new AnnotationsCache();
});
//# sourceMappingURL=annotations.js.map