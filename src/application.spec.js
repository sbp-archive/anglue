/*eslint-env node, jasmine*//*global module, inject*/
import 'angular';
import 'angular-mocks';
import 'angular-ui-router';
import 'luxyflux/ng-luxyflux';

import {
  Application,
  ApplicationAnnotation,
  Store,
  Actions,
  Component,
  Annotations
} from 'anglue/anglue';

describe('Applications', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('@Application() decorator', () => {
    it('should create a component annotation', () => {
      @Application() class TestApplication {}
      expect(TestApplication.annotation)
        .toEqual(jasmine.any(ApplicationAnnotation));
    });

    it('should leverage the class name by default as the application name', () => {
      @Application() class TestApplication {}
      expect(TestApplication.annotation.name)
        .toEqual('test');
    });

    it('should be possible to pass the application name to the decorator', () => {
      @Application('renamed') class TestApplication {}
      expect(TestApplication.annotation.name)
        .toEqual('renamed');
    });

    it('should be possible to pass a config with the application name to the decorator', () => {
      @Application({name: 'renamed'}) class TestApplication {}
      expect(TestApplication.annotation.name)
        .toEqual('renamed');
    });

    it('should be possible to pass a config with dependencies to the decorator', () => {
      @Application({dependencies: ['dependency']}) class TestApplication {}
      expect(TestApplication.dependencies)
        .toEqual(jasmine.arrayContaining(['dependency']));
    });

    it('should be possible to pass a config with components to the decorator', () => {
      @Application({components: ['component']}) class TestApplication {}
      expect(TestApplication.components)
        .toEqual(jasmine.arrayContaining(['component']));
    });

    it('should be possible to pass a config with stores to the decorator', () => {
      @Application({stores: ['store']}) class TestApplication {}
      expect(TestApplication.stores)
        .toEqual(jasmine.arrayContaining(['store']));
    });

    it('should be possible to pass a config with actions to the decorator', () => {
      @Application({actions: ['action']}) class TestApplication {}
      expect(TestApplication.actions)
        .toEqual(jasmine.arrayContaining(['action']));
    });

    it('should be possible to pass a config with routes to the decorator', () => {
      @Application({routes: {foo: 'bar'}}) class TestApplication {}
      expect(TestApplication.routes)
        .toEqual(jasmine.objectContaining({foo: 'bar'}));
    });
  });

  describe('ApplicationAnnotation', () => {
    it('should set the angular module name correctly', () => {
      @Application() class TestApplication {}
      expect(TestApplication.annotation.module.name)
        .toEqual('test');
    });

    it('should set luxyflux as a module dependency by default', () => {
      @Application() class TestApplication {}
      expect(TestApplication.annotation.module.requires)
        .toEqual(jasmine.arrayContaining(['luxyflux']));
    });

    it('should add ui.router as a module dependency when routes are specified', () => {
      @Application({routes: {foo: 'bar'}}) class TestApplication {}
      expect(TestApplication.annotation.module.requires)
        .toEqual(jasmine.arrayContaining(['luxyflux', 'ui.router']));
    });

    it('should set the angular module dependencies correctly', () => {
      @Store() class TestStore {}
      @Actions() class TestActions {}
      @Component() class TestComponent {}

      @Application() class TestApplication {
        static dependencies = ['dependency'];
        static components = [TestComponent];
        static stores = [TestStore];
        static actions = [TestActions];
      }

      expect(TestApplication.annotation.module.requires)
        .toEqual(jasmine.arrayContaining([
          'dependency',
          'components.test',
          'stores.test',
          'actions.test'
        ]));
    });

    it('should only inject and thus instantiate stores on app module run', () => {
      const storeInitializeSpy = jasmine.createSpy();
      const actionsInitializeSpy = jasmine.createSpy();

      @Store() class TestStore {
        initialize = storeInitializeSpy;
      }

      @Actions() class TestActions {
        constructor() {
          actionsInitializeSpy();
        }
      }

      @Application() class TestApplication {
        static stores = [TestStore];
        static actions = [TestActions];
      }

      module(TestApplication.annotation.module.name);
      inject();

      expect(storeInitializeSpy).toHaveBeenCalled();
      expect(actionsInitializeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Routes', () => {
    @Application({
      routes: {
        defaultRoute: '/test',
        redirects: {
          '/from': '/to'
        },
        foo: 'bar',
        bar: 'foo'
      }
    })
    class TestApplication {}

    let mockStateProvider, mockUrlRouterProvider;
    beforeEach(() => {
      module('ui.router', ($stateProvider, $urlRouterProvider) => {
        mockStateProvider = $stateProvider;
        mockUrlRouterProvider = $urlRouterProvider;

        spyOn($stateProvider, 'state');
        spyOn($urlRouterProvider, 'otherwise');
        spyOn($urlRouterProvider, 'when');
      });
      module(TestApplication.annotation.module.name);
      inject();
    });

    it('should set the default route on the $urlRouterProvider', () => {
      expect(mockUrlRouterProvider.otherwise).toHaveBeenCalledWith('/test');
    });

    it('should configure redirects on the $urlRouterProvider', () => {
      expect(mockUrlRouterProvider.when).toHaveBeenCalledWith('/from', '/to');
    });

    it('should define routes on the $stateProvider', () => {
      expect(mockStateProvider.state.calls.count()).toBe(2);
      expect(mockStateProvider.state).toHaveBeenCalledWith('foo', 'bar');
      expect(mockStateProvider.state).toHaveBeenCalledWith('bar', 'foo');
    });
  });
});
