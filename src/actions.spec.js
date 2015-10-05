/*eslint-env node, jasmine*/
/*global module, inject*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {Actions, AsyncAction, Action, ActionsAnnotation, Inject} from 'anglue/anglue';

describe('Actions', () => {
  describe('@Actions() decorator', () => {
    it('should create a actions annotation', () => {
      @Actions() class SimpleActions {}
      expect(SimpleActions.annotation)
        .toEqual(jasmine.any(ActionsAnnotation));
    });

    it('should leverage the class name by default as the actions name', () => {
      @Actions() class SimpleActions {}
      expect(SimpleActions.annotation.name)
        .toEqual('simple');
    });

    it('should be possible to pass the actions name to the decorator', () => {
      @Actions('renamed') class NamedActions {}
      expect(NamedActions.annotation.name)
        .toEqual('renamed');
    });

    it('should be possible to pass a config with the actions name to the decorator', () => {
      @Actions({name: 'renamed'}) class NamedActions {}
      expect(NamedActions.annotation.name)
        .toEqual('renamed');
    });

    it('should be use the class name in the namespace by default', () => {
      @Actions() class NameSpacedActions {}
      expect(NameSpacedActions.actionNamespace)
        .toEqual('NAME_SPACED');
    });

    it('should be possible to pass a config with a namespace to the decorator', () => {
      @Actions({namespace: 'fooBar'}) class NamespacedActions {}
      expect(NamespacedActions.actionNamespace)
        .toEqual('FOO_BAR');
    });

    it('should be possible to set the namespace of a class false', () => {
      @Actions({namespace: false}) class NamespacedActions {}
      expect(NamespacedActions.actionNamespace)
        .toEqual(null);
    });

    it('should be possible to set the namespace of a class to an empty string', () => {
      @Actions({namespace: ''}) class NamespacedActions {}
      expect(NamespacedActions.actionNamespace)
        .toEqual(null);
    });

    it('should be possible to set the namespace of a class to null', () => {
      @Actions({namespace: null}) class NamespacedActions {}
      expect(NamespacedActions.actionNamespace)
        .toEqual(null);
    });
  });

  describe('ActionsAnnotation', () => {
    it('should set the angular module name correctly', () => {
      @Actions() class SimpleActions {}
      expect(SimpleActions.annotation.module.name)
        .toEqual('actions.simple');
    });

    it('should set the annotation service name correctly', () => {
      @Actions() class SimpleActions {}
      expect(SimpleActions.annotation.serviceName)
        .toEqual('SimpleActions');
    });
  });

  describe('@AsyncAction() decorator', () => {
    it('should add an action to the static class serviceActions getter', () => {
      @Actions() class AsyncActions {
        @AsyncAction() fooAction() {}

        @AsyncAction() barAction() {}
      }
      expect(AsyncActions.serviceActions)
        .toEqual({
          ASYNC_FOO_ACTION: 'fooAction',
          ASYNC_BAR_ACTION: 'barAction'
        });
    });

    it('should be possible to manually name the action of an async action', () => {
      @Actions() class AsyncActions {
        @AsyncAction('renamed') onSomeAction() {}
      }
      expect(AsyncActions.serviceActions)
        .toEqual({ASYNC_RENAMED: 'onSomeAction'});
    });
  });

  describe('instance', () => {
    let actions, $q, appDispatcher, $rootScope;
    let dispatcherDeferred, actionDeferred;

    @Actions() class ComplexActions {
      @Inject() $q;

      @Action() fooAction() {}

      @Action('NAMED') barAction() {
        return 'bar';
      }

      @AsyncAction() asyncFooAction() {
        return actionDeferred.promise;
      }
    }

    class MockApplicationDispatcher {
      dispatch() {}
    }

    angular
      .module('actionsApp', [
        'luxyflux',
        ComplexActions.annotation.module.name
      ])
      .service('ApplicationDispatcher', [
        function () {
          return new MockApplicationDispatcher();
        }
      ]);

    beforeEach(module('actionsApp'));
    beforeEach(inject((_ComplexActions_, _$q_, _$rootScope_, _ApplicationDispatcher_) => {
      actions = _ComplexActions_;
      appDispatcher = _ApplicationDispatcher_;
      $q = _$q_;
      $rootScope = _$rootScope_;

      dispatcherDeferred = $q.defer();
      dispatcherDeferred.resolve('resolvedFoo');
      spyOn(appDispatcher, 'dispatch')
        .and.returnValue(dispatcherDeferred.promise);

      actionDeferred = $q.defer();
    }));

    it('should inject into the actions', () => {
      expect(actions.$q).toBe($q);
    });

    it('should dispatch its actions on the ApplicationDispatcher', () => {
      actions.dispatch();
      expect(appDispatcher.dispatch).toHaveBeenCalled();
    });

    describe('actions', () => {
      it('should dispatch an action', () => {
        actions.fooAction();
        expect(appDispatcher.dispatch)
          .toHaveBeenCalledWith('COMPLEX_FOO_ACTION');
      });

      it('should dispatch a manually named action', () => {
        actions.barAction();
        expect(appDispatcher.dispatch)
          .toHaveBeenCalledWith('COMPLEX_NAMED');
      });

      it('should return the dispatch promise by default', () => {
        expect(actions.fooAction())
          .toEqual(dispatcherDeferred.promise);
      });

      it('should return a manually returned value in the action', () => {
        expect(actions.barAction())
          .toEqual('bar');
      });
    });

    describe('async actions', () => {
      it('should dispatch a started action', () => {
        actions.asyncFooAction();
        expect(appDispatcher.dispatch)
          .toHaveBeenCalledWith('COMPLEX_ASYNC_FOO_ACTION_STARTED');
      });

      it('should return a $q promise', () => {
        expect(actions.asyncFooAction()).toEqual($q.defer().promise);
      });

      it('should dispatch a COMPLETED action with the promise result when resolved', () => {
        actions.asyncFooAction().finally(() => {
          expect(appDispatcher.dispatch.calls.mostRecent().args)
            .toEqual(['COMPLEX_ASYNC_FOO_ACTION_COMPLETED', 'result']);
        });

        actionDeferred.resolve('result');
        $rootScope.$digest();
      });

      it('should dispatch a FAILED action with the promise result when resolved', () => {
        actions.asyncFooAction().finally(() => {
          expect(appDispatcher.dispatch.calls.mostRecent().args)
            .toEqual(['COMPLEX_ASYNC_FOO_ACTION_FAILED', 'error']);
        });

        actionDeferred.reject('error');
        $rootScope.$digest();
      });
    });
  });
});
