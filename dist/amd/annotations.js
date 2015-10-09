define(['exports', './application', './component', './store', './actions'], function (exports, _application, _component, _store, _actions) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var AnnotationsCache = (function () {
    function AnnotationsCache() {
      _classCallCheck(this, AnnotationsCache);

      this.clear();
    }

    _createClass(AnnotationsCache, [{
      key: 'clear',
      value: function clear() {
        this.actions = new Map();
        this.applications = new Map();
        this.components = new Map();
        this.stores = new Map();
      }
    }, {
      key: 'getActions',
      value: function getActions(name, targetCls) {
        var actions = this.actions.get(name);
        if (!actions) {
          actions = new _actions.ActionsAnnotation(name, targetCls);
          this.actions.set(name, actions);
        }
        return actions;
      }
    }, {
      key: 'getApplication',
      value: function getApplication(name, targetCls) {
        var application = this.applications.get(name);
        if (!application) {
          application = new _application.ApplicationAnnotation(name, targetCls);
          this.applications.set(name, application);
        }
        return application;
      }
    }, {
      key: 'getComponent',
      value: function getComponent(name, targetCls) {
        var component = this.components.get(name);
        if (!component) {
          component = new _component.ComponentAnnotation(name, targetCls);
          this.components.set(name, component);
        }
        return component;
      }
    }, {
      key: 'getStore',
      value: function getStore(name, targetCls) {
        var store = this.stores.get(name);
        if (!store) {
          store = new _store.StoreAnnotation(name, targetCls);
          this.stores.set(name, store);
        }
        return store;
      }
    }]);

    return AnnotationsCache;
  })();

  exports.AnnotationsCache = AnnotationsCache;
  var Annotations = new AnnotationsCache();
  exports.Annotations = Annotations;
  exports['default'] = Annotations;
});
//# sourceMappingURL=annotations.js.map
