/*eslint-env node, jasmine*//*global module inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {
  Annotations,
  Actions,
  FilterableActions
} from 'anglue/anglue';

describe('FilterableActions', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('@FilterableActions() decorator', () => {
    @Actions()
    @FilterableActions()
    class FilterableTestActions {}

    let testActions;
    let appDispatcher;

    class MockApplicationDispatcher {
      dispatch() {}
    }

    angular
      .module('filterableActionsApp', [
        'luxyflux',
        FilterableTestActions.annotation.module.name
      ])
      .service('ApplicationDispatcher', [
        function () {
          return new MockApplicationDispatcher();
        }
      ]);

    beforeEach(module('filterableActionsApp'));
    beforeEach(inject((_FilterableTestActions_, _ApplicationDispatcher_) => {
      testActions = _FilterableTestActions_;
      appDispatcher = _ApplicationDispatcher_;

      spyOn(appDispatcher, 'dispatch');
    }));


    it('should dispatch an FILTERABLE_TEST_CHANGE_SEARCH action', () => {
      testActions.changeSearch('FOOBAR');
      expect(appDispatcher.dispatch).toHaveBeenCalledWith('FILTERABLE_TEST_CHANGE_SEARCH', 'FOOBAR');
    });

    it('should dispatch an FILTERABLE_TEST_CLEAR_SEARCH action', () => {
      testActions.clearSearch();
      expect(appDispatcher.dispatch).toHaveBeenCalledWith('FILTERABLE_TEST_CLEAR_SEARCH');
    });

    it('should dispatch an FILTERABLE_TEST_CHANGE_FILTER action', () => {
      testActions.changeFilter('FOOBAR');
      expect(appDispatcher.dispatch).toHaveBeenCalledWith('FILTERABLE_TEST_CHANGE_FILTER', 'FOOBAR');
    });

    it('should dispatch an FILTERABLE_TEST_CLEAR_SEARCH action', () => {
      testActions.clearFilter('FOOBAR');
      expect(appDispatcher.dispatch).toHaveBeenCalledWith('FILTERABLE_TEST_CLEAR_FILTER', 'FOOBAR');
    });

  });
});
