define(['exports', 'angular', './annotation', './annotations', './utils'], function (exports, _angular, _annotation, _annotations, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  exports.Component = Component;
  exports.View = View;
  exports.Binding = Binding;
  exports.Flag = Flag;
  exports.Event = Event;
  exports.StoreListener = StoreListener;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _angular2 = _interopRequireDefault(_angular);

  var COMPONENT_ENTITY_REGEX = /^([A-Z][a-z]*)/;

  exports.COMPONENT_ENTITY_REGEX = COMPONENT_ENTITY_REGEX;

  var ComponentEvent = (function () {
    function ComponentEvent() {
      _classCallCheck(this, ComponentEvent);

      this.expression = null;
    }

    _createClass(ComponentEvent, [{
      key: 'fire',
      value: function fire(locals) {
        this.expression(locals);
      }
    }]);

    return ComponentEvent;
  })();

  exports.ComponentEvent = ComponentEvent;

  var ComponentAnnotation = (function (_Annotation) {
    _inherits(ComponentAnnotation, _Annotation);

    function ComponentAnnotation() {
      _classCallCheck(this, ComponentAnnotation);

      _get(Object.getPrototypeOf(ComponentAnnotation.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ComponentAnnotation, [{
      key: 'applyFlags',
      value: function applyFlags(instance) {
        var flags = this.flags;
        if (flags) {
          Object.keys(flags).forEach(function (flag) {
            var property = '_' + flag + 'Flag';
            Reflect.defineProperty(instance, flag, {
              get: function get() {
                return _angular2['default'].isDefined(this[property]) ? this[property] !== 'false' : false;
              }
            });
          });
        }
      }
    }, {
      key: 'applyStoreListeners',
      value: function applyStoreListeners(instance) {
        var storeListeners = this.storeListeners;
        if (storeListeners) {
          instance._storeListeners = instance._storeListeners || [];

          Object.keys(storeListeners).forEach(function (listener) {
            var handler = storeListeners[listener];
            var parts = listener.split(':');
            var store = parts[0];
            var event = parts[1];

            instance._storeListeners.push(instance[store].addListener(event, instance[handler].bind(instance)));
          });
        }
      }
    }, {
      key: 'getInjectionTokens',
      value: function getInjectionTokens() {
        return ['$scope', '$log'].concat(_get(Object.getPrototypeOf(ComponentAnnotation.prototype), 'getInjectionTokens', this).call(this));
      }
    }, {
      key: 'controllerCls',
      get: function get() {
        var annotation = this;
        var TargetCls = this.targetCls;
        var storeListeners = this.storeListeners;

        var ControllerCls = (function (_TargetCls) {
          _inherits(ControllerCls, _TargetCls);

          function ControllerCls($scope, $log) {
            var _this = this;

            _classCallCheck(this, ControllerCls);

            var injected = Array.from(arguments).slice(2);

            _get(Object.getPrototypeOf(ControllerCls.prototype), 'constructor', this).apply(this, injected);

            annotation.applyInjectionBindings(this, injected);
            annotation.applyFlags(this);
            annotation.applyBehaviors(this);
            annotation.applyDecorators(this);
            annotation.applyStoreListeners(this);

            if (storeListeners || this.onDestroy instanceof Function) {
              $scope.$on('$destroy', function () {
                if (_this._storeListeners) {
                  _this._storeListeners.forEach(function (listener) {
                    return listener();
                  });
                }
                if (_this.onDestroy instanceof Function) {
                  _this.onDestroy();
                }
              });
            }

            if (this.activate instanceof Function) {
              this.activate();
            }

            this.fireComponentEvent = function (event, locals) {
              $log.warn('\n            Component.fireComponentEvent() has been deprecated in Anglue 1.x.\n            Please use @Event() myEvent; in combination with this.myEvent.fire().\n          ');
              if (_this._eventHandlers && _this._eventHandlers[event]) {
                Reflect.apply(_this._eventHandlers[event], _this, [locals]);
              }
            };
          }

          return ControllerCls;
        })(TargetCls);

        return ControllerCls;
      }
    }, {
      key: 'dependencies',
      get: function get() {
        var targetCls = this.targetCls;
        return [].concat(targetCls.dependencies || [], _annotation.Annotation.getModuleNames(targetCls.components));
      }
    }, {
      key: 'template',
      get: function get() {
        return this.targetCls.template || null;
      }
    }, {
      key: 'bindings',
      get: function get() {
        return this.targetCls.bindings || null;
      }
    }, {
      key: 'events',
      get: function get() {
        return this.targetCls.events || null;
      }
    }, {
      key: 'storeListeners',
      get: function get() {
        return this.targetCls.storeListeners || null;
      }
    }, {
      key: 'flags',
      get: function get() {
        return this.targetCls.flags || null;
      }

      //noinspection InfiniteRecursionJS
    }, {
      key: 'getDirective',
      get: function get() {
        return this.targetCls.getDirective || function (config) {
          return function () {
            return config;
          };
        };
      }
    }, {
      key: 'module',
      get: function get() {
        var _this2 = this;

        if (!this._module) {
          var _iteratorNormalCompletion;

          var _didIteratorError;

          var _iteratorError;

          var _iterator, _step;

          (function () {
            var name = _this2.name;
            var template = _this2.template;
            var bindings = _this2.bindings;
            var events = _this2.events;

            _this2._module = _angular2['default'].module('components.' + name, _this2.dependencies);

            var directiveConfig = {
              restrict: 'EA',
              controllerAs: name,
              bindToController: true,
              scope: true,
              controller: _this2.getInjectionTokens().concat([_this2.controllerCls])
            };

            if (template) {
              if (template.url) {
                directiveConfig.templateUrl = template.url;
              } else if (template.inline) {
                directiveConfig.template = template.inline;
              }
              if (template.replace) {
                directiveConfig.replace = true;
              }
            }

            if (bindings) {
              var scope = directiveConfig.scope = {};
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;

              try {
                for (_iterator = Object.keys(bindings)[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var binding = _step.value;

                  var attr = bindings[binding];
                  if (!attr[0].match(/(&|=|@)/)) {
                    attr = '=' + attr;
                  }
                  scope[binding] = attr;
                }
              } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
                }
              }
            }

            if (events) {
              directiveConfig.link = function (scope, el, attr, ctrl) {
                if (events) {
                  (function () {
                    var eventHandlers = ctrl._eventHandlers = {};
                    Object.keys(events).forEach(function (event) {
                      if (attr[event]) {
                        eventHandlers[events[event]] = function (locals) {
                          scope.$parent.$eval(attr[event], locals);
                        };
                        var componentEventName = events[event];
                        if (ctrl[componentEventName] instanceof ComponentEvent) {
                          ctrl[componentEventName].expression = ctrl['_' + componentEventName + 'Expression'];
                        }
                      }
                    });
                  })();
                }
              };
            }

            _this2._module.directive(name, _this2.getDirective(directiveConfig));

            _this2.configure(_this2._module);
          })();
        }

        return this._module;
      }
    }]);

    return ComponentAnnotation;
  })(_annotation.Annotation);

  exports.ComponentAnnotation = ComponentAnnotation;
  exports['default'] = ComponentAnnotation;

  function Component(config) {
    return function (cls) {
      var componentName = undefined;
      var isConfigObject = _angular2['default'].isObject(config);

      if (isConfigObject && config.name) {
        componentName = config.name;
      } else if (_angular2['default'].isString(config)) {
        componentName = config;
      } else {
        var clsName = cls.name.replace(/component$/i, '');
        componentName = '' + clsName[0].toLowerCase() + clsName.slice(1);
      }

      if (isConfigObject) {
        if (config.dependencies) {
          (0, _utils.addStaticGetter)(cls, 'dependencies', function () {
            return config.dependencies;
          });
        }

        new View(config)(cls);
      }

      (0, _utils.addStaticGetter)(cls, 'annotation', function () {
        return _annotations.Annotations.getComponent(componentName, cls);
      });
    };
  }

  function View() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return function (cls) {
      if (config.template) {
        (0, _utils.addStaticGetter)(cls, 'template', function () {
          return {
            inline: config.template,
            replace: config.replace || false
          };
        });
      } else if (config.templateUrl) {
        (0, _utils.addStaticGetter)(cls, 'template', function () {
          return {
            url: config.templateUrl,
            replace: config.replace || false
          };
        });
      }
      if (config.components) {
        (0, _utils.addStaticGetter)(cls, 'components', function () {
          return config.components;
        });
      }
    };
  }

  function Binding(config) {
    return function (cls, propertyName, descriptor) {
      var isConfigObject = _angular2['default'].isObject(config);
      var attribute = propertyName;

      if (isConfigObject && config.attribute) {
        attribute = config.attribute;
      } else if (_angular2['default'].isString(config)) {
        attribute = config;
      }

      if (isConfigObject && config.expression === true) {
        attribute = '&' + attribute;
      } else if (isConfigObject && config.string === true) {
        attribute = '@' + attribute;
      } else {
        attribute = '=' + attribute;
      }

      // For some reason these property initializers are called after
      // the bindings have already been set by angular. This causes
      // them to be set back to undefined again. Thus this override
      // to make sure we just return whatever the value was already.
      if (descriptor.initializer !== undefined) {
        descriptor.initializer = function () {
          return this[propertyName];
        };
      }

      (0, _utils.addStaticGetterObjectMember)(cls.constructor, 'bindings', propertyName, attribute);
    };
  }

  function Flag(config) {
    return function (cls, propertyName) {
      var attribute = config || propertyName;
      (0, _utils.addStaticGetterObjectMember)(cls.constructor, 'flags', propertyName, attribute);

      var propertyBinding = '_' + propertyName + 'Flag';
      var attributeBinding = '@' + attribute;
      (0, _utils.addStaticGetterObjectMember)(cls.constructor, 'bindings', propertyBinding, attributeBinding);
    };
  }

  function Event() {
    return function (cls, propertyName, descriptor) {
      var attribute = 'on' + propertyName[0].toUpperCase() + propertyName.slice(1);
      if (!descriptor.initializer) {
        descriptor.initializer = function () {
          return new ComponentEvent();
        };
      }
      (0, _utils.addStaticGetterObjectMember)(cls.constructor, 'events', attribute, propertyName);
      (0, _utils.addStaticGetterObjectMember)(cls.constructor, 'bindings', '_' + propertyName + 'Expression', '&' + attribute);
    };
  }

  var STORE_LISTENER_REGEX = /^on([A-Z])([\w]+Store)([A-Z])(.*)$/;

  function StoreListener(listenerDescriptor) {
    return function (cls, handlerName) {
      var descriptor = undefined;
      if (listenerDescriptor) {
        if (listenerDescriptor.split(':').length !== 2) {
          throw new Error('An event for StoreListener should be provided in the form of \'store:event\'. ' + listenerDescriptor + ' does not conform to this');
        }
        descriptor = listenerDescriptor;
      } else {
        descriptor = handlerName.replace(STORE_LISTENER_REGEX, function (match, _1, _2, _3, _4) {
          return '' + _1.toLowerCase() + _2 + ':' + _3.toLowerCase() + _4;
        });
      }

      (0, _utils.addStaticGetterObjectMember)(cls.constructor, 'storeListeners', descriptor, handlerName);
    };
  }
});
//# sourceMappingURL=component.js.map
