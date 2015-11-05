/*eslint-env node, jasmine*//*global module inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {
  Annotations,
  Actions,
  SearchableActions
} from 'anglue/anglue';

describe('SearchableActions', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('@SearchableActions() decorator', () => {
    @Actions()
    @SearchableActions()
    class SearchableTestActions {}

    let testActions;
    let appDispatcher;

    class MockApplicationDispatcher {
      dispatch() {}
    }

    angular
      .module('searchableActionsApp', [
        'luxyflux',
        SearchableTestActions.annotation.module.name
      ])
      .service('ApplicationDispatcher', [
        function () {
          return new MockApplicationDispatcher();
        }
      ]);

    beforeEach(module('searchableActionsApp'));
    beforeEach(inject((_SearchableTestActions_, _ApplicationDispatcher_) => {
      testActions = _SearchableTestActions_;
      appDispatcher = _ApplicationDispatcher_;

      spyOn(appDispatcher, 'dispatch');
    }));


    it('should dispatch an SEARCHABLE_TEST_CHANGE_SEARCH action', () => {
      testActions.changeSearch('FOOBAR');
      expect(appDispatcher.dispatch).toHaveBeenCalledWith('SEARCHABLE_TEST_CHANGE_SEARCH', 'FOOBAR');
    });

    it('should dispatch an SEARCHABLE_TEST_CLEAR_SEARCH action', () => {
      testActions.clearSearch();
      expect(appDispatcher.dispatch).toHaveBeenCalledWith('SEARCHABLE_TEST_CLEAR_SEARCH');
    });

  });
});
