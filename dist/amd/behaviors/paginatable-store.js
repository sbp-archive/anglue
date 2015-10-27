define(['exports', 'angular', './behavior', '../store', './transformable', '../utils'], function (exports, _angular, _behavior, _store, _transformable, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.PaginatableStore = PaginatableStore;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _angular2 = _interopRequireDefault(_angular);

  var PaginationState = function PaginationState() {
    var page = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
    var limit = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, PaginationState);

    this.total = 0;

    this.page = page;
    this.limit = limit;
  };

  exports.PaginationState = PaginationState;

  var PaginatableStoreBehavior = (function (_Behavior) {
    _inherits(PaginatableStoreBehavior, _Behavior);

    function PaginatableStoreBehavior(instance) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var collection = _ref.collection;
      var initialPage = _ref.initialPage;
      var initialLimit = _ref.initialLimit;
      var transformerWeight = _ref.transformerWeight;

      _classCallCheck(this, PaginatableStoreBehavior);

      _get(Object.getPrototypeOf(PaginatableStoreBehavior.prototype), 'constructor', this).apply(this, arguments);

      this.collection = collection || 'items';
      this.transformerWeight = transformerWeight || 75;

      this.state = new PaginationState(initialPage, initialLimit);

      this.refresh();
    }

    _createClass(PaginatableStoreBehavior, [{
      key: 'refresh',
      value: function refresh() {
        var collection = this.transformableCollection;
        var limit = this.state.limit;

        if (collection.transformers.indexOf(this.transformer) >= 0) {
          if (limit === null) {
            collection.removeTransformer(this.transformer);
          } else {
            collection.refresh();
          }
        } else if (limit !== null) {
          collection.addTransformer(this.transformer);
        }
      }
    }, {
      key: 'onChangePage',
      value: function onChangePage(page) {
        if (this.state.page !== page) {
          this.state.page = Math.max(0, page);
          this.refresh();
        }
      }
    }, {
      key: 'onChangeLimit',
      value: function onChangeLimit(limit) {
        if (this.state.limit !== limit) {
          this.state.limit = limit;
          this.refresh();
        }
      }
    }, {
      key: 'transformableCollection',
      get: function get() {
        return this.instance.transformables[this.collection];
      }
    }, {
      key: 'transformer',
      get: function get() {
        var _this = this;

        if (!this._transformer) {
          (function () {
            var state = _this.state;
            _this._transformer = new _transformable.Transformer('paginatableStore', function (items) {
              // We update the total based on the amount of items we get
              // when this transformer is run. This means that if there is
              // a filtering transformer before the pagination filter, those
              // items will not count to the total property.
              state.total = items.length;

              var limit = state.limit;
              var start = (state.page - 1) * limit;
              var end = Math.min(state.total, start + limit);

              return items.slice(start, end);
            }, _this.transformerWeight);
          })();
        }

        return this._transformer;
      }
    }]);

    return PaginatableStoreBehavior;
  })(_behavior.Behavior);

  exports.PaginatableStoreBehavior = PaginatableStoreBehavior;

  function PaginatableStore(config) {
    return function (cls) {
      var preparedConfig = config;
      if (_angular2['default'].isString(config)) {
        preparedConfig = { entity: config };
      }

      preparedConfig = Object.assign({
        collection: 'items',
        entity: cls.name.replace(/store$/i, '')
      }, preparedConfig);

      (0, _transformable.Transformable)()(cls.prototype, preparedConfig.collection);

      var changePageHandlerName = 'on' + (0, _utils.camelcase)(preparedConfig.entity) + 'ChangePage';
      var changeLimitHandlerName = 'on' + (0, _utils.camelcase)(preparedConfig.entity) + 'ChangeLimit';
      (0, _store.Handler)(null, false)(cls.prototype, changePageHandlerName);
      (0, _store.Handler)(null, false)(cls.prototype, changeLimitHandlerName);

      (0, _utils.addBehavior)(cls, PaginatableStoreBehavior, {
        property: 'paginatableStore',
        config: preparedConfig,
        proxy: [changePageHandlerName + ':onChangePage', changeLimitHandlerName + ':onChangeLimit', 'paginationState:state']
      });
    };
  }
});
//# sourceMappingURL=paginatable-store.js.map
