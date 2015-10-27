/*eslint-env node, jasmine*//*global module, inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {
  Store,
  SortableStore,
  SortableStoreBehavior,
  TransformableCollection,
  Transformer,
  Annotations
} from 'anglue/anglue';

describe('SortableStore', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('SortableStoreBehavior', () => {
    let mockInstance, behavior, refreshSpy, addSpy, removeSpy;
    beforeEach(() => {
      refreshSpy = jasmine.createSpy('refresh');
      addSpy = jasmine.createSpy('addSpy');
      removeSpy = jasmine.createSpy('removeSpy');

      module(angular.module('test', []).name);
      inject(_$filter_ => {
        mockInstance = {
          $filter: _$filter_,
          transformables: {items: {
            refresh: refreshSpy,
            addTransformer: addSpy,
            removeTransformer: removeSpy,
            transformers: []
          }}
        };

        behavior = new SortableStoreBehavior(mockInstance);
      });
    });

    it('should set default values for its config', () => {
      expect(behavior.collection).toEqual('items');
    });

    it('should read the passed config', () => {
      behavior = new SortableStoreBehavior(mockInstance, {
        collection: 'foo'
      });
      expect(behavior.collection).toEqual('foo');
    });

    describe('#transformer', () => {
      it('should define a Transformer instance as the transformers property', () => {
        expect(behavior.transformer).toEqual(jasmine.any(Transformer));
      });

      it('should name the transformer sortableStore', () => {
        expect(behavior.transformer.name).toEqual('sortableStore');
      });

      it('should have a noop fn on the transformer', () => {
        const items = ['foo'];
        expect(behavior.transformer.exec(items)).toEqual(items);
      });
    });

    describe('onChangeSort()', () => {
      it('should create working sorter fns on the transformer', () => {
        const transformer = behavior.transformer;
        behavior.onChangeSort(false);
        expect(transformer.exec(['bar', 'foo', 'bar'])).toEqual(['bar', 'bar', 'foo']);

        behavior.onChangeSort(true);
        expect(transformer.exec(['bar', 'foo', 'bar'])).toEqual(['foo', 'bar', 'bar']);

        behavior.onChangeSort('name');
        expect(transformer.exec([{name: 'foo'}, {name: 'bar'}]))
          .toEqual([{name: 'bar'}, {name: 'foo'}]);

        behavior.onChangeSort('-name');
        expect(transformer.exec([{name: 'bar'}, {name: 'foo'}]))
          .toEqual([{name: 'foo'}, {name: 'bar'}]);

        behavior.onChangeSort(['name', 'age']);
        expect(transformer.exec([
          {name: 'foo', age: 10},
          {name: 'bar', age: 30},
          {name: 'bar', age: 20}
        ])).toEqual([
          {name: 'bar', age: 20},
          {name: 'bar', age: 30},
          {name: 'foo', age: 10}
        ]);
      });

      it('should add the sort transformer if it was not active yet', () => {
        behavior.onChangeSort('name');
        expect(addSpy).toHaveBeenCalled();
        expect(refreshSpy).not.toHaveBeenCalled();
      });

      it('should just refresh if there is an active sort transformer', () => {
        behavior.transformableCollection.transformers.push(behavior.transformer);
        behavior.onChangeSort('name');
        expect(addSpy).not.toHaveBeenCalled();
        expect(refreshSpy).toHaveBeenCalled();
      });
    });

    describe('onClearSort()', () => {
      it('should remove the sortable transformer from the transformableColleciton', () => {
        behavior.onClearSort();
        expect(removeSpy).toHaveBeenCalledWith(behavior.transformer);
      });
    });
  });

  describe('@SortableStore() decorator', () => {
    @Store() @SortableStore() class TestStore {}
    @Store() @SortableStore({entity: 'custom'}) class CustomSortableStore {}
    @Store() @SortableStore('custom') class CustomSortableStringStore {}
    @Store() @SortableStore({collection: 'foo'}) class CollectionStore {}

    let store, customSortableStore, customSortableStringStore, collectionStore, $filter;
    beforeEach(() => {
      angular.module('test', [
        'luxyflux',
        TestStore.annotation.module.name,
        CustomSortableStore.annotation.module.name,
        CustomSortableStringStore.annotation.module.name,
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
        _CustomSortableStore_,
        _CustomSortableStringStore_,
        _CollectionStore_,
        _$filter_
      ) => {
        store = _TestStore_;
        customSortableStore = _CustomSortableStore_;
        customSortableStringStore = _CustomSortableStringStore_;
        collectionStore = _CollectionStore_;
        $filter = _$filter_;
      });
    });

    it('should define the EntityStore API methods on the store', () => {
      [
        'sortableStore',
        'onTestChangeSort',
        'onTestClearSort'
      ].forEach(api => expect(store[api]).toBeDefined());
    });

    it('should inject $filter on the store', () => {
      expect(store.$filter).toBe($filter);
    });

    it('should make the collection transformable', () => {
      expect(store.transformables.items).toEqual(jasmine.any(TransformableCollection));
    });

    it('should have an instance of SortableStoreBehavior as the behavior property', () => {
      expect(store.sortableStore).toEqual(jasmine.any(SortableStoreBehavior));
    });

    it('should use the class name to determine the crud entity by default', () => {
      expect(store.sortableStore.config.entity).toEqual('Test');
    });

    it('should be possible to configure the entity to manage', () => {
      expect(customSortableStore.sortableStore.config.entity).toEqual('Custom');
    });

    it('should be possible to pass the entity property as a string', () => {
      expect(customSortableStringStore.sortableStore.config.entity).toEqual('Custom');
    });

    it('should create properly named handlers when configuring the entity', () => {
      expect(customSortableStore.onCustomChangeSort).toBeDefined();
      expect(customSortableStore.onCustomClearSort).toBeDefined();
    });

    it('should use the item property as the collection by default', () => {
      expect(store.sortableStore.collection).toEqual('items');
    });

    it('should be possible to configure the collection property the entities are stored in', () => {
      expect(collectionStore.sortableStore.collection).toEqual('foo');
    });

    it('should add handlers for actions', () => {
      expect(TestStore.handlers)
        .toEqual(jasmine.objectContaining({
          TEST_CHANGE_SORT: 'onTestChangeSort',
          TEST_CLEAR_SORT: 'onTestClearSort'
        }));
    });
  });
});
