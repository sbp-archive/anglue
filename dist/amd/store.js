define(['exports', 'angular', './annotation', './annotations', './behaviors/event-emitter', './utils'], function (exports, _angular, _annotation, _annotations, _behaviorsEventEmitter, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var _bind = Function.prototype.bind;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.Store = Store;
  exports.Handlers = Handlers;
  exports.Handler = Handler;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  var _angular2 = _interopRequireDefault(_angular);

  var StoreAnnotation = (function (_Annotation) {
    _inherits(StoreAnnotation, _Annotation);

    function StoreAnnotation() {
      _classCallCheck(this, StoreAnnotation);

      _get(Object.getPrototypeOf(StoreAnnotation.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(StoreAnnotation, [{
      key: 'getInjectionTokens',
      value: function getInjectionTokens() {
        return ['LuxyFlux', 'LuxyFluxStore', 'ApplicationDispatcher'].concat(_get(Object.getPrototypeOf(StoreAnnotation.prototype), 'getInjectionTokens', this).call(this));
      }
    }, {
      key: 'serviceName',
      get: function get() {
        var name = this.name;
        return '' + name[0].toUpperCase() + name.slice(1) + 'Store';
      }
    }, {
      key: 'factoryFn',
      get: function get() {
        var TargetCls = this.targetCls;
        var annotation = this;

        return function (LuxyFlux, LuxyFluxStore, ApplicationDispatcher) {
          var injected = Array.from(arguments).slice(3);
          var instance = new (_bind.apply(TargetCls, [null].concat(_toConsumableArray(injected))))();

          annotation.applyInjectionBindings(instance, injected);
          annotation.applyBehaviors(instance);
          annotation.applyDecorators(instance);

          return LuxyFlux.createStore({
            name: 'store.' + annotation.name,
            dispatcher: ApplicationDispatcher,
            handlers: TargetCls.handlers,
            decorate: instance
          }, LuxyFluxStore);
        };
      }
    }, {
      key: 'module',
      get: function get() {
        if (!this._module) {
          this._module = _angular2['default'].module('stores.' + this.name, this.dependencies);

          this._module.factory(this.serviceName, this.getInjectionTokens().concat([this.factoryFn]));

          this.configure(this._module);
        }
        return this._module;
      }
    }]);

    return StoreAnnotation;
  })(_annotation.Annotation);

  exports.StoreAnnotation = StoreAnnotation;

  function Store(config) {
    return function (cls) {
      // Decorate a store with the EventEmitterBehavior
      (0, _behaviorsEventEmitter.EventEmitter)()(cls);

      var storeName = undefined;
      var isConfigObject = _angular2['default'].isObject(config);

      if (isConfigObject && config.name) {
        storeName = config.name;
      } else if (_angular2['default'].isString(config)) {
        storeName = config;
      } else {
        var clsName = cls.name.replace(/store$/i, '');
        storeName = '' + clsName[0].toLowerCase() + clsName.slice(1);
      }

      (0, _utils.addStaticGetter)(cls, 'annotation', function () {
        return _annotations.Annotations.getStore(storeName, cls);
      });
    };
  }

  function Handlers(handlers) {
    return function (cls) {
      Object.keys(handlers).forEach(function (actionName) {
        var handlerName = handlers[actionName];
        (0, _utils.addStaticGetterObjectMember)(cls, 'handlers', actionName, handlerName);
      });
    };
  }

  function Handler(actionName) {
    var override = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    return function (cls, handlerName) {
      var action = actionName;
      if (!action) {
        action = handlerName.replace(/^on([A-Z])/, function (match, first) {
          return first.toLowerCase();
        }).replace(/([A-Z])/g, '_$1').toUpperCase();
      }
      (0, _utils.addStaticGetterObjectMember)(cls.constructor, 'handlers', action, handlerName, override);
    };
  }

  exports['default'] = StoreAnnotation;
});
//# sourceMappingURL=store.js.map
