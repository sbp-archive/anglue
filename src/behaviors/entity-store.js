import angular from 'angular';
import {Behavior} from './behavior';
import {Handler as handlerDecorator} from '../store';
import {
  addBehavior,
  camelcase,
  Inject as injectDecorator
} from '../utils';

export class EntityStoreBehavior extends Behavior {
  isLoading = false;
  isCreating = false;
  isReading = false;
  isUpdating = false;
  isDeleting = false;
  isSet = false;
  items = [];
  hasDetailSet = new Set();

  constructor(instance, {idProperty} = {}) {
    super(...arguments);

    this.idProperty = idProperty || 'id';
    this.reset();
  }

  reset() {
    this.loadDeferred = this.createNewDeferred();
    this.createDeferred = this.createNewDeferred();
    this.readDeferred = this.createNewDeferred();
    this.updateDeferred = this.createNewDeferred();
    this.deleteDeferred = this.createNewDeferred();

    this.isSet = false;
    this.items.splice(0, this.items.length);
    this.hasDetailSet.clear();
  }

  get isEmpty() {
    return this.isSet && !this.items.length;
  }

  get isBusy() {
    return Boolean(this.isLoading ||
                   this.isCreating ||
                   this.isReading ||
                   this.isUpdating ||
                   this.isDeleting);
  }

  get loadPromise() {
    return this.loadDeferred.promise;
  }

  get createPromise() {
    return this.createDeferred.promise;
  }

  get readPromise() {
    return this.readDeferred.promise;
  }

  get updatePromise() {
    return this.updateDeferred.promise;
  }

  get deletePromise() {
    return this.deleteDeferred.promise;
  }

  createNewDeferred() {
    return this.instance.$q.defer();
  }

  onChanged() {
    this.instance.emit('changed', ...arguments);
  }

  onError() {
    this.instance.emit('error', ...arguments);
  }

  getById(entityId) {
    return this.items.find(entity => entity[this.idProperty] === entityId) || null;
  }

  hasDetails(entityId) {
    return this.hasDetailSet.has(entityId);
  }

  onLoadStarted() {
    this.isLoading = true;
    this.loadDeferred = this.createNewDeferred();
  }

  onLoadCompleted(entities) {
    const items = this.items;

    this.isSet = true;
    this.isLoading = false;
    this.hasDetailSet.clear();

    if (entities && entities.length) {
      items.splice(0, items.length);
      items.splice(0, 0, ...entities);
    }

    this.onChanged('load', entities);

    this.loadDeferred.resolve(entities);
  }

  onLoadFailed(error) {
    this.isLoading = false;

    this.onError('load', error);

    this.loadDeferred.reject(error);
  }

  onCreateStarted() {
    this.isCreating = true;
    this.createDeferred = this.createNewDeferred();
  }

  onCreateCompleted(entity) {
    const entityId = entity[this.idProperty];
    let currentEntity = this.getById(entityId);

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

  onCreateFailed(error) {
    this.isCreating = false;

    this.onError('create', error);

    this.createDeferred.reject(error);
  }

  onReadStarted() {
    this.isReading = true;
    this.readDeferred = this.createNewDeferred();
  }

  onReadCompleted(entity) {
    const entityId = entity[this.idProperty];
    let currentEntity = this.getById(entityId);

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

  onReadFailed(error) {
    this.isReading = false;

    this.onError('read', error);

    this.readDeferred.reject(error);
  }

  onUpdateStarted() {
    this.isUpdating = true;
    this.updateDeferred = this.createNewDeferred();
  }

  onUpdateCompleted(entity) {
    const entityId = entity[this.idProperty];
    const currentEntity = this.getById(entityId);

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

  onUpdateFailed(error) {
    this.isUpdating = false;

    this.onError('update', error);

    this.updateDeferred.reject(error);
  }

  onDeleteStarted() {
    this.isDeleting = true;
    this.deleteDeferred = this.createNewDeferred();
  }

  onDeleteCompleted(entity) {
    const entityId = entity[this.idProperty];
    const currentEntity = this.getById(entityId);

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

  onDeleteFailed(error) {
    this.isDeleting = false;

    this.onError('delete', error);

    this.deleteDeferred.reject(error);
  }
}

export function EntityStore(config = {}) {
  return cls => {
    let preparedConfig = config;
    if (angular.isString(config)) {
      preparedConfig = {entity: config};
    }

    preparedConfig = Object.assign({
      actions: ['load', 'create', 'read', 'update', 'delete'],
      collection: 'items',
      entity: cls.name.replace(/store$/i, ''),
      idProperty: 'id'
    }, preparedConfig);
    preparedConfig.entity = camelcase(preparedConfig.entity);

    injectDecorator()(cls.prototype, '$q');

    const actionHandlers = [];
    for (const action of preparedConfig.actions) {
      const actionName = camelcase(action);
      const entityAction = `on${preparedConfig.entity}${actionName}`;
      const startedAction = `${entityAction}Started`;
      const completedAction = `${entityAction}Completed`;
      const failedAction = `${entityAction}Failed`;

      actionHandlers.push(`${startedAction}:on${actionName}Started`);
      actionHandlers.push(`${completedAction}:on${actionName}Completed`);
      actionHandlers.push(`${failedAction}:on${actionName}Failed`);

      const handlerDecorate = handlerDecorator(null, false);
      handlerDecorate(cls.prototype, startedAction);
      handlerDecorate(cls.prototype, completedAction);
      handlerDecorate(cls.prototype, failedAction);
    }

    addBehavior(cls, 'entityStore', EntityStoreBehavior, preparedConfig, [
      `${preparedConfig.collection}:items`,
      'isSet',
      'isEmpty',
      'isBusy',

      'loadPromise',
      'createPromise',
      'readPromise',
      'updatePromise',
      'deletePromise',

      'isLoading',
      'isCreating',
      'isReading',
      'isUpdating',
      'isDeleting',

      'reset',
      'hasDetails',
      'getById'
    ].concat(actionHandlers));
  };
}
