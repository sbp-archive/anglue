define(['exports', 'angular', './behavior', '../store', './transformable', '../utils'], function (exports, _angular, _behavior, _store, _transformable, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.FilterableStore = FilterableStore;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  var _angular2 = _interopRequireDefault(_angular);

  var FilterableStoreBehavior = (function (_Behavior) {
    _inherits(FilterableStoreBehavior, _Behavior);

    function FilterableStoreBehavior(instance) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var collection = _ref.collection;
      var transformerWeight = _ref.transformerWeight;

      _classCallCheck(this, FilterableStoreBehavior);

      _get(Object.getPrototypeOf(FilterableStoreBehavior.prototype), 'constructor', this).apply(this, arguments);

      this.searchText = null;
      this.collection = collection || 'items';
      this.transformerWeight = transformerWeight || 25;
      this.filters = new Map();
    }

    _createClass(FilterableStoreBehavior, [{
      key: 'onChangeFilter',
      value: function onChangeFilter(filterName, expression, comparator) {
        var _this = this;

        this.filters.set(filterName, function (items) {
          return _this.$filter('filter')(items, expression, comparator);
        });
        this.doFilter();
      }
    }, {
      key: 'onClearFilter',
      value: function onClearFilter(filterName) {
        this.filters['delete'](filterName);
        this.doFilter();
      }
    }, {
      key: 'onChangeSearch',
      value: function onChangeSearch(searchText) {
        if (_angular2['default'].isString(searchText) && searchText.trim().length > 0) {
          this.searchText = searchText.trim();
          this.onChangeFilter('__search', this.searchText);
        }
      }
    }, {
      key: 'onClearSearch',
      value: function onClearSearch() {
        this.searchText = null;
        this.onClearFilter('__search');
      }
    }, {
      key: 'doFilter',
      value: function doFilter() {
        var _this2 = this;

        var collection = this.transformableCollection;
        var transformer = this.transformer;

        transformer.fn = function (items) {
          var filtered = items.slice();

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = _this2.filters.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var filterFn = _step.value;

              filtered = filterFn(filtered);
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

          return filtered;
        };

        if (collection.transformers.indexOf(transformer) >= 0) {
          collection.refresh();
        } else {
          collection.addTransformer(transformer);
        }
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
          this._transformer = new _transformable.Transformer('filterableStore', function (items) {
            return items;
          }, this.transformerWeight);
        }
        return this._transformer;
      }
    }]);

    return FilterableStoreBehavior;
  })(_behavior.Behavior);

  exports.FilterableStoreBehavior = FilterableStoreBehavior;

  function FilterableStore(config) {
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

      var changeFilterHandlerName = 'on' + preparedConfig.entity + 'ChangeFilter';
      var clearFilterHandlerName = 'on' + preparedConfig.entity + 'ClearFilter';
      (0, _store.Handler)(null, false)(cls.prototype, changeFilterHandlerName);
      (0, _store.Handler)(null, false)(cls.prototype, clearFilterHandlerName);

      var changeSearchHandlerName = 'on' + preparedConfig.entity + 'ChangeSearch';
      var clearSearchHandlerName = 'on' + preparedConfig.entity + 'ClearSearch';
      (0, _store.Handler)(null, false)(cls.prototype, changeSearchHandlerName);
      (0, _store.Handler)(null, false)(cls.prototype, clearSearchHandlerName);

      (0, _utils.addBehavior)(cls, FilterableStoreBehavior, {
        property: 'filterableStore',
        config: preparedConfig,
        proxy: [changeFilterHandlerName + ':onChangeFilter', clearFilterHandlerName + ':onClearFilter', changeSearchHandlerName + ':onChangeSearch', clearSearchHandlerName + ':onClearSearch', 'searchText']
      });
    };
  }
});
//# sourceMappingURL=filterable-store.js.map
