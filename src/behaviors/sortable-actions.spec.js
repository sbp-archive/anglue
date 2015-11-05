/*eslint-env node, jasmine*//*global module inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {
  Annotations,
  Actions,
  SortableActions
} from 'anglue/anglue';

describe('SortableActions', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('@SortableActions() decorator', () => {
    @Actions()
    @SortableActions()
    class SortableTestActions {}

    let testActions;
    let appDispatcher;

    class MockApplicationDispatcher {
      dispatch() {}
    }

    angular
      .module('sortableActionsApp', [
        'luxyflux',
        SortableTestActions.annotation.module.name
      ])
      .service('ApplicationDispatcher', [
        function () {
          return new MockApplicationDispatcher();
        }
      ]);

    beforeEach(module('sortableActionsApp'));
    beforeEach(inject((_SortableTestActions_, _ApplicationDispatcher_) => {
      testActions = _SortableTestActions_;
      appDispatcher = _ApplicationDispatcher_;

      spyOn(appDispatcher, 'dispatch');
    }));


    it('should dispatch an CHANGE_SORT action', () => {
      testActions.changeSort('FOOBAR');
      expect(appDispatcher.dispatch).toHaveBeenCalledWith('SORTABLE_TEST_CHANGE_SORT', 'FOOBAR');
    });

    it('should dispatch an CLEAR_SORT action', () => {
      testActions.clearSort();
      expect(appDispatcher.dispatch).toHaveBeenCalledWith('SORTABLE_TEST_CLEAR_SORT');
    });

  });
});
