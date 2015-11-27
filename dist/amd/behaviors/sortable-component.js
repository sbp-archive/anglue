define(['exports', 'angular', './behavior', '../utils', '../component'], function (exports, _angular, _behavior, _utils, _component) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.SortableComponent = SortableComponent;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  var _angular2 = _interopRequireDefault(_angular);

  var SortableComponentBehavior = (function (_Behavior) {
    _inherits(SortableComponentBehavior, _Behavior);

    function SortableComponentBehavior(instance) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var actions = _ref.actions;
      var store = _ref.store;

      _classCallCheck(this, SortableComponentBehavior);

      _get(Object.getPrototypeOf(SortableComponentBehavior.prototype), 'constructor', this).apply(this, arguments);

      this.actions = actions;
      this.store = store;

      var className = Reflect.getPrototypeOf(instance).constructor.name;
      if (!this.actionsRef) {
        throw new Error('SortableComponentBehavior: \'' + actions + '\' not found on ' + className);
      }
      if (!this.storeRef) {
        throw new Error('SortableComponentBehavior: \'' + store + '\' not found on ' + className);
      }
    }

    _createClass(SortableComponentBehavior, [{
      key: 'actionsRef',
      get: function get() {
        return this.instance[this.actions];
      }
    }, {
      key: 'storeRef',
      get: function get() {
        return this.instance[this.store];
      }
    }, {
      key: 'sortExpression',
      set: function set(sortExpression) {
        if (sortExpression === null) {
          this.actionsRef.clearSort();
        } else {
          this.actionsRef.changeSort(sortExpression);
        }
      },
      get: function get() {
        return this.storeRef.sortExpression;
      }
    }]);

    return SortableComponentBehavior;
  })(_behavior.Behavior);

  exports.SortableComponentBehavior = SortableComponentBehavior;

  function SortableComponent() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return function (cls) {
      var preparedConfig = config;
      if (_angular2['default'].isString(config)) {
        preparedConfig = { actions: config };
      }

      if (!preparedConfig.entity) {
        preparedConfig.entity = cls.name.match(_component.COMPONENT_ENTITY_REGEX)[1].toLowerCase();
      }
      if (!preparedConfig.actions) {
        preparedConfig.actions = preparedConfig.entity.toLowerCase() + 'Actions';
      }
      if (!preparedConfig.store) {
        preparedConfig.store = preparedConfig.entity.toLowerCase() + 'Store';
      }

      (0, _utils.addBehavior)(cls, SortableComponentBehavior, {
        property: 'sortableComponent',
        config: preparedConfig,
        proxy: ['sortExpression']
      });
    };
  }
});
//# sourceMappingURL=sortable-component.js.map
