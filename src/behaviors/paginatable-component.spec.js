/*eslint-env node, jasmine*//*global module, inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';

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
          page: 2,
          limit: 30,
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
        store: 'fooStore'
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
      expect(behavior.page).toEqual(2);
      expect(behavior.limit).toEqual(30);
      expect(behavior.total).toEqual(100);
    });

    it('should call pageChange method on the actionsRef when page is changed', () => {
      behavior.page = 3;
      expect(changePageSpy).toHaveBeenCalledWith(3);
    });

    it('should not call pageChange method on the actionsRef when page is the same', () => {
      behavior.page = 2;
      expect(changePageSpy).not.toHaveBeenCalled();
    });

    it('should call limitChange method on the actionsRef when page is changed', () => {
      behavior.limit = 20;
      expect(changeLimitSpy).toHaveBeenCalledWith(20);
    });

    it('should not call limitChange method on the actionsRef when page is the same', () => {
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
    @Component()
    @PaginatableComponent()
    class PaginatableTestComponent {
      paginatableActions = {};
      paginatableStore = {paginatableStore: true};
    }

    @Component()
    @PaginatableComponent({
      entity: 'foo',
      initialPage: 3,
      initialLimit: 100
    })
    class PaginatableEntityConfiguredComponent {
      fooActions = {
        pageChange() {},
        limitChange() {}
      };
      fooStore = {
        paginatableStore: true,
        paginationState: {
          page: 2,
          limit: 10
        }
      };
    }

    @Component()
    @PaginatableComponent({
      actions: 'customActions',
      store: 'customStore'
    })
    class PaginatableCustomConfiguredComponent {
      customActions = {};
      customStore = {paginatableStore: true}
    }

    @Component()
    @PaginatableComponent('foo')
    class PaginatableStringConfiguredComponent {
      fooActions = {};
      fooStore = {paginatableStore: true}
    }

    angular.module('paginatableComponents', [
      PaginatableTestComponent.annotation.module.name,
      PaginatableEntityConfiguredComponent.annotation.module.name,
      PaginatableCustomConfiguredComponent.annotation.module.name,
      PaginatableStringConfiguredComponent.annotation.module.name
    ]);

    let $compile, $rootScope;
    let autoConfiguredComponent;
    let entityConfiguredComponent;
    let customConfiguredComponent;
    let stringConfiguredComponent;

    beforeEach(module('paginatableComponents'));
    beforeEach(inject((_$compile_, _$rootScope_) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

      autoConfiguredComponent = compileTemplate(
        '<paginatable-test></paginatable-test>', $compile, $rootScope)
        .controller('paginatableTest');
      entityConfiguredComponent = compileTemplate(
        '<paginatable-entity-configured></paginatable-entity-configured>', $compile, $rootScope)
        .controller('paginatableEntityConfigured');
      customConfiguredComponent = compileTemplate(
        '<paginatable-custom-configured></paginatable-custom-configured>', $compile, $rootScope)
        .controller('paginatableCustomConfigured');
      stringConfiguredComponent = compileTemplate(
        '<paginatable-string-configured></paginatable-string-configured>', $compile, $rootScope)
        .controller('paginatableStringConfigured');
    }));

    it('should define the PaginatableComponent API on the component', () => {
      [
        'pagination'
      ].forEach(api => expect(autoConfiguredComponent[api]).toBeDefined());
    });

    it('should have an instance of PaginatableComponentBehavior as the behavior property', () => {
      expect(autoConfiguredComponent.pagination).toEqual(jasmine.any(PaginatableComponentBehavior));
    });

    it('should use the first uppercased part of class name to determine the actions and store', () => {
      expect(autoConfiguredComponent.pagination.actions).toEqual('paginatableActions');
      expect(autoConfiguredComponent.pagination.store).toEqual('paginatableStore');
    });

    it('should be possible to pass the entity property as a string to determine actions and store', () => {
      expect(stringConfiguredComponent.pagination.actions).toEqual('fooActions');
      expect(stringConfiguredComponent.pagination.store).toEqual('fooStore');
    });

    it('should be possible to configure an entity to determine the actions and store', () => {
      expect(entityConfiguredComponent.pagination.actions).toEqual('fooActions');
      expect(entityConfiguredComponent.pagination.store).toEqual('fooStore');
    });

    it('should be possible to pass the actions and store in the configuration', () => {
      expect(customConfiguredComponent.pagination.actions).toEqual('customActions');
      expect(customConfiguredComponent.pagination.store).toEqual('customStore');
    });

    it('should be possible to configure initial page and limit', () => {
      expect(entityConfiguredComponent.pagination.config.initialPage).toEqual(3);
      expect(entityConfiguredComponent.pagination.config.initialLimit).toEqual(100);
    });
  });
});

function compileTemplate(template, $compile, $rootScope) {
  const el = angular.element(template.trim());
  $compile(el)($rootScope.$new());
  $rootScope.$digest();
  return el;
}
