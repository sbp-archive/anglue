define(['exports', 'angular'], function (exports, _angular) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.addStaticGetterObjectMember = addStaticGetterObjectMember;
  exports.mergeStaticGetterObject = mergeStaticGetterObject;
  exports.addStaticGetterArrayMember = addStaticGetterArrayMember;
  exports.mergeStaticGetterArray = mergeStaticGetterArray;
  exports.addStaticGetter = addStaticGetter;
  exports.addBehavior = addBehavior;
  exports.addProxies = addProxies;
  exports.Inject = Inject;
  exports.Decorators = Decorators;
  exports.getCurrentDescriptorValue = getCurrentDescriptorValue;
  exports.camelcase = camelcase;
  exports.camelCaseToDashes = camelCaseToDashes;
  exports.dashesToCamelCase = dashesToCamelCase;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _angular2 = _interopRequireDefault(_angular);

  // Static object members need to be overridden async since some keys
  // need to be resolved AFTER the class has fully been defined. This is
  // because some property decorators might rely on class decorator configs,
  // and property decorators are called before class decorators.

  function addStaticGetterObjectMember(cls, propertyName, key, value) {
    var override = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];

    var currentPropertyDescriptor = Reflect.getOwnPropertyDescriptor(cls, propertyName);
    Reflect.defineProperty(cls, propertyName, {
      configurable: true,
      get: function get() {
        var newObject = getCurrentDescriptorValue(currentPropertyDescriptor);
        var resolvedKey = _angular2['default'].isFunction(key) ? key() : key;
        if (override === true || !_angular2['default'].isDefined(newObject[resolvedKey])) {
          newObject[resolvedKey] = value;
        }
        return newObject;
      }
    });
  }

  function mergeStaticGetterObject(cls, propertyName, values) {
    var override = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

    // Look at the explanation above addStaticGetterObjectMember to see
    // why we do this override asynchronously...
    var currentPropertyDescriptor = Reflect.getOwnPropertyDescriptor(cls, propertyName);
    Reflect.defineProperty(cls, propertyName, {
      configurable: true,
      get: function get() {
        return override ? Object.assign({}, getCurrentDescriptorValue(currentPropertyDescriptor), values) : Object.assign({}, values, getCurrentDescriptorValue(currentPropertyDescriptor));
      }
    });
  }

  function addStaticGetterArrayMember(cls, propertyName, value) {
    mergeStaticGetterArray(cls, propertyName, [value]);
  }

  function mergeStaticGetterArray(cls, propertyName, values) {
    var getterArray = cls[propertyName] || [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var value = _step.value;

        if (getterArray.indexOf(value) === -1) {
          getterArray.push(value);
        }
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

    Reflect.defineProperty(cls, propertyName, {
      configurable: true,
      get: function get() {
        return getterArray;
      }
    });
  }

  function addStaticGetter(cls, property, getter) {
    Reflect.defineProperty(cls, property, { configurable: true, get: getter });
  }

  function addBehavior(cls, BehaviorCls, _ref) {
    var property = _ref.property;
    var config = _ref.config;
    var proxy = _ref.proxy;

    var internalProperty = '_' + property;
    Reflect.defineProperty(cls.prototype, property, {
      get: function get() {
        if (!this[internalProperty]) {
          this[internalProperty] = new BehaviorCls(this, config);
        }
        return this[internalProperty];
      }
    });

    if (proxy) {
      addProxies(cls, BehaviorCls, property, proxy);
    }
  }

  function addProxies(cls, BehaviorCls, property, proxies) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = proxies[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var proxy = _step2.value;

        var parts = proxy.split(':');
        var localName = parts[0].trim();

        // We don't want to override any methods that already exist in the prototype
        // of the target cls. If the method already exists, its the class author's
        // responsibility to call behavior methods.
        /*eslint-disable no-loop-func */
        if (!Reflect.getOwnPropertyDescriptor(cls.prototype, localName)) {
          (function () {
            var externalName = parts[1] ? parts[1].trim() : localName;
            var descriptor = Reflect.getOwnPropertyDescriptor(BehaviorCls.prototype, externalName);

            // This should be a simple property
            if (_angular2['default'].isUndefined(descriptor) || _angular2['default'].isDefined(descriptor.get)) {
              var proxyDescriptor = {
                get: function get() {
                  return this[property][externalName];
                }
              };

              if (_angular2['default'].isDefined(descriptor) && _angular2['default'].isDefined(descriptor.set)) {
                Object.assign(proxyDescriptor, {
                  set: function set(value) {
                    this[property][externalName] = value;
                  }
                });
              }

              Reflect.defineProperty(cls.prototype, localName, proxyDescriptor);
            } else if (_angular2['default'].isDefined(descriptor.value)) {
              Reflect.defineProperty(cls.prototype, localName, {
                value: function value() {
                  var _property;

                  return (_property = this[property])[externalName].apply(_property, arguments);
                }
              });
            }

            /*eslint-enable no-loop-func */
          })();
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  function Inject(injectionName) {
    return function (cls, propertyName) {
      var preparedInjectionName = injectionName;
      if (!preparedInjectionName) {
        preparedInjectionName = '' + propertyName[0].toUpperCase() + propertyName.slice(1);
      }
      addStaticGetterObjectMember(cls.constructor, 'injections', propertyName, preparedInjectionName);
    };
  }

  function Decorators(decorators) {
    return function (cls) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = decorators[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var decorator = _step3.value;

          addStaticGetterArrayMember(cls, 'decorators', decorator);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    };
  }

  function getCurrentDescriptorValue(propertyDescriptor) {
    if (propertyDescriptor === undefined) {
      return {};
    } else if (propertyDescriptor.get) {
      return propertyDescriptor.get();
    }
    return propertyDescriptor.value;
  }

  function camelcase(name) {
    return '' + name[0].toUpperCase() + name.slice(1);
  }

  function camelCaseToDashes(name) {
    return name.replace(/([a-z])([A-Z])/g, '$1-$2');
  }

  function dashesToCamelCase(name) {
    return String(name).replace(/-([a-z])/g, function (part) {
      return part[1].toUpperCase();
    });
  }
});
//# sourceMappingURL=utils.js.map
