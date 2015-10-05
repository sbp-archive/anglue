/*eslint-env node, jasmine*//*global module, inject*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {Store, StoreAnnotation, Inject, Handler, Handlers} from 'anglue/anglue';

describe('Stores', () => {
  describe('@Store() decorator', () => {
    it('should create a store annotation', () => {
      @Store() class SimpleStore {}
      expect(SimpleStore.annotation)
        .toEqual(jasmine.any(StoreAnnotation));
    });

    it('should leverage the class name by default as the store name', () => {
      @Store() class SimpleStore {}
      expect(SimpleStore.annotation.name)
        .toEqual('simple');
    });

    it('should be possible to pass the store name to the decorator', () => {
      @Store('renamed') class SimpleStore {}
      expect(SimpleStore.annotation.name)
        .toEqual('renamed');
    });

    it('should be possible to pass a config with the store name to the decorator', () => {
      @Store({name: 'renamed'}) class SimpleStore {}
      expect(SimpleStore.annotation.name)
        .toEqual('renamed');
    });
  });

  describe('StoreAnnotation', () => {
    it('should set the angular module name correctly', () => {
      @Store() class SimpleStore {}
      expect(SimpleStore.annotation.module.name)
        .toEqual('stores.simple');
    });

    it('should set the annotation service name correctly', () => {
      @Store() class SimpleStore {}
      expect(SimpleStore.annotation.serviceName)
        .toEqual('SimpleStore');
    });
  });

  describe('@Handler() decorator', () => {
    it('should add a handler to the static class handlers getter', () => {
      @Store() class HandlerStore {
        @Handler() onSomeAction() {}
      }
      expect(HandlerStore.handlers)
        .toEqual({SOME_ACTION: 'onSomeAction'});
    });

    it('should be possible to manually name the action of a handler', () => {
      @Store() class HandlerStore {
        @Handler('renamed') onSomeAction() {}
      }
      expect(HandlerStore.handlers)
        .toEqual({renamed: 'onSomeAction'});
    });
  });

  describe('@Handlers() decorator', () => {
    it('should merge passed in to the static class handlers getter', () => {
      @Store()
      @Handlers({FOO: 'onBar', BAR: 'onFoo'})
      class HandlersStore {}

      expect(HandlersStore.handlers)
        .toEqual({FOO: 'onBar', BAR: 'onFoo'});
    });
  });

  describe('instance', () => {
    @Store()
    class ComplexStore {
      @Inject() $timeout;
      initialize = jasmine.createSpy();
    }

    angular
      .module('storeApp', [
        'luxyflux',
        ComplexStore.annotation.module.name
      ])
      .service('ApplicationDispatcher', [
        function() {
          return {
            register: jasmine.createSpy(),
            dispatch: jasmine.createSpy()
          };
        }
      ]);

    let store, $timeout, appDispatcher;
    beforeEach(module('storeApp'));
    beforeEach(inject((_ComplexStore_, _$timeout_, _ApplicationDispatcher_) => {
      store = _ComplexStore_;
      appDispatcher = _ApplicationDispatcher_;
      $timeout = _$timeout_;
    }));

    it('should call the initialize method', () => {
      expect(store.initialize).toHaveBeenCalled();
    });

    it('should inject into the store', () => {
      expect(store.$timeout).toBe($timeout);
    });

    it('should register itself with the ApplicationDispatcher', () => {
      expect(appDispatcher.register).toHaveBeenCalledWith('store.complex', jasmine.any(Function));
    });
  });
});
