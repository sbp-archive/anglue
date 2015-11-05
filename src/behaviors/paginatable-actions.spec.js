/*eslint-env node, jasmine*//*global module inject*/
/*eslint-disable max-statements, max-params*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {
  Annotations,
  Actions,
  PaginatableActions
} from 'anglue/anglue';

describe('PaginatableActions', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('@PaginatableActions() decorator', () => {
    @Actions()
    @PaginatableActions()
    class PaginatableTestActions {}

    let testActions;
    let appDispatcher;

    class MockApplicationDispatcher {
      dispatch() {}
    }

    angular
      .module('paginatableActionsApp', [
        'luxyflux',
        PaginatableTestActions.annotation.module.name
      ])
      .service('ApplicationDispatcher', [
        function () {
          return new MockApplicationDispatcher();
        }
      ]);

    beforeEach(module('paginatableActionsApp'));
    beforeEach(inject((_PaginatableTestActions_, _ApplicationDispatcher_) => {
      testActions = _PaginatableTestActions_;
      appDispatcher = _ApplicationDispatcher_;

      spyOn(appDispatcher, 'dispatch');
    }));


    it('should dispatch an CHANGE_LIMIT action', () => {
      expect(testActions.changeLimit(1));
      expect(appDispatcher.dispatch).toHaveBeenCalledWith('PAGINATABLE_TEST_CHANGE_LIMIT', 1);
    });

    it('should dispatch an CHANGE_PAGE action', () => {
      expect(testActions.changePage(1));
      expect(appDispatcher.dispatch).toHaveBeenCalledWith('PAGINATABLE_TEST_CHANGE_PAGE', 1);
    });

  });
});
