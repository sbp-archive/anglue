define(['exports', 'angular', './annotation', './annotations', './utils'], function (exports, _angular, _annotation, _annotations, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var _bind = Function.prototype.bind;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.Actions = Actions;
  exports.AsyncAction = AsyncAction;
  exports.Action = Action;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  var _angular2 = _interopRequireDefault(_angular);

  var ActionsAnnotation = (function (_Annotation) {
    _inherits(ActionsAnnotation, _Annotation);

    function ActionsAnnotation() {
      _classCallCheck(this, ActionsAnnotation);

      _get(Object.getPrototypeOf(ActionsAnnotation.prototype), 'constructor', this).apply(this, arguments);
    }

    // Decorators

    _createClass(ActionsAnnotation, [{
      key: 'getInjectionTokens',
      value: function getInjectionTokens() {
        return ['LuxyFlux', 'LuxyFluxActionCreators', 'ApplicationDispatcher'].concat(_get(Object.getPrototypeOf(ActionsAnnotation.prototype), 'getInjectionTokens', this).call(this));
      }
    }, {
      key: 'serviceName',
      get: function get() {
        var name = this.name;
        return name[0].toUpperCase() + name.slice(1) + 'Actions';
      }
    }, {
      key: 'factoryFn',
      get: function get() {
        var TargetCls = this.targetCls;
        var annotation = this;

        return function (LuxyFlux, LuxyFluxActionCreators, ApplicationDispatcher) {
          var injected = Array.from(arguments).slice(3);
          var instance = new (_bind.apply(TargetCls, [null].concat(_toConsumableArray(injected))))();

          annotation.applyInjectionBindings(instance, injected);
          annotation.applyDecorators(instance);

          return LuxyFlux.createActions({
            dispatcher: ApplicationDispatcher,
            serviceActions: TargetCls.serviceActions,
            decorate: instance
          }, LuxyFluxActionCreators);
        };
      }
    }, {
      key: 'module',
      get: function get() {
        if (!this._module) {
          this._module = _angular2['default'].module('actions.' + this.name, this.dependencies);

          this._module.factory(this.serviceName, this.getInjectionTokens().concat([this.factoryFn]));

          this.configure(this._module);
        }
        return this._module;
      }
    }]);

    return ActionsAnnotation;
  })(_annotation.Annotation);

  exports.ActionsAnnotation = ActionsAnnotation;

  function Actions(config) {
    return function (cls) {
      var actionsName = undefined;
      var isConfigObject = _angular2['default'].isObject(config);

      if (isConfigObject && config.name) {
        actionsName = config.name;
      } else if (_angular2['default'].isString(config)) {
        actionsName = config;
      } else {
        var clsName = cls.name.replace(/actions$/i, '');
        actionsName = '' + clsName[0].toLowerCase() + clsName.slice(1);
      }

      var namespace = isConfigObject && config.namespace !== undefined ? config.namespace : actionsName;

      cls.actionNamespace = _angular2['default'].isString(namespace) && namespace.length ? namespace.replace(/([A-Z])/g, '_$1').toUpperCase() : null;

      (0, _utils.addStaticGetter)(cls, 'annotation', function () {
        return _annotations.Annotations.getActions(actionsName, cls);
      });
    };
  }

  function AsyncAction(actionName) {
    return function (cls, methodName) {
      (0, _utils.addStaticGetterObjectMember)(cls.constructor, 'serviceActions', function () {
        return prepareActionName(cls, actionName, methodName);
      }, methodName);
    };
  }

  function Action(actionName) {
    return function (cls, methodName, descriptor) {
      var originalMethod = descriptor.value;
      descriptor.value = function () {
        var action = prepareActionName(cls, actionName, methodName);

        for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
          payload[_key] = arguments[_key];
        }

        var originalReturn = originalMethod.apply(this, payload);
        var dispatchPromise = this.dispatch.apply(this, [action].concat(payload));
        return _angular2['default'].isDefined(originalReturn) ? originalReturn : dispatchPromise;
      };
    };
  }

  exports['default'] = ActionsAnnotation;

  function prepareActionName(cls, actionName, methodName) {
    var preparedActionName = actionName;
    if (!preparedActionName) {
      preparedActionName = methodName.replace(/([A-Z])/g, '_$1');
    }
    var actionNamespace = cls.constructor.actionNamespace;
    if (actionNamespace) {
      preparedActionName = actionNamespace + '_' + preparedActionName;
    }
    return preparedActionName.toUpperCase();
  }
});
//# sourceMappingURL=actions.js.map
