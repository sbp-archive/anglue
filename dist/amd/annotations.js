define(['exports', './application', './component', './store', './actions'], function (exports, _application, _component, _store, _actions) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var AnnotationsFactory = (function () {
    function AnnotationsFactory() {
      _classCallCheck(this, AnnotationsFactory);
    }

    _createClass(AnnotationsFactory, [{
      key: 'getApplication',
      value: function getApplication(name, targetCls) {
        return new _application.ApplicationAnnotation(name, targetCls);
      }
    }, {
      key: 'getComponent',
      value: function getComponent(name, targetCls) {
        return new _component.ComponentAnnotation(name, targetCls);
      }
    }, {
      key: 'getStore',
      value: function getStore(name, targetCls) {
        return new _store.StoreAnnotation(name, targetCls);
      }
    }, {
      key: 'getActions',
      value: function getActions(name, targetCls) {
        return new _actions.ActionsAnnotation(name, targetCls);
      }
    }]);

    return AnnotationsFactory;
  })();

  exports.AnnotationsFactory = AnnotationsFactory;
  var Annotations = new AnnotationsFactory();
  exports.Annotations = Annotations;
  exports['default'] = Annotations;
});
//# sourceMappingURL=annotations.js.map
