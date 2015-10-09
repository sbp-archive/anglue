/*eslint-env node, jasmine*//*global module*/
/*eslint-disable max-statements, max-params*/
import {buildComponent} from 'anglue/anglue';

import {
  Annotations,
  Component,
  PaginatableComponent,
  PaginatableComponentBehavior
} from 'anglue/anglue';

describe('PaginatableComponent', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('PaginatableComponentBehavior', () => {
    class MockComponent {
      fooActions = {
        pageChange: changePageSpy,
        limitChange: changeLimitSpy
      };

      fooStore = {
        paginatableStore: true,
        paginationState: {
          page: null,
          limit: null,
          total: 100
        }
      };
    }

    let mockInstance, behavior, changePageSpy, changeLimitSpy;
    beforeEach(() => {
      changePageSpy = jasmine.createSpy('changePageSpy');
      changeLimitSpy = jasmine.createSpy('changeLimitSpy');

      mockInstance = new MockComponent();
      behavior = new PaginatableComponentBehavior(mockInstance, {
        actions: 'fooActions',
        store: 'fooStore',
        initialPage: null,
        initialLimit: null
      });
    });

    it('should use the actions config to return the actions instance ref', () => {
      expect(behavior.actionsRef).toBe(mockInstance.fooActions);
    });

    it('should use the actions config to return the actions instance ref', () => {
      expect(behavior.storeRef).toBe(mockInstance.fooStore);
    });

    it('should throw an error if it cant find the actionsRef', () => {
      const invalid = () => {
        behavior = new PaginatableComponentBehavior(mockInstance, {
          actions: 'barActions'
        });
      };
      expect(invalid).toThrowError(
        `PaginatableComponentBehavior: actionsRef 'barActions' not found on MockComponent`);
    });

    it('should throw an error if it cant find the storeRef', () => {
      const invalid = () => {
        behavior = new PaginatableComponentBehavior(mockInstance, {
          actions: 'fooActions',
          store: 'barStore'
        });
      };
      expect(invalid).toThrowError(
        `PaginatableComponentBehavior: storeRef 'barStore' not found on MockComponent`);
    });

    it('should throw an error if the storeRef is not paginatable', () => {
      const invalid = () => {
        mockInstance.fooStore.paginatableStore = false;
        behavior = new PaginatableComponentBehavior(mockInstance, {
          actions: 'fooActions',
          store: 'fooStore'
        });
      };
      expect(invalid).toThrowError(
        `PaginatableComponentBehavior: storeRef 'fooStore' on MockComponent is not paginatable`);
    });

    it('should be possible to get the current pagination info', () => {
      mockInstance.fooStore.paginationState.page = 2;
      mockInstance.fooStore.paginationState.limit = 30;
      expect(behavior.page).toEqual(2);
      expect(behavior.limit).toEqual(30);
      expect(behavior.total).toEqual(100);
    });

    it('should call pageChange method on the actionsRef when page is changed', () => {
      behavior.page = 3;
      expect(changePageSpy).toHaveBeenCalledWith(3);
    });

    it('should not call pageChange method on the actionsRef when page is the same', () => {
      mockInstance.fooStore.paginationState.page = 2;
      behavior.page = 2;
      expect(changePageSpy).not.toHaveBeenCalled();
    });

    it('should call limitChange method on the actionsRef when limit is changed', () => {
      behavior.limit = 25;
      expect(changeLimitSpy).toHaveBeenCalledWith(25);
    });

    it('should not call limitChange method on the actionsRef when limit is the same', () => {
      mockInstance.fooStore.paginationState.limit = 30;
      behavior.limit = 30;
      expect(changeLimitSpy).not.toHaveBeenCalled();
    });

    it('should set dispatch for an initial sort expression', () => {
      behavior = new PaginatableComponentBehavior(mockInstance, {
        actions: 'fooActions',
        store: 'fooStore',
        initialPage: 5,
        initialLimit: 400
      });
      expect(changePageSpy).toHaveBeenCalledWith(5);
      expect(changeLimitSpy).toHaveBeenCalledWith(400);
    });
  });

  describe('@PaginatableComponent() decorator', () => {
    const mockActions = {
      pageChange() {},
      limitChange() {}
    };
    const mockStore = {
      paginatableStore: true,
      paginationState: {
        page: 2,
        limit: 10
      }
    };

    @Component()
    @PaginatableComponent() class PaginatableTestComponent {
      paginatableActions = mockActions;
      paginatableStore = mockStore;
    }

    @Component()
    @PaginatableComponent({
      entity: 'foo',
      initialPage: 3,
      initialLimit: 100
    }) class PaginatableEntityConfiguredComponent {
      fooActions = mockActions;
      fooStore = mockStore;
    }

    @Component()
    @PaginatableComponent({
      actions: 'customActions',
      store: 'customStore'
    }) class PaginatableCustomConfiguredComponent {
      customActions = mockActions;
      customStore = mockStore;
    }

    @Component()
    @PaginatableComponent('foo') class PaginatableStringConfiguredComponent {
      fooActions = mockActions;
      fooStore = mockStore;
    }

    it('should define the PaginatableComponent API on the component', () => {
      const autoConfiguredComponent = buildComponent(PaginatableTestComponent);
      [
        'pagination'
      ].forEach(api => expect(autoConfiguredComponent[api]).toBeDefined());
    });

    it('should have an instance of PaginatableComponentBehavior as the behavior property', () => {
      const autoConfiguredComponent = buildComponent(PaginatableTestComponent);
      expect(autoConfiguredComponent.pagination).toEqual(jasmine.any(PaginatableComponentBehavior));
    });

    it('should use the first uppercased part of class name to determine the actions and store', () => {
      const autoConfiguredComponent = buildComponent(PaginatableTestComponent);
      expect(autoConfiguredComponent.pagination.actions).toEqual('paginatableActions');
      expect(autoConfiguredComponent.pagination.store).toEqual('paginatableStore');
    });

    it('should be possible to pass the entity property as a string to determine actions and store', () => {
      const stringConfiguredComponent = buildComponent(PaginatableStringConfiguredComponent);
      expect(stringConfiguredComponent.pagination.actions).toEqual('fooActions');
      expect(stringConfiguredComponent.pagination.store).toEqual('fooStore');
    });

    it('should be possible to configure an entity to determine the actions and store', () => {
      const entityConfiguredComponent = buildComponent(PaginatableEntityConfiguredComponent);
      expect(entityConfiguredComponent.pagination.actions).toEqual('fooActions');
      expect(entityConfiguredComponent.pagination.store).toEqual('fooStore');
    });

    it('should be possible to pass the actions and store in the configuration', () => {
      const customConfiguredComponent = buildComponent(PaginatableCustomConfiguredComponent);
      expect(customConfiguredComponent.pagination.actions).toEqual('customActions');
      expect(customConfiguredComponent.pagination.store).toEqual('customStore');
    });

    it('should be possible to configure initial page and limit', () => {
      const entityConfiguredComponent = buildComponent(PaginatableEntityConfiguredComponent);
      expect(entityConfiguredComponent.pagination.config.initialPage).toEqual(3);
      expect(entityConfiguredComponent.pagination.config.initialLimit).toEqual(100);
    });
  });
});
