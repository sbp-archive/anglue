define(['exports', 'angular', './annotation', './annotations', './utils'], function (exports, _angular, _annotation, _annotations, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.Application = Application;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  var _angular2 = _interopRequireDefault(_angular);

  var ApplicationAnnotation = (function (_Annotation) {
    _inherits(ApplicationAnnotation, _Annotation);

    function ApplicationAnnotation() {
      _classCallCheck(this, ApplicationAnnotation);

      _get(Object.getPrototypeOf(ApplicationAnnotation.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ApplicationAnnotation, [{
      key: 'configure',
      value: function configure(angularModule) {
        var routes = this.targetCls.routes;

        // The ApplicationDispatcher is the (singleton) dispatcher instance used
        // in our entire application. Every ActionCreator in this app dispatches
        // through this instance and all app stores are registered to it
        angularModule.service('ApplicationDispatcher', ['LuxyFluxDispatcher', function (Dispatcher) {
          return new Dispatcher('ApplicationDispatcher');
        }]);

        if (routes) {
          angularModule.config(['$stateProvider', '$urlRouterProvider', function routerConfig($stateProvider, $urlRouterProvider) {
            if (routes.defaultRoute) {
              $urlRouterProvider.otherwise(routes.defaultRoute);
              Reflect.deleteProperty(routes, 'defaultRoute');
            }

            Object.keys(routes).forEach(function (name) {
              $stateProvider.state(name, routes[name]);
            });
          }]);
        }
      }
    }, {
      key: 'dependencies',
      get: function get() {
        var targetCls = this.targetCls;
        var extraDependencies = ['luxyflux'];
        if (targetCls.routes) {
          extraDependencies.push('ui.router');
        }
        return extraDependencies.concat(targetCls.dependencies || [], _annotation.Annotation.getModuleNames(targetCls.components), _annotation.Annotation.getModuleNames(targetCls.stores), _annotation.Annotation.getModuleNames(targetCls.actions));
      }
    }, {
      key: 'module',
      get: function get() {
        if (!this._module) {
          var annotationNames = _annotation.Annotation.getAnnotationServiceNames(this.targetCls.stores);
          var controllerDependencies = annotationNames.concat([function () {}]);

          this._module = _angular2['default'].module(this.name, this.dependencies).run(controllerDependencies);

          this.configure(this._module);
        }

        return this._module;
      }
    }]);

    return ApplicationAnnotation;
  })(_annotation.Annotation);

  exports.ApplicationAnnotation = ApplicationAnnotation;
  exports['default'] = ApplicationAnnotation;

  function Application(config) {
    return function (cls) {
      var applicationName = undefined;
      var isConfigObject = _angular2['default'].isObject(config);

      if (isConfigObject && config.name) {
        applicationName = config.name;
      } else if (_angular2['default'].isString(config)) {
        applicationName = config;
      } else {
        var clsName = cls.name.replace(/application$/i, '');
        applicationName = '' + clsName[0].toLowerCase() + clsName.slice(1);
      }

      if (isConfigObject) {
        if (config.routes) {
          (0, _utils.mergeStaticGetterObject)(cls, 'routes', config.routes);
        }
        if (config.dependencies) {
          (0, _utils.mergeStaticGetterArray)(cls, 'dependencies', config.dependencies);
        }
        if (config.components) {
          (0, _utils.mergeStaticGetterArray)(cls, 'components', config.components);
        }
        if (config.stores) {
          (0, _utils.mergeStaticGetterArray)(cls, 'stores', config.stores);
        }
        if (config.actions) {
          (0, _utils.mergeStaticGetterArray)(cls, 'actions', config.actions);
        }
      }

      (0, _utils.addStaticGetter)(cls, 'annotation', function () {
        return _annotations.Annotations.getApplication(applicationName, cls);
      });
    };
  }
});
//# sourceMappingURL=application.js.map
