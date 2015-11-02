/*eslint-env node, jasmine*//*global module, inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {
  Store,
  FilterableStore,
  FilterableStoreBehavior,
  TransformableCollection,
  Transformer,
  Annotations
} from 'anglue/anglue';

describe('FilterableStore', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('FilterableStoreBehavior', () => {
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

        behavior = new FilterableStoreBehavior(mockInstance);
      });
    });

    it('should set default values for its config', () => {
      expect(behavior.collection).toEqual('items');
    });

    it('should read the passed config', () => {
      behavior = new FilterableStoreBehavior(mockInstance, {
        collection: 'foo'
      });
      expect(behavior.collection).toEqual('foo');
    });

    describe('#transformer', () => {
      it('should define a Transformer instance as the transformers property', () => {
        expect(behavior.transformer).toEqual(jasmine.any(Transformer));
      });

      it('should name the transformer filterableStore', () => {
        expect(behavior.transformer.name).toEqual('filterableStore');
      });

      it('should have a noop fn on the transformer', () => {
        const items = ['foo'];
        expect(behavior.transformer.exec(items)).toEqual(items);
      });
    });

    describe('onChangeFilter()', () => {
      it('Should be able to filter on property values', () => {
        behavior.onChangeFilter('nameFilter', {
          name: 'Optimus'
        });
        const filtered = behavior.transformer.exec([{name: 'Optimus'}, {name: 'Bumblebee'}]);
        expect(filtered).toEqual([{name: 'Optimus'}]);
      });

      it('Should be able to invert filter with !', () => {
        behavior.onChangeFilter('nameFilter', {
          name: '!Optimus'
        });
        const filtered = behavior.transformer.exec([{name: 'Optimus'}, {name: 'Bumblebee'}]);
        expect(filtered).toEqual([{name: 'Bumblebee'}]);
      });

      it('should just refresh if there is an active filter transformer', () => {
        behavior.transformableCollection.transformers.push(behavior.transformer);
        behavior.onChangeFilter('name');
        expect(addSpy).not.toHaveBeenCalled();
        expect(refreshSpy).toHaveBeenCalled();
      });
    });

    describe('onClearFilter', () => {
      it('When clearing a filter items should return to original state', () => {
        behavior.onChangeFilter('nameFilter', {
          name: 'Optimus'
        });
        behavior.onClearFilter('nameFilter');
        const filtered = behavior.transformer.exec([{name: 'Optimus'}, {name: 'Bumblebee'}]);
        expect(filtered).toEqual([{name: 'Optimus'}, {name: 'Bumblebee'}]);
      });
    });

    describe('onChangeSearch()', () => {
      it('Should be able to search on property value', () => {
        behavior.onChangeSearch('Optimus');
        const filtered = behavior.transformer.exec([{name: 'Optimus'}, {name: 'Bumblebee'}]);

        expect(filtered).toEqual([{name: 'Optimus'}]);
        expect(filtered.length).toEqual(1);
      });

      it('Should set the searchText', () => {
        behavior.onChangeSearch('Blaat');
        expect(behavior.searchText).toEqual('Blaat');
      });

      it('Should trim the searchText', () => {
        behavior.onChangeSearch(' Optimus ');
        const filtered = behavior.transformer.exec([{name: 'Optimus'}, {name: 'Bumblebee'}]);
        expect(filtered).toEqual([{name: 'Optimus'}]);
        expect(filtered.length).toEqual(1);
      });
    });

    describe('onClearSearch()', () => {
      it('When clearing the search items should return to original state', () => {
        behavior.onChangeSearch('Optimus');
        behavior.onClearSearch();
        const filtered = behavior.transformer.exec([{name: 'Optimus'}, {name: 'Bumblebee'}]);
        expect(filtered).toEqual([{name: 'Optimus'}, {name: 'Bumblebee'}]);
      });

      it('When clearing the search, searchText should become null', () => {
        behavior.onChangeSearch('Optimus');
        expect(behavior.searchText).toEqual('Optimus');
        behavior.onClearSearch();
        expect(behavior.searchText).toEqual(null);
      });
    });

    describe('combine filter and search()', () => {
      it('Applying both a filter and search should work', () => {
        behavior.onChangeSearch('Optimus');
        behavior.onChangeFilter('nameFilter', {
          name: '!Bumblebee'
        });

        const filtered = behavior.transformer.exec([{name: 'Optimus'}, {name: 'Bumblebee'}, {name: 'Foobar'}]);
        expect(filtered).toEqual([{name: 'Optimus'}]);
      });
    });
  });

  describe('@FilterableStore() decorator', () => {
    @Store() @FilterableStore() class TestStore {}
    @Store() @FilterableStore({entity: 'custom'}) class CustomFilterableStore {}
    @Store() @FilterableStore('custom') class CustomFilterableStringStore {}
    @Store() @FilterableStore({collection: 'foo'}) class CollectionStore {}

    let store, customFilterableStore, customFilterableStringStore, collectionStore, $filter;
    beforeEach(() => {
      angular.module('test', [
        'luxyflux',
        TestStore.annotation.module.name,
        CustomFilterableStore.annotation.module.name,
        CustomFilterableStringStore.annotation.module.name,
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
        _CustomFilterableStore_,
        _CustomFilterableStringStore_,
        _CollectionStore_,
        _$filter_
      ) => {
        store = _TestStore_;
        customFilterableStore = _CustomFilterableStore_;
        customFilterableStringStore = _CustomFilterableStringStore_;
        collectionStore = _CollectionStore_;
        $filter = _$filter_;
      });
    });

    it('should define the FilterableStore API methods on the store', () => {
      [
        'filterableStore',
        'onTestChangeFilter',
        'onTestClearFilter',
        'onTestChangeSearch',
        'onTestClearSearch'
      ].forEach(api => expect(store[api]).toBeDefined());
    });

    it('should inject $filter on the store', () => {
      expect(store.$filter).toBe($filter);
    });

    it('should make the collection transformable', () => {
      expect(store.transformables.items).toEqual(jasmine.any(TransformableCollection));
    });

    it('should have an instance of FilterableStoreBehavior as the behavior property', () => {
      expect(store.filterableStore).toEqual(jasmine.any(FilterableStoreBehavior));
    });

    it('should use the class name to determine the crud entity by default', () => {
      expect(store.filterableStore.config.entity).toEqual('Test');
    });

    it('should be possible to configure the entity to manage', () => {
      expect(customFilterableStore.filterableStore.config.entity).toEqual('Custom');
    });

    it('should be possible to pass the entity property as a string', () => {
      expect(customFilterableStringStore.filterableStore.config.entity).toEqual('Custom');
    });

    it('should create properly named handlers when configuring the entity', () => {
      expect(customFilterableStore.onCustomChangeFilter).toBeDefined();
      expect(customFilterableStore.onCustomClearFilter).toBeDefined();
    });

    it('should use the item property as the collection by default', () => {
      expect(store.filterableStore.collection).toEqual('items');
    });

    it('should be possible to configure the collection property the entities are stored in', () => {
      expect(collectionStore.filterableStore.collection).toEqual('foo');
    });

    it('should expose the searchText property', () => {
      expect(store.searchText).toBeDefined();
    });

    it('should add handlers for actions', () => {
      expect(TestStore.handlers)
        .toEqual(jasmine.objectContaining({
          TEST_CHANGE_FILTER: 'onTestChangeFilter',
          TEST_CLEAR_FILTER: 'onTestClearFilter',
          TEST_CHANGE_SEARCH: 'onTestChangeSearch',
          TEST_CLEAR_SEARCH: 'onTestClearSearch'
        }));
    });
  });
});
