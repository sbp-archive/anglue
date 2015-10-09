/*eslint-env node, jasmine*//*global module, inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {
  Store,
  PaginationState,
  PaginatableStore,
  PaginatableStoreBehavior,
  TransformableCollection,
  Transformer,
  Annotations
} from 'anglue/anglue';

describe('Paginatable', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('PaginatableStoreBehavior', () => {
    let mockInstance, behavior, refreshSpy, addSpy, removeSpy;
    beforeEach(() => {
      refreshSpy = jasmine.createSpy();
      addSpy = jasmine.createSpy();
      removeSpy = jasmine.createSpy();

      class MockStore {
        transformables = {
          items: {
            refresh: refreshSpy,
            addTransformer: addSpy,
            removeTransformer: removeSpy,
            transformers: []
          },
          foo: {
            refresh: refreshSpy,
            addTransformer: addSpy,
            removeTransformer: removeSpy,
            transformers: []
          }
        }
      }

      mockInstance = new MockStore();
      behavior = new PaginatableStoreBehavior(mockInstance);
      spyOn(behavior, 'refresh').and.callThrough();
    });

    it('should create a PaginationState', () => {
      expect(behavior.state).toEqual(jasmine.any(PaginationState));
    });

    it('should set default values for its config', () => {
      behavior = new PaginatableStoreBehavior(mockInstance);
      expect(behavior.collection).toEqual('items');
      expect(behavior.state.page).toEqual(1);
      expect(behavior.state.limit).toEqual(null);
    });

    it('should read the passed config', () => {
      behavior = new PaginatableStoreBehavior(mockInstance, {
        collection: 'foo',
        initialPage: 2,
        initialLimit: 100
      });
      expect(behavior.collection).toEqual('foo');
      expect(behavior.state.page).toEqual(2);
      expect(behavior.state.limit).toEqual(100);
    });

    describe('#transformer', () => {
      it('should define a Transformer instance as the transformers property', () => {
        expect(behavior.transformer).toEqual(jasmine.any(Transformer));
      });

      it('should name the transformer paginatableStore', () => {
        expect(behavior.transformer.name).toEqual('paginatableStore');
      });

      it('should properly slice the passed in items', () => {
        behavior.state.limit = 2;
        behavior.state.page = 1;
        expect(behavior.transformer.exec(['foo', 'bar', 'zzz']))
          .toEqual(['foo', 'bar']);
      });

      it('should store the total on the behavior before the slice', () => {
        behavior.transformer.exec(['foo', 'bar', 'zzz']);
        expect(behavior.state.total).toEqual(3);
      });

      it('should not break when the slice end is bigger then the pass array', () => {
        behavior.state.limit = 2;
        behavior.state.page = 2;
        expect(behavior.transformer.exec(['foo', 'bar', 'zzz']))
          .toEqual(['zzz']);
      });
    });

    describe('refresh()', () => {
      it('should add the paginatable transformer if it was not active yet', () => {
        behavior.state.limit = 10;
        behavior.refresh();
        expect(addSpy).toHaveBeenCalled();
        expect(refreshSpy).not.toHaveBeenCalled();
      });

      it('should just refresh if there is an active paginatable transformer', () => {
        behavior.transformableCollection.transformers.push(behavior.transformer);
        behavior.state.limit = 10;
        behavior.refresh();
        expect(addSpy).not.toHaveBeenCalled();
        expect(refreshSpy).toHaveBeenCalled();
      });

      it('should remove the transformer if the limit is null', () => {
        behavior.transformableCollection.transformers.push(behavior.transformer);
        behavior.state.limit = null;
        behavior.refresh();
        expect(removeSpy).toHaveBeenCalled();
        expect(refreshSpy).not.toHaveBeenCalled();
      });

      it('should not remove an inactive transformer if the limit is null', () => {
        behavior.state.limit = null;
        behavior.refresh();
        expect(addSpy).not.toHaveBeenCalled();
        expect(removeSpy).not.toHaveBeenCalled();
        expect(refreshSpy).not.toHaveBeenCalled();
      });
    });

    describe('onPageChange()', () => {
      it('should update the internal page property', () => {
        behavior.onPageChange(2);
        expect(behavior.state.page).toEqual(2);
      });

      it('should call the internal refresh method if the page is changed', () => {
        behavior.onPageChange(2);
        expect(behavior.refresh).toHaveBeenCalled();
      });

      it('should not do anything if the page is the same as it was', () => {
        behavior.state.page = 2;
        behavior.onPageChange(2);
        expect(behavior.refresh).not.toHaveBeenCalled();
      });
    });

    describe('onLimitChange()', () => {
      it('should update the internal limit property', () => {
        behavior.onLimitChange(2);
        expect(behavior.state.limit).toEqual(2);
      });

      it('should call the internal refresh method if the limit is changed', () => {
        behavior.onLimitChange(2);
        expect(behavior.refresh).toHaveBeenCalled();
      });

      it('should not do anything if the limit is the same as it was', () => {
        behavior.state.limit = 2;
        behavior.onLimitChange(2);
        expect(behavior.refresh).not.toHaveBeenCalled();
      });
    });
  });

  describe('@PaginatableStore() decorator', () => {
    @Store() @PaginatableStore()
    class PaginatableFooStore {}

    @Store() @PaginatableStore({entity: 'custom'})
    class CustomPaginatableStore {}

    @Store() @PaginatableStore('custom')
    class CustomPaginatableStringStore {}

    @Store() @PaginatableStore({collection: 'foo'})
    class CollectionPaginatableStore {}

    @Store() @PaginatableStore({initialPage: 2, initialLimit: 5})
    class InitialPaginatableStore {}

    let paginatableStore;
    let customPaginatableStore;
    let customPaginatableStringStore;
    let collectionPaginatableStore;
    let initialPaginatableStore;

    beforeEach(() => {
      angular.module('test', [
        'luxyflux',
        PaginatableFooStore.annotation.module.name,
        CustomPaginatableStore.annotation.module.name,
        CustomPaginatableStringStore.annotation.module.name,
        CollectionPaginatableStore.annotation.module.name,
        InitialPaginatableStore.annotation.module.name
      ]).service('ApplicationDispatcher', () => {
        return {
          register() {},
          dispatch() {}
        };
      });

      module('test');
      inject((
        _PaginatableFooStore_,
        _CustomPaginatableStore_,
        _CustomPaginatableStringStore_,
        _CollectionPaginatableStore_,
        _InitialPaginatableStore_
      ) => {
        paginatableStore = _PaginatableFooStore_;
        customPaginatableStore = _CustomPaginatableStore_;
        customPaginatableStringStore = _CustomPaginatableStringStore_;
        collectionPaginatableStore = _CollectionPaginatableStore_;
        initialPaginatableStore = _InitialPaginatableStore_;
      });
    });

    it('should define the EntityStore API methods on the paginatableStore', () => {
      [
        'paginatableStore',
        'onPaginatableFooPageChange',
        'onPaginatableFooLimitChange',
        'paginationState'
      ].forEach(api => expect(paginatableStore[api]).toBeDefined());
    });

    it('should make the collection transformable', () => {
      expect(paginatableStore.transformables.items).toEqual(jasmine.any(TransformableCollection));
    });

    it('should have an instance of PaginatableStoreBehavior as the behavior property', () => {
      expect(paginatableStore.paginatableStore).toEqual(jasmine.any(PaginatableStoreBehavior));
    });

    it('should use the class name to determine the crud entity by default', () => {
      expect(paginatableStore.paginatableStore.config.entity).toEqual('PaginatableFoo');
    });

    it('should be possible to configure the entity to manage', () => {
      expect(customPaginatableStore.paginatableStore.config.entity).toEqual('custom');
    });

    it('should be possible to pass the entity property as a string', () => {
      expect(customPaginatableStringStore.paginatableStore.config.entity).toEqual('custom');
    });

    it('should create properly named handlers when configuring the entity', () => {
      expect(customPaginatableStore.onCustomPageChange).toBeDefined();
      expect(customPaginatableStore.onCustomLimitChange).toBeDefined();
    });

    it('should pass on initial state', () => {
      expect(initialPaginatableStore.paginationState.page).toEqual(2);
      expect(initialPaginatableStore.paginationState.limit).toEqual(5);
    });

    it('should use the item property as the collection by default', () => {
      expect(paginatableStore.paginatableStore.collection).toEqual('items');
    });

    it('should be possible to configure the collection property the entities are paginatableStored in', () => {
      expect(collectionPaginatableStore.paginatableStore.collection).toEqual('foo');
    });

    it('should add handlers for actions', () => {
      expect(PaginatableFooStore.handlers)
        .toEqual(jasmine.objectContaining({
          PAGINATABLE_FOO_PAGE_CHANGE: 'onPaginatableFooPageChange',
          PAGINATABLE_FOO_LIMIT_CHANGE: 'onPaginatableFooLimitChange'
        }));
    });
  });
});
