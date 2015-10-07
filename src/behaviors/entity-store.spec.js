/*eslint-env node, jasmine*//*global module, inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {
  Store,
  EntityStore,
  EntityStoreBehavior,
  Handler
} from 'anglue/anglue';

describe('EntityStore', () => {
  describe('EntityStoreBehavior', () => {
    let mockInstance, behavior;
    beforeEach(() => {
      module(angular.module('test', []).name);
      inject(_$q_ => {
        mockInstance = {
          $q: _$q_,
          emit: jasmine.createSpy()
        };
        behavior = new EntityStoreBehavior(mockInstance);
      });
    });

    it('should set default values for its config', () => {
      expect(behavior.idProperty).toEqual('id');
    });

    it('should set read the passed config', () => {
      behavior = new EntityStoreBehavior(mockInstance, {
        idProperty: 'fooId'
      });
      expect(behavior.idProperty).toEqual('fooId');
    });

    it('should not be in isEmpty state if store has not successfully read/loaded once', () => {
      behavior.onLoadStarted();
      expect(behavior.isEmpty).toBe(false);
    });

    it('should not be in isEmpty state if store has read/loaded once and has items', () => {
      behavior.onLoadStarted();
      behavior.onLoadCompleted(['foo', 'bar']);
      expect(behavior.isEmpty).toBe(false);
    });

    it('should be in isEmpty state when store has read/loaded once and has no items', () => {
      behavior.onLoadStarted();
      behavior.onLoadCompleted([]);
      expect(behavior.isEmpty).toBe(true);
    });

    it('should be in isBusy state when current in any action', () => {
      behavior.onLoadStarted();
      expect(behavior.isBusy).toBe(true);
    });

    it('should not be in isBusy state when not currently in any action', () => {
      behavior.onLoadStarted();
      behavior.onReadStarted();
      behavior.onLoadCompleted([]);
      expect(behavior.isBusy).toBe(true);

      behavior.onReadCompleted({});
      expect(behavior.isBusy).toBe(false);
    });

    describe('load', () => {
      beforeEach(() => {
        behavior.onLoadStarted();
      });

      it('should replace the existing items collection on LOAD_COMPLETED', () => {
        behavior.items = ['foo'];
        behavior.onLoadCompleted(['bar']);
        expect(behavior.items).toEqual(['bar']);
      });

      it('should emit the changed event on the store on LOAD_COMPLETED', () => {
        behavior.onLoadCompleted(['bar']);
        expect(behavior.instance.emit).toHaveBeenCalledWith('changed', 'load', ['bar']);
      });

      it('should emit the error event on the store on LOAD_FAILED', () => {
        behavior.onLoadFailed('foo error');
        expect(behavior.instance.emit).toHaveBeenCalledWith('error', 'load', 'foo error');
      });

      it('should reset the hasDetailSet', () => {
        behavior.hasDetailSet.add('foo');
        behavior.onLoadCompleted(['bar']);
        expect(behavior.hasDetailSet.size).toBe(0);
      });

      it('should define a loadPromise on LOAD_STARTED', () => {
        expect(behavior.loadPromise).toEqual(mockInstance.$q.defer().promise);
      });

      it('should resolve the loadPromise with the results on LOAD_COMPLETED', () => {
        const loadDeferred = behavior.loadDeferred;
        spyOn(loadDeferred, 'resolve');
        behavior.onLoadCompleted(['bar']);
        expect(loadDeferred.resolve).toHaveBeenCalledWith(['bar']);
      });

      it('should reject the loadPromise with the errors on LOAD_FAILED', () => {
        const loadDeferred = behavior.loadDeferred;
        spyOn(loadDeferred, 'reject');
        behavior.onLoadFailed('error');
        expect(loadDeferred.reject).toHaveBeenCalledWith('error');
      });

      it('should be in isLoading state on LOAD_STARTED', () => {
        expect(behavior.isLoading).toBe(true);
      });

      it('should not be in isLoading state on LOAD_COMPLETED', () => {
        behavior.onLoadCompleted();
        expect(behavior.isLoading).toBe(false);
      });

      it('should not be in isLoading state on LOAD_FAILED', () => {
        behavior.onLoadFailed();
        expect(behavior.isLoading).toBe(false);
      });

      it('should not be in isSet state after LOAD_STARTED', () => {
        expect(behavior.isSet).toBe(false);
      });

      it('should not be in isSet state after LOAD_FAILED', () => {
        behavior.onLoadFailed();
        expect(behavior.isSet).toBe(false);
      });

      it('should be in isSet state after LOAD_COMPLETED', () => {
        behavior.onLoadCompleted();
        expect(behavior.isSet).toBe(true);
      });

      it('should stay in isSet state after doing another load', () => {
        behavior.onLoadCompleted();
        behavior.onLoadStarted();
        behavior.onLoadFailed();
        expect(behavior.isSet).toBe(true);
      });
    });

    describe('create', () => {
      let entity;
      beforeEach(() => {
        entity = {id: 1, foo: 'bar'};
        behavior.onCreateStarted();
      });

      it('should add the entity to the collection on CREATE_COMPLETED', () => {
        behavior.onCreateCompleted(entity);
        expect(behavior.items).toEqual(jasmine.arrayContaining([entity]));
      });

      it('should apply to the entity to the collection on CREATE_COMPLETED if it exists', () => {
        const currentEntity = {id: 1, foo: 'old'};
        behavior.items.push(currentEntity);
        behavior.onCreateCompleted(entity);
        expect(currentEntity.foo).toEqual('bar');
      });

      it('should add itself to hasDetailSet on CREATE_COMPLETED', () => {
        behavior.onCreateCompleted({id: 1});
        expect(behavior.hasDetailSet.has(1)).toBe(true);
      });

      it('should emit the changed event on the store on CREATE_COMPLETED', () => {
        behavior.onCreateCompleted(entity);
        expect(behavior.instance.emit).toHaveBeenCalledWith('changed', 'create', entity);
      });

      it('should emit the error event on the store on CREATE_FAILED', () => {
        behavior.onCreateFailed('foo error');
        expect(behavior.instance.emit).toHaveBeenCalledWith('error', 'create', 'foo error');
      });

      it('should define a createPromise on CREATE_STARTED', () => {
        expect(behavior.createPromise).toEqual(mockInstance.$q.defer().promise);
      });

      it('should resolve the createPromise with the results on CREATE_COMPLETED', () => {
        const createDeferred = behavior.createDeferred;
        spyOn(createDeferred, 'resolve');
        behavior.onCreateCompleted(entity);
        expect(createDeferred.resolve).toHaveBeenCalledWith(entity);
      });

      it('should reject the createPromise with the errors on CREATE_FAILED', () => {
        const createDeferred = behavior.createDeferred;
        spyOn(createDeferred, 'reject');
        behavior.onCreateFailed('error');
        expect(createDeferred.reject).toHaveBeenCalledWith('error');
      });

      it('should be in isCreating state on CREATE_STARTED', () => {
        expect(behavior.isCreating).toBe(true);
      });

      it('should not be in isCreating state on CREATE_COMPLETED', () => {
        behavior.onCreateCompleted(entity);
        expect(behavior.isCreating).toBe(false);
      });

      it('should not be in isCreating state on CREATE_FAILED', () => {
        behavior.onCreateFailed('error');
        expect(behavior.isCreating).toBe(false);
      });

      it('should not be in isSet state after CREATE_STARTED', () => {
        expect(behavior.isSet).toBe(false);
      });

      it('should not be in isSet state after CREATE_FAILED', () => {
        behavior.onCreateFailed('error');
        expect(behavior.isSet).toBe(false);
      });

      it('should be in isSet state after CREATE_COMPLETED', () => {
        behavior.onCreateCompleted(entity);
        expect(behavior.isSet).toBe(true);
      });

      it('should stay in isSet state after doing another create', () => {
        behavior.onCreateCompleted(entity);
        behavior.onCreateStarted();
        behavior.onCreateFailed('error');
        expect(behavior.isSet).toBe(true);
      });
    });

    describe('read', () => {
      let entity;
      beforeEach(() => {
        entity = {id: 1, foo: 'bar'};
        behavior.onReadStarted();
      });

      it('should add the entity to the collection on READ_COMPLETED', () => {
        behavior.onReadCompleted('foo');
        expect(behavior.items).toEqual(jasmine.arrayContaining(['foo']));
      });

      it('should update an existing entity in the collection on READ_COMPLETED', () => {
        behavior.items.push(entity);
        behavior.onReadCompleted({id: 1, foo: 'details'});
        expect(entity.foo).toEqual('details');
      });

      it('should add itself to hasDetailSet on READ_COMPLETED', () => {
        behavior.onReadCompleted({id: 1});
        expect(behavior.hasDetailSet.has(1)).toBe(true);
      });

      it('should emit the changed event on the store on READ_COMPLETED', () => {
        behavior.onReadCompleted(entity);
        expect(behavior.instance.emit).toHaveBeenCalledWith('changed', 'read', entity);
      });

      it('should emit the error event on the store on READ_FAILED', () => {
        behavior.onReadFailed('foo error');
        expect(behavior.instance.emit).toHaveBeenCalledWith('error', 'read', 'foo error');
      });

      it('should define a readPromise on READ_STARTED', () => {
        expect(behavior.readPromise).toEqual(mockInstance.$q.defer().promise);
      });

      it('should resolve the readPromise with the results on READ_COMPLETED', () => {
        const readDeferred = behavior.readDeferred;
        spyOn(readDeferred, 'resolve');
        behavior.onReadCompleted(entity);
        expect(readDeferred.resolve).toHaveBeenCalledWith(entity);
      });

      it('should reject the readPromise with the errors on READ_FAILED', () => {
        const readDeferred = behavior.readDeferred;
        spyOn(readDeferred, 'reject');
        behavior.onReadFailed('error');
        expect(readDeferred.reject).toHaveBeenCalledWith('error');
      });

      it('should be in isReading state on READ_STARTED', () => {
        expect(behavior.isReading).toBe(true);
      });

      it('should not be in isReading state on READ_COMPLETED', () => {
        behavior.onReadCompleted(entity);
        expect(behavior.isReading).toBe(false);
      });

      it('should not be in isReading state on READ_FAILED', () => {
        behavior.onReadFailed();
        expect(behavior.isReading).toBe(false);
      });

      it('should not be in isSet state after READ_STARTED', () => {
        expect(behavior.isSet).toBe(false);
      });

      it('should not be in isSet state after READ_FAILED', () => {
        behavior.onReadFailed();
        expect(behavior.isSet).toBe(false);
      });

      it('should be in isSet state after READ_COMPLETED', () => {
        behavior.onReadCompleted(entity);
        expect(behavior.isSet).toBe(true);
      });

      it('should stay in isSet state after doing another read', () => {
        behavior.onReadCompleted(entity);
        behavior.onReadStarted();
        behavior.onReadFailed();
        expect(behavior.isSet).toBe(true);
      });
    });

    describe('update', () => {
      let entity;
      beforeEach(() => {
        entity = {id: 1, foo: 'bar'};
        behavior.items.push(entity);
        behavior.onUpdateStarted();
      });

      it('should update an existing entity in the collection on UPDATE_COMPLETED', () => {
        behavior.onUpdateCompleted({id: 1, foo: 'updated'});
        expect(entity.foo).toEqual('updated');
      });

      it('should ignore updates to an unknown entity on UPDATE_COMPLETED', () => {
        behavior.onUpdateCompleted({id: 2, foo: 'ignored'});
        expect(behavior.items).toEqual([entity]);
        expect(behavior.instance.emit).not.toHaveBeenCalled();
      });

      it('should emit the changed event on UPDATE_COMPLETED', () => {
        behavior.onUpdateCompleted({id: 1, foo: 'updated'});
        expect(behavior.instance.emit).toHaveBeenCalledWith('changed', 'update', entity);
      });

      it('should emit the error event on the store on UPDATE_FAILED', () => {
        behavior.onUpdateFailed('foo error');
        expect(behavior.instance.emit).toHaveBeenCalledWith('error', 'update', 'foo error');
      });

      it('should define a updatePromise on UPDATE_STARTED', () => {
        expect(behavior.updatePromise).toEqual(mockInstance.$q.defer().promise);
      });

      it('should resolve the updatePromise with the results on UPDATE_COMPLETED', () => {
        const updateDeferred = behavior.updateDeferred;
        spyOn(updateDeferred, 'resolve');
        behavior.onUpdateCompleted(entity);
        expect(updateDeferred.resolve).toHaveBeenCalledWith(entity);
      });

      it('should reject the updatePromise with the errors on UPDATE_FAILED', () => {
        const updateDeferred = behavior.updateDeferred;
        spyOn(updateDeferred, 'reject');
        behavior.onUpdateFailed('error');
        expect(updateDeferred.reject).toHaveBeenCalledWith('error');
      });

      it('should be in isUpdating state on UPDATE_STARTED', () => {
        expect(behavior.isUpdating).toBe(true);
      });

      it('should not be in isUpdating state on UPDATE_COMPLETED', () => {
        behavior.onUpdateCompleted(entity);
        expect(behavior.isUpdating).toBe(false);
      });

      it('should not be in isUpdating state on UPDATE_FAILED', () => {
        behavior.onUpdateFailed('error');
        expect(behavior.isUpdating).toBe(false);
      });
    });

    describe('delete', () => {
      let entity;
      beforeEach(() => {
        entity = {id: 1, foo: 'bar'};
        behavior.items.push(entity);
        behavior.onDeleteStarted();
      });

      it('should delete an existing entity from the collection on DELETE_COMPLETED', () => {
        behavior.onDeleteCompleted({id: 1});
        expect(behavior.items).toEqual([]);
      });

      it('should ignore deleting of an unknown entity on DELETE_COMPLETED', () => {
        behavior.onDeleteCompleted({id: 2, foo: 'ignored'});
        expect(behavior.items).toEqual([entity]);
        expect(behavior.instance.emit).not.toHaveBeenCalled();
      });

      it('should emit the changed event on DELETE_COMPLETED', () => {
        behavior.onDeleteCompleted({id: 1});
        expect(behavior.instance.emit).toHaveBeenCalledWith('changed', 'delete', entity);
      });

      it('should emit the error event on the store on DELETE_FAILED', () => {
        behavior.onDeleteFailed('foo error');
        expect(behavior.instance.emit).toHaveBeenCalledWith('error', 'delete', 'foo error');
      });

      it('should define a deletePromise on DELETE_STARTED', () => {
        expect(behavior.deletePromise).toEqual(mockInstance.$q.defer().promise);
      });

      it('should resolve the deletePromise with the results on DELETE_COMPLETED', () => {
        const deleteDeferred = behavior.deleteDeferred;
        spyOn(deleteDeferred, 'resolve');
        behavior.onDeleteCompleted(entity);
        expect(deleteDeferred.resolve).toHaveBeenCalledWith(entity);
      });

      it('should reject the deletePromise with the errors on DELETE_FAILED', () => {
        const deleteDeferred = behavior.deleteDeferred;
        spyOn(deleteDeferred, 'reject');
        behavior.onDeleteFailed('error');
        expect(deleteDeferred.reject).toHaveBeenCalledWith('error');
      });

      it('should be in isDeleting state on DELETE_STARTED', () => {
        expect(behavior.isDeleting).toBe(true);
      });

      it('should not be in isDeleting state on DELETE_COMPLETED', () => {
        behavior.onDeleteCompleted(entity);
        expect(behavior.isDeleting).toBe(false);
      });

      it('should not be in isDeleting state on DELETE_FAILED', () => {
        behavior.onDeleteFailed('error');
        expect(behavior.isDeleting).toBe(false);
      });
    });

    describe('getById()', () => {
      it('return null if there is no item with that id', () => {
        expect(behavior.getById(1)).toBe(null);
      });

      it('return the item with the id if its in the store', () => {
        const item = {id: 1};
        behavior.items.push(item);
        expect(behavior.getById(1)).toBe(item);
      });

      it('should leverage the idProperty to find items', () => {
        const item = {foo: 1};
        behavior.idProperty = 'foo';
        behavior.items.push(item);
        expect(behavior.getById(1)).toBe(item);
      });
    });

    describe('hasDetails()', () => {
      it('should return false if there are no details found for the item id', () => {
        expect(behavior.hasDetails(1)).toBe(false);
      });

      it('should return true if there are details', () => {
        const entity = {id: 1};
        behavior.onReadStarted(entity);
        behavior.onReadCompleted(entity);
        expect(behavior.hasDetails(1)).toBe(true);
      });

      it('should leverage the id property to find details', () => {
        const entity = {foo: 1};
        behavior.idProperty = 'foo';
        behavior.onReadStarted(entity);
        behavior.onReadCompleted(entity);
        expect(behavior.hasDetails(1)).toBe(true);
      });

      it('should return false if the store is currently reading an entity', () => {
        const entity = {foo: 1};
        behavior.onReadStarted(entity);
        expect(behavior.hasDetails(1)).toBe(false);
      });
    });

    describe('reset()', () => {
      it('should reset entities collection and details and isSet flag', () => {
        behavior.isSet = true;
        behavior.items.push('foo');
        behavior.hasDetailSet = new Set('foo');

        behavior.reset();

        expect(behavior.isSet).toBe(false);
        expect(behavior.items).toEqual([]);
        expect(behavior.hasDetailSet.size).toEqual(0);
      });
    });
  });

  describe('@EntityStore() decorator', () => {
    @Store() @EntityStore() class TestStore {}
    @Store() @EntityStore({idProperty: 'test'}) class IdPropertyStore {}
    @Store() @EntityStore({entity: 'custom'}) class CustomEntityStore {}
    @Store() @EntityStore('custom') class CustomEntityStringStore {}
    @Store() @EntityStore({actions: ['read', 'update']}) class ActionsStore {}
    @Store() @EntityStore({collection: 'foo'}) class CollectionStore {}

    let store, $q;
    let idPropertyStore, customEntityStore, customEntityStringStore, actionsStore, collectionStore;
    beforeEach(() => {
      angular.module('test', [
        'luxyflux',
        TestStore.annotation.module.name,
        IdPropertyStore.annotation.module.name,
        CustomEntityStore.annotation.module.name,
        CustomEntityStringStore.annotation.module.name,
        ActionsStore.annotation.module.name,
        CollectionStore.annotation.module.name
      ]).service('ApplicationDispatcher', () => {
        return {
          register() {},
          dispatch() {}
        };
      });

      module('test');
      inject((
        _TestStore_,
        _IdPropertyStore_,
        _CustomEntityStore_,
        _CustomEntityStringStore_,
        _ActionsStore_,
        _CollectionStore_,
        _$q_
      ) => {
        store = _TestStore_;
        idPropertyStore = _IdPropertyStore_;
        customEntityStore = _CustomEntityStore_;
        customEntityStringStore = _CustomEntityStringStore_;
        actionsStore = _ActionsStore_;
        collectionStore = _CollectionStore_;
        $q = _$q_;
      });
    });

    it('should define the EntityStore API methods on the store', () => {
      [
        'entityStore',
        'items',

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
        'getById',

        'onTestLoadStarted',
        'onTestLoadCompleted',
        'onTestLoadFailed',
        'onTestCreateStarted',
        'onTestCreateCompleted',
        'onTestCreateFailed',
        'onTestReadStarted',
        'onTestReadCompleted',
        'onTestReadFailed',
        'onTestUpdateStarted',
        'onTestUpdateCompleted',
        'onTestUpdateFailed',
        'onTestDeleteStarted',
        'onTestDeleteCompleted',
        'onTestDeleteFailed'
      ].forEach(api => expect(store[api]).toBeDefined());
    });

    it('should inject $q into the store', () => {
      expect(store.$q).toBe($q);
    });

    it('should have an instance of EntityStoreBehavior as the behavior property', () => {
      expect(store.entityStore).toEqual(jasmine.any(EntityStoreBehavior));
    });

    it('should use the class name to determine the crud entity by default', () => {
      expect(store.entityStore.config.entity).toEqual('Test');
    });

    it('should use id as the default the entity id property', () => {
      expect(store.entityStore.idProperty).toEqual('id');
    });

    it('should be possible to configure the entity id property', () => {
      expect(idPropertyStore.entityStore.idProperty).toEqual('test');
    });

    it('should be possible to configure the entity to manage', () => {
      expect(customEntityStore.entityStore.config.entity).toEqual('Custom');
    });

    it('should be possible to pass the entity property as a string', () => {
      expect(customEntityStringStore.entityStore.config.entity).toEqual('Custom');
    });

    it('should create properly named handlers when configuring the entity', () => {
      expect(customEntityStore.onCustomLoadCompleted).toBeDefined();
    });

    it('should manage all actions by default', () => {
      expect(store.entityStore.config.actions)
        .toEqual(['load', 'create', 'read', 'update', 'delete']);
    });

    it('should be possible to configure the actions the store manage', () => {
      expect(actionsStore.entityStore.config.actions).toEqual(['read', 'update']);
    });

    it('should use the items property to store entities in by default', () => {
      expect(store.items).toEqual(jasmine.any(Array));
    });

    it('should be possible to configure the collection property the entities are stored in', () => {
      expect(collectionStore.foo).toEqual(jasmine.any(Array));
    });

    it('should add handlers for actions', () => {
      expect(TestStore.handlers)
        .toEqual(jasmine.objectContaining({
          TEST_LOAD_STARTED: 'onTestLoadStarted',
          TEST_LOAD_COMPLETED: 'onTestLoadCompleted',
          TEST_LOAD_FAILED: 'onTestLoadFailed',
          TEST_CREATE_STARTED: 'onTestCreateStarted',
          TEST_CREATE_COMPLETED: 'onTestCreateCompleted',
          TEST_CREATE_FAILED: 'onTestCreateFailed',
          TEST_READ_STARTED: 'onTestReadStarted',
          TEST_READ_COMPLETED: 'onTestReadCompleted',
          TEST_READ_FAILED: 'onTestReadFailed',
          TEST_UPDATE_STARTED: 'onTestUpdateStarted',
          TEST_UPDATE_COMPLETED: 'onTestUpdateCompleted',
          TEST_UPDATE_FAILED: 'onTestUpdateFailed',
          TEST_DELETE_STARTED: 'onTestDeleteStarted',
          TEST_DELETE_COMPLETED: 'onTestDeleteCompleted',
          TEST_DELETE_FAILED: 'onTestDeleteFailed'
        }));
    });

    it('should only add handlers for the chosen actions', () => {
      @EntityStore({actions: ['read']}) class CustomStore {}
      expect(CustomStore.handlers)
        .not.toEqual(jasmine.objectContaining({
          TEST_LOAD_STARTED: 'onTestLoadStarted'
        }));
    });

    it('should not override any handlers already defined on the store', () => {
      @Store()
      @EntityStore() class CustomStore {
        @Handler('TEST_LOAD_FAILED') onCustomFailed() {}
      }
      expect(CustomStore.handlers).toEqual(jasmine.objectContaining({
        TEST_LOAD_FAILED: 'onCustomFailed'
      }));
    });
  });
});
