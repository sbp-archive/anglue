/*eslint-env node, jasmine*//*global module, inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';

import {
  Annotations,
  Component,
  SearchableComponent,
  SearchableComponentBehavior
} from 'anglue/anglue';

describe('SearchableComponent', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('SearchableComponentBehavior', () => {
    let mockInstance, behavior, changeSpy, clearSpy;

    class MockComponent {
      fooActions = {
        changeSearch: changeSpy,
        clearSearch: clearSpy
      };
      fooStore = {
        searchText: 'foo'
      }
    }

    beforeEach(() => {
      changeSpy = jasmine.createSpy('changeSpy');
      clearSpy = jasmine.createSpy('clearSpy');
      mockInstance = new MockComponent();
      behavior = new SearchableComponentBehavior(mockInstance, {
        actions: 'fooActions',
        store: 'fooStore'
      });
    });

    it('should use the actions config to return the actions instance ref', () => {
      expect(behavior.actionsRef).toBe(mockInstance.fooActions);
    });

    it('should throw an error if it cant find the actionsRef', () => {
      const invalid = () => {
        behavior = new SearchableComponentBehavior(mockInstance, {
          actions: 'barActions',
          store: 'fooStore'
        });
      };
      expect(invalid).toThrowError(
        `SearchableComponentBehavior: 'barActions' not found on MockComponent`);
    });

    it('should throw an error if it cant find the storeRef', () => {
      const invalid = () => {
        behavior = new SearchableComponentBehavior(mockInstance, {
          actions: 'fooActions',
          store: 'barStore'
        });
      };
      expect(invalid).toThrowError(
        `SearchableComponentBehavior: 'barStore' not found on MockComponent`);
    });

    it('should be possible to get the current searchText', () => {
      expect(behavior.searchText).toEqual('foo');
    });

    it('should call changeSearch method on the actionsRef when searchText is changed', () => {
      behavior.searchText = 'foo';
      expect(changeSpy).toHaveBeenCalledWith('foo');
    });

    it('should call clearSearch method on the actionsRef when searchText set to null', () => {
      behavior.searchText = null;
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('@SearcheableComponent() decorator', () => {
    @Component() @SearchableComponent()
    class SearchableTestComponent {
      searchableActions = {};
      searchableStore = {};
    }

    @Component() @SearchableComponent({
      entity: 'foo'
    })
    class SearchableComplexComponent {
      fooActions = {
        changeSearch() {}
      };
      fooStore = {}
    }

    @Component() @SearchableComponent({actions: 'customActions'})
    class CustomSearchableActionsComponent {
      customActions = {};
      customStore = {};
    }

    @Component() @SearchableComponent('customActions')
    class CustomSearchableActionsStringComponent {
      customActions = {};
      customStore = {};
    }

    angular.module('searchableComponents', [
      SearchableTestComponent.annotation.module.name,
      CustomSearchableActionsComponent.annotation.module.name,
      CustomSearchableActionsStringComponent.annotation.module.name,
      SearchableComplexComponent.annotation.module.name
    ]);

    let $compile, $rootScope;
    let testComponent, customActionsComponent, customActionsStringComponent, complexComponent;
    beforeEach(module('searchableComponents'));
    beforeEach(inject((_$compile_, _$rootScope_) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

      testComponent = compileTemplate('<searchable-test></searchable-test>', $compile, $rootScope)
        .controller('searchableTest');
      customActionsComponent = compileTemplate(
        '<custom-searchable-actions></custom-searchable-actions>', $compile, $rootScope)
        .controller('customSearchableActions');
      customActionsStringComponent = compileTemplate(
        '<custom-searchable-actions-string></custom-searchable-actions-string>', $compile, $rootScope)
        .controller('customSearchableActionsString');
      complexComponent = compileTemplate('<searchable-complex></searchable-complex>', $compile, $rootScope)
        .controller('searchableComplex');
    }));

    it('should define the SearchableComponent API on the component', () => {
      expect(testComponent.searchableComponent).toBeDefined();
    });

    it('should have an instance of SearchableComponentBehavior as the behavior property', () => {
      expect(testComponent.searchableComponent).toEqual(jasmine.any(SearchableComponentBehavior));
    });

    it('should use the first uppercased part of class name to determine the actions and store', () => {
      expect(testComponent.searchableComponent.actions).toEqual('searchableActions');
      expect(testComponent.searchableComponent.store).toEqual('searchableStore');
    });

    it('should be possible to pass the actions and store in the configuration', () => {
      expect(customActionsComponent.searchableComponent.actions).toEqual('customActions');
      expect(customActionsComponent.searchableComponent.store).toEqual('customStore');
    });

    it('should be possible to pass the actions and store properties as a string', () => {
      expect(customActionsStringComponent.searchableComponent.actions).toEqual('customActions');
      expect(customActionsStringComponent.searchableComponent.store).toEqual('customStore');
    });

    it('should be possible to configure an entity to determine the actions and store', () => {
      expect(complexComponent.searchableComponent.actions).toEqual('fooActions');
      expect(complexComponent.searchableComponent.store).toEqual('fooStore');
    });
  });
});

function compileTemplate(template, $compile, $rootScope) {
  const el = angular.element(template.trim());
  $compile(el)($rootScope.$new());
  $rootScope.$digest();
  return el;
}
