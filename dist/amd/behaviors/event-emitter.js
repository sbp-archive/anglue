define(['exports', './behavior', '../utils'], function (exports, _behavior, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.EventEmitter = EventEmitter;

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  var EventEmitterBehavior = (function (_Behavior) {
    _inherits(EventEmitterBehavior, _Behavior);

    function EventEmitterBehavior() {
      _classCallCheck(this, EventEmitterBehavior);

      _get(Object.getPrototypeOf(EventEmitterBehavior.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(EventEmitterBehavior, [{
      key: 'addListener',
      value: function addListener(event, handler) {
        var _this = this;

        var events = this.events;
        if (!events.has(event)) {
          events.set(event, new Set());
        }
        events.get(event).add(handler);
        return function () {
          _this.removeListener(event, handler);
        };
      }
    }, {
      key: 'removeListener',
      value: function removeListener(event, handler) {
        var events = this.events;
        var eventSet = events.get(event);
        if (!eventSet || !eventSet.has(handler)) {
          return;
        }
        eventSet['delete'](handler);
        if (!eventSet.size) {
          events['delete'](event);
        }
      }
    }, {
      key: 'emit',
      value: function emit(event) {
        var events = this.events;
        if (!events.has(event)) {
          return;
        }

        var args = Array.from(arguments).slice(1);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = events.get(event)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var handler = _step.value;

            handler.apply(undefined, _toConsumableArray(args));
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
    }, {
      key: 'events',
      get: function get() {
        if (!this._events) {
          this._events = new Map();
        }
        return this._events;
      }
    }]);

    return EventEmitterBehavior;
  })(_behavior.Behavior);

  exports.EventEmitterBehavior = EventEmitterBehavior;

  function EventEmitter(config) {
    return function (cls) {
      (0, _utils.addBehavior)(cls, EventEmitterBehavior, {
        config: config,
        property: 'eventEmitter',
        proxy: ['on:addListener', 'off:removeListener', 'addListener', 'removeListener', 'emit']
      });
    };
  }
});
//# sourceMappingURL=event-emitter.js.map
