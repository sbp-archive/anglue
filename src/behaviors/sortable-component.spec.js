/*eslint-env node, jasmine*//*global module, inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';

import {
  Annotations,
  Component,
  SortableComponent,
  SortableComponentBehavior
} from 'anglue/anglue';

describe('SortableComponent', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('SortableComponentBehavior', () => {
    let mockInstance, behavior, changeSpy, clearSpy;

    class MockComponent {
      fooActions = {
        changeSort: changeSpy,
        clearSort: clearSpy
      };
      fooStore = {
        sortExpression: 'foo'
      }
    }

    beforeEach(() => {
      changeSpy = jasmine.createSpy('changeSpy');
      clearSpy = jasmine.createSpy('clearSpy');
      mockInstance = new MockComponent();
      behavior = new SortableComponentBehavior(mockInstance, {
        actions: 'fooActions',
        store: 'fooStore'
      });
    });

    it('should use the actions config to return the actions instance ref', () => {
      expect(behavior.actionsRef).toBe(mockInstance.fooActions);
    });

    it('should throw an error if it cant find the actionsRef', () => {
      const invalid = () => {
        behavior = new SortableComponentBehavior(mockInstance, {
          actions: 'barActions',
          store: 'fooStore'
        });
      };
      expect(invalid).toThrowError(
        `SortableComponentBehavior: 'barActions' not found on MockComponent`);
    });

    it('should throw an error if it cant find the storeRef', () => {
      const invalid = () => {
        behavior = new SortableComponentBehavior(mockInstance, {
          actions: 'fooActions',
          store: 'barStore'
        });
      };
      expect(invalid).toThrowError(
        `SortableComponentBehavior: 'barStore' not found on MockComponent`);
    });

    it('should be possible to get the current sortExpression', () => {
      behavior.sortExpression = 'foo';
      expect(behavior.sortExpression).toEqual('foo');
    });

    it('should call changeSort method on the actionsRef when sortExpression is changed', () => {
      behavior.sortExpression = 'foo';
      expect(changeSpy).toHaveBeenCalledWith('foo');
    });

    it('should call changeSort method on the actionsRef when sortExpression set to null', () => {
      behavior.sortExpression = null;
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('@SortableComponent() decorator', () => {
    @Component() @SortableComponent()
    class SortableTestComponent {
      sortableActions = {};
      sortableStore = {};
    }

    @Component() @SortableComponent({
      entity: 'foo'
    })
    class SortableComplexComponent {
      fooActions = {
        changeSort() {}
      };
      fooStore = {}
    }

    @Component() @SortableComponent({actions: 'customActions'})
    class CustomActionsComponent {
      customActions = {};
      customStore = {};
    }

    @Component() @SortableComponent('customActions')
    class CustomActionsStringComponent {
      customActions = {};
      customStore = {};
    }

    angular.module('sortableComponents', [
      SortableTestComponent.annotation.module.name,
      CustomActionsComponent.annotation.module.name,
      CustomActionsStringComponent.annotation.module.name,
      SortableComplexComponent.annotation.module.name
    ]);

    let $compile, $rootScope;
    let testComponent, customActionsComponent, customActionsStringComponent, complexComponent;
    beforeEach(module('sortableComponents'));
    beforeEach(inject((_$compile_, _$rootScope_) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

      testComponent = compileTemplate('<sortable-test></sortable-test>', $compile, $rootScope)
        .controller('sortableTest');
      customActionsComponent = compileTemplate(
        '<custom-actions></custom-actions>', $compile, $rootScope)
        .controller('customActions');
      customActionsStringComponent = compileTemplate(
        '<custom-actions-string></custom-actions-string>', $compile, $rootScope)
        .controller('customActionsString');
      complexComponent = compileTemplate('<sortable-complex></sortable-complex>', $compile, $rootScope)
        .controller('sortableComplex');
    }));

    it('should define the SortableComponent API on the component', () => {
      expect(testComponent.sortableComponent).toBeDefined();
    });

    it('should have an instance of SortableComponentBehavior as the behavior property', () => {
      expect(testComponent.sortableComponent).toEqual(jasmine.any(SortableComponentBehavior));
    });

    it('should use the first uppercased part of class name to determine the actions and store', () => {
      expect(testComponent.sortableComponent.actions).toEqual('sortableActions');
      expect(testComponent.sortableComponent.store).toEqual('sortableStore');
    });

    it('should be possible to pass the actions and store in the configuration', () => {
      expect(customActionsComponent.sortableComponent.actions).toEqual('customActions');
      expect(customActionsComponent.sortableComponent.store).toEqual('customStore');
    });

    it('should be possible to pass the actions and store properties as a string', () => {
      expect(customActionsStringComponent.sortableComponent.actions).toEqual('customActions');
      expect(customActionsStringComponent.sortableComponent.store).toEqual('customStore');
    });

    it('should be possible to configure an entity to determine the actions and store', () => {
      expect(complexComponent.sortableComponent.actions).toEqual('fooActions');
      expect(complexComponent.sortableComponent.store).toEqual('fooStore');
    });
  });
});

function compileTemplate(template, $compile, $rootScope) {
  const el = angular.element(template.trim());
  $compile(el)($rootScope.$new());
  $rootScope.$digest();
  return el;
}
