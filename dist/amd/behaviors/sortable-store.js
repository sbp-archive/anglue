define(['exports', 'angular', './behavior', '../store', './transformable', '../utils'], function (exports, _angular, _behavior, _store, _transformable, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.SortableStore = SortableStore;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  var _angular2 = _interopRequireDefault(_angular);

  var SortableStoreBehavior = (function (_Behavior) {
    _inherits(SortableStoreBehavior, _Behavior);

    function SortableStoreBehavior(instance) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var collection = _ref.collection;
      var transformerWeight = _ref.transformerWeight;

      _classCallCheck(this, SortableStoreBehavior);

      _get(Object.getPrototypeOf(SortableStoreBehavior.prototype), 'constructor', this).apply(this, arguments);

      this.collection = collection || 'items';
      this.transformerWeight = transformerWeight || 50;
    }

    _createClass(SortableStoreBehavior, [{
      key: 'onChangeSort',

      /**
       * This is a handler proxy for the Store. It get's called with the payload of
       * the ENTITY_SORT_CHANGE action.
       *
       * @param  {String/Array/Boolean} expression
       * This can be any valid angular orderBy $filter expression, or a reverse boolean
       * if the collection we are sorting contains primitives.
       *
       *    Valid angular orderBy $filter expressions are
       *
       *    - `function`: Getter function. The result of this function will be sorted using the
       *      `<`, `===`, `>` operator.
       *    - `string`: An Angular expression. The result of this expression is used to compare elements
       *      (for example `name` to sort by a property called `name` or `name.substr(0, 3)` to sort by
       *      3 first characters of a property called `name`). The result of a constant expression
       *      is interpreted as a property name to be used in comparisons (for example `"special name"`
       *      to sort object by the value of their `special name` property). An expression can be
       *      optionally prefixed with `+` or `-` to control ascending or descending sort order
       *      (for example, `+name` or `-name`). If no property is provided, (e.g. `'+'`) then the array
       *      element itself is used to compare where sorting.
       *    - `Array`: An array of string predicates. The first predicate in the array
       *      is used for sorting, but when two items are equivalent, the next predicate is used.
       */
      value: function onChangeSort() {
        var _this = this;

        var expression = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        var collection = this.transformableCollection;
        var transformer = this.transformer;

        var orderByExpression = expression;
        if (typeof expression === 'boolean') {
          orderByExpression = expression ? '-' : '+';
        }

        transformer.fn = function (items) {
          return _this.$filter('orderBy')(items, orderByExpression);
        };

        if (collection.transformers.indexOf(transformer) >= 0) {
          collection.refresh();
        } else {
          collection.addTransformer(transformer);
        }
      }
    }, {
      key: 'onClearSort',
      value: function onClearSort() {
        this.transformableCollection.removeTransformer(this.transformer);
      }
    }, {
      key: '$filter',
      get: function get() {
        return this.instance.$filter;
      }
    }, {
      key: 'transformableCollection',
      get: function get() {
        return this.instance.transformables[this.collection];
      }
    }, {
      key: 'transformer',
      get: function get() {
        if (!this._transformer) {
          this._transformer = new _transformable.Transformer('sortableStore', function (items) {
            return items;
          }, this.transformerWeight);
        }
        return this._transformer;
      }
    }]);

    return SortableStoreBehavior;
  })(_behavior.Behavior);

  exports.SortableStoreBehavior = SortableStoreBehavior;

  function SortableStore(config) {
    return function (cls) {
      var preparedConfig = config;
      if (_angular2['default'].isString(config)) {
        preparedConfig = { entity: config };
      }

      preparedConfig = Object.assign({
        collection: 'items',
        entity: cls.name.replace(/store$/i, '')
      }, preparedConfig);
      preparedConfig.entity = (0, _utils.camelcase)(preparedConfig.entity);

      (0, _utils.Inject)()(cls.prototype, '$filter');
      (0, _transformable.Transformable)()(cls.prototype, preparedConfig.collection);

      var changeHandlerName = 'on' + preparedConfig.entity + 'ChangeSort';
      var clearHandlerName = 'on' + preparedConfig.entity + 'ClearSort';
      (0, _store.Handler)(null, false)(cls.prototype, changeHandlerName);
      (0, _store.Handler)(null, false)(cls.prototype, clearHandlerName);

      (0, _utils.addBehavior)(cls, SortableStoreBehavior, {
        property: 'sortableStore',
        config: preparedConfig,
        proxy: [changeHandlerName + ':onChangeSort', clearHandlerName + ':onClearSort']
      });
    };
  }
});
//# sourceMappingURL=sortable-store.js.map
