define(['exports', 'angular', './behavior', '../store', './transformable', '../utils'], function (exports, _angular, _behavior, _store, _transformable, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var _slice = Array.prototype.slice;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.EntityStore = EntityStore;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  var _angular2 = _interopRequireDefault(_angular);

  var EntityStoreBehavior = (function (_Behavior) {
    _inherits(EntityStoreBehavior, _Behavior);

    function EntityStoreBehavior(instance) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var idProperty = _ref.idProperty;
      var collection = _ref.collection;

      _classCallCheck(this, EntityStoreBehavior);

      _get(Object.getPrototypeOf(EntityStoreBehavior.prototype), 'constructor', this).apply(this, arguments);

      this.isLoading = false;
      this.isCreating = false;
      this.isReading = false;
      this.isUpdating = false;
      this.isDeleting = false;
      this.isSet = false;
      this.hasDetailSet = new Set();
      this.idProperty = idProperty || 'id';
      this.collection = collection || 'items';
      this.reset();
    }

    _createClass(EntityStoreBehavior, [{
      key: 'reset',
      value: function reset() {
        this.loadDeferred = this.createNewDeferred();
        this.createDeferred = this.createNewDeferred();
        this.readDeferred = this.createNewDeferred();
        this.updateDeferred = this.createNewDeferred();
        this.deleteDeferred = this.createNewDeferred();

        this.isSet = false;
        this.items = [];
        this.hasDetailSet.clear();
      }
    }, {
      key: 'createNewDeferred',
      value: function createNewDeferred() {
        return this.instance.$q.defer();
      }
    }, {
      key: 'onChanged',
      value: function onChanged() {
        var _instance;

        this.instance.transformables[this.collection].refresh();
        (_instance = this.instance).emit.apply(_instance, ['changed'].concat(_slice.call(arguments)));
      }
    }, {
      key: 'onError',
      value: function onError() {
        var _instance2;

        (_instance2 = this.instance).emit.apply(_instance2, ['error'].concat(_slice.call(arguments)));
      }
    }, {
      key: 'getById',
      value: function getById(entityId) {
        var _this = this;

        return this.items.find(function (entity) {
          return entity[_this.idProperty] === entityId;
        }) || null;
      }
    }, {
      key: 'hasDetails',
      value: function hasDetails(entityId) {
        return this.hasDetailSet.has(entityId);
      }
    }, {
      key: 'onLoadStarted',
      value: function onLoadStarted() {
        this.isLoading = true;
        this.loadDeferred = this.createNewDeferred();
      }
    }, {
      key: 'onLoadCompleted',
      value: function onLoadCompleted(entities) {
        var items = this.items;

        this.isSet = true;
        this.isLoading = false;
        this.hasDetailSet.clear();

        if (entities && entities.length) {
          items.splice(0, items.length);
          items.splice.apply(items, [0, 0].concat(_toConsumableArray(entities)));
        }

        this.onChanged('load', entities);

        this.loadDeferred.resolve(entities);
      }
    }, {
      key: 'onLoadFailed',
      value: function onLoadFailed(error) {
        this.isLoading = false;

        this.onError('load', error);

        this.loadDeferred.reject(error);
      }
    }, {
      key: 'onCreateStarted',
      value: function onCreateStarted() {
        this.isCreating = true;
        this.createDeferred = this.createNewDeferred();
      }
    }, {
      key: 'onCreateCompleted',
      value: function onCreateCompleted(entity) {
        var entityId = entity[this.idProperty];
        var currentEntity = this.getById(entityId);

        if (currentEntity) {
          Object.assign(currentEntity, entity);
        } else {
          this.items.push(entity);
          currentEntity = entity;
        }

        this.isSet = true;
        this.isCreating = false;
        this.hasDetailSet.add(entityId);

        this.onChanged('create', currentEntity);

        this.createDeferred.resolve(currentEntity);
      }
    }, {
      key: 'onCreateFailed',
      value: function onCreateFailed(error) {
        this.isCreating = false;

        this.onError('create', error);

        this.createDeferred.reject(error);
      }
    }, {
      key: 'onReadStarted',
      value: function onReadStarted() {
        this.isReading = true;
        this.readDeferred = this.createNewDeferred();
      }
    }, {
      key: 'onReadCompleted',
      value: function onReadCompleted(entity) {
        var entityId = entity[this.idProperty];
        var currentEntity = this.getById(entityId);

        if (currentEntity) {
          Object.assign(currentEntity, entity);
        } else {
          this.items.push(entity);
          currentEntity = entity;
        }

        this.isSet = true;
        this.isReading = false;
        this.hasDetailSet.add(entityId);

        this.onChanged('read', currentEntity);

        this.readDeferred.resolve(entity);
      }
    }, {
      key: 'onReadFailed',
      value: function onReadFailed(error) {
        this.isReading = false;

        this.onError('read', error);

        this.readDeferred.reject(error);
      }
    }, {
      key: 'onUpdateStarted',
      value: function onUpdateStarted() {
        this.isUpdating = true;
        this.updateDeferred = this.createNewDeferred();
      }
    }, {
      key: 'onUpdateCompleted',
      value: function onUpdateCompleted(entity) {
        var entityId = entity[this.idProperty];
        var currentEntity = this.getById(entityId);

        this.isUpdating = false;

        if (!currentEntity) {
          this.updateDeferred.reject('Updated entity that is not in this store...', entity);
          return;
        }

        Object.assign(currentEntity, entity);
        this.hasDetailSet.add(entityId);

        this.onChanged('update', currentEntity);

        this.updateDeferred.resolve(entity);
      }
    }, {
      key: 'onUpdateFailed',
      value: function onUpdateFailed(error) {
        this.isUpdating = false;

        this.onError('update', error);

        this.updateDeferred.reject(error);
      }
    }, {
      key: 'onDeleteStarted',
      value: function onDeleteStarted() {
        this.isDeleting = true;
        this.deleteDeferred = this.createNewDeferred();
      }
    }, {
      key: 'onDeleteCompleted',
      value: function onDeleteCompleted(entity) {
        var entityId = entity[this.idProperty];
        var currentEntity = this.getById(entityId);

        this.isDeleting = false;

        if (!currentEntity) {
          this.deleteDeferred.reject('Deleting entity that is not in this store...', entity);
          return;
        }

        this.items.splice(this.items.indexOf(currentEntity), 1);
        this.hasDetailSet.add(entityId);

        this.onChanged('delete', currentEntity);

        this.deleteDeferred.resolve(entity);
      }
    }, {
      key: 'onDeleteFailed',
      value: function onDeleteFailed(error) {
        this.isDeleting = false;

        this.onError('delete', error);

        this.deleteDeferred.reject(error);
      }
    }, {
      key: 'items',
      get: function get() {
        return this.instance.transformables[this.collection].data;
      },
      set: function set(items) {
        this.instance.transformables[this.collection].data = items;
      }
    }, {
      key: 'isEmpty',
      get: function get() {
        return this.isSet && !this.items.length;
      }
    }, {
      key: 'isBusy',
      get: function get() {
        return Boolean(this.isLoading || this.isCreating || this.isReading || this.isUpdating || this.isDeleting);
      }
    }, {
      key: 'loadPromise',
      get: function get() {
        return this.loadDeferred.promise;
      }
    }, {
      key: 'createPromise',
      get: function get() {
        return this.createDeferred.promise;
      }
    }, {
      key: 'readPromise',
      get: function get() {
        return this.readDeferred.promise;
      }
    }, {
      key: 'updatePromise',
      get: function get() {
        return this.updateDeferred.promise;
      }
    }, {
      key: 'deletePromise',
      get: function get() {
        return this.deleteDeferred.promise;
      }
    }]);

    return EntityStoreBehavior;
  })(_behavior.Behavior);

  exports.EntityStoreBehavior = EntityStoreBehavior;

  function EntityStore() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return function (cls) {
      var preparedConfig = config;
      if (_angular2['default'].isString(config)) {
        preparedConfig = { entity: config };
      }

      preparedConfig = Object.assign({
        actions: ['load', 'create', 'read', 'update', 'delete'],
        collection: 'items',
        entity: cls.name.replace(/store$/i, ''),
        idProperty: 'id'
      }, preparedConfig);
      preparedConfig.entity = (0, _utils.camelcase)(preparedConfig.entity);

      (0, _utils.Inject)()(cls.prototype, '$q');
      (0, _transformable.Transformable)()(cls.prototype, preparedConfig.collection);

      var actionHandlers = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = preparedConfig.actions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var action = _step.value;

          var actionName = (0, _utils.camelcase)(action);
          var entityAction = 'on' + preparedConfig.entity + actionName;
          var startedAction = entityAction + 'Started';
          var completedAction = entityAction + 'Completed';
          var failedAction = entityAction + 'Failed';

          actionHandlers.push(startedAction + ':on' + actionName + 'Started');
          actionHandlers.push(completedAction + ':on' + actionName + 'Completed');
          actionHandlers.push(failedAction + ':on' + actionName + 'Failed');

          var handlerDecorate = (0, _store.Handler)(null, false);
          handlerDecorate(cls.prototype, startedAction);
          handlerDecorate(cls.prototype, completedAction);
          handlerDecorate(cls.prototype, failedAction);
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

      (0, _utils.addBehavior)(cls, EntityStoreBehavior, {
        property: 'entityStore',
        config: preparedConfig,
        proxy: ['isSet', 'isEmpty', 'isBusy', 'loadPromise', 'createPromise', 'readPromise', 'updatePromise', 'deletePromise', 'isLoading', 'isCreating', 'isReading', 'isUpdating', 'isDeleting', 'reset', 'hasDetails', 'getById'].concat(actionHandlers)
      });
    };
  }
});
//# sourceMappingURL=entity-store.js.map
