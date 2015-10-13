/*eslint-env node, jasmine*//*global module, inject*/
import angular from 'angular';
import 'angular-mocks';

import {
  Component,
  ComponentAnnotation,
  Inject,
  Flag,
  Binding,
  Event,
  ComponentEvent,
  View,
  Annotations,
  StoreListener,
  buildComponent
} from 'anglue/anglue';

describe('Components', () => {
  // Clear the AnnotationCache for unit tests to ensure we create new annotations for each class.
  beforeEach(() => {
    Annotations.clear();
  });

  describe('@Component() decorator', () => {
    it('should create a component annotation', () => {
      @Component() class SimpleComponent {}
      expect(SimpleComponent.annotation)
        .toEqual(jasmine.any(ComponentAnnotation));
    });

    it('should leverage the class name by default as the component name', () => {
      @Component() class SimpleComponent {}
      expect(SimpleComponent.annotation.name)
        .toEqual('simple');
    });

    it('should be possible to pass the component name to the decorator', () => {
      @Component('renamed') class NamedComponent {}
      expect(NamedComponent.annotation.name)
        .toEqual('renamed');
    });

    it('should be possible to pass a config with the component name to the decorator', () => {
      @Component({name: 'renamed'}) class NamedComponent {}
      expect(NamedComponent.annotation.name)
        .toEqual('renamed');
    });

    it('should be possible to pass a config with dependencies to the decorator', () => {
      @Component({dependencies: ['dependency']}) class DependentComponent {}
      expect(DependentComponent.annotation.dependencies)
        .toEqual(['dependency']);
    });
  });

  describe('ComponentAnnotation', () => {
    it('should set the angular module name correctly', () => {
      @Component() class SimpleComponent {}
      expect(SimpleComponent.annotation.module.name)
        .toEqual('components.simple');
    });

    it('should set the angular module dependencies correctly', () => {
      @Component({dependencies: ['dependency']}) class DependentComponent {}
      expect(DependentComponent.annotation.module.requires)
        .toEqual(['dependency']);
    });
  });

  describe('directive', () => {
    @Component()
    @View({templateUrl: '/some-template.html'})
    class TemplateUrlComponent {}

    @Component()
    @View({
      template: '<is-replaced></is-replaced>',
      replace: true,
      components: []
    })
    class ReplaceComponent {}

    @Component()
    @View({
      template: '[child]'
    })
    class ChildComponent {
      static get bindings() {
        return {
          isCompatible: 'isCompatible'
        };
      }
    }

    @Component()
    @View({
      template: `{{complex.myProperty}}<child ng-if="complex.showChild"></child>`,
      components: [ChildComponent]
    })
    class ComplexComponent {
      @Inject() $timeout;

      @Flag() fooFlag;
      @Flag('renamedFlag') barFlag;

      @Binding() fooBinding;
      @Binding('renamedBinding') barBinding;
      @Binding({attribute: 'configRenamed'}) configBinding;
      @Binding({expression: true}) expressionBinding;
      @Binding({string: true}) stringBinding;

      @Event() fooEvent;

      myProperty = 'foobar';

      activate = jasmine.createSpy('activate');
      onDestroy = jasmine.createSpy('onDestroy');
    }

    describe('View', () => {
      it('should set the components static template getter url property', () => {
        angular.module('TestTemplateUrlComponent', [TemplateUrlComponent.annotation.module.name]);
        expect(TemplateUrlComponent.template).toEqual(jasmine.objectContaining({
          url: '/some-template.html'
        }));
      });

      it('should not replace the view element by default', () => {
        const el = buildComponent(ComplexComponent)._element;
        expect(el[0].tagName.toLowerCase()).toEqual('complex');
      });

      it('should replace the view element if replace is set to true on the view', () => {
        const el = buildComponent(ReplaceComponent)._element;
        expect(el[0].tagName.toLowerCase()).toEqual('is-replaced');
      });

      it('should expose properties namespaced to the component template', () => {
        const el = buildComponent(ComplexComponent)._element;
        expect(el.text()).toEqual('foobar');
      });

      it('should support specifying child components', () => {
        const ctrl = buildComponent(ComplexComponent);
        const el = ctrl._element;

        ctrl.showChild = true;
        ctrl.rootDigest();

        expect(el.text()).toEqual('foobar[child]');
      });
    });

    describe('Lifecycle', () => {
      it('should create an instance of our class as the directives controller', () => {
        expect(buildComponent(ComplexComponent)).toEqual(jasmine.any(ComplexComponent));
      });

      it('should call the activate method', () => {
        expect(buildComponent(ComplexComponent).activate).toHaveBeenCalled();
      });

      it('should inject into the component', () => {
        expect(buildComponent(ComplexComponent).$timeout).toBeDefined();
      });

      it('should call the onDestroy method', () => {
        const ctrl = buildComponent(ComplexComponent);

        inject($rootScope => {
          $rootScope.$destroy();
          expect(ctrl.onDestroy).toHaveBeenCalled();
        });
      });
    });

    describe('Flags', () => {
      it('should set static flag and binding getter values', () => {
        expect(ComplexComponent.flags).toEqual(jasmine.objectContaining({
          fooFlag: 'fooFlag'
        }));
        expect(ComplexComponent.bindings).toEqual(jasmine.objectContaining({
          _fooFlagFlag: '@fooFlag'
        }));
      });

      it('should support manually setting the incoming attribute name', () => {
        expect(ComplexComponent.flags).toEqual(jasmine.objectContaining({
          barFlag: 'renamedFlag'
        }));
        expect(ComplexComponent.bindings).toEqual(jasmine.objectContaining({
          _barFlagFlag: '@renamedFlag'
        }));
      });

      it('should set a flag to false if its not defined', () => {
        expect(buildComponent(ComplexComponent).fooFlag).toEqual(false);
      });

      it('should set a flag to false if set to the string false', () => {
        expect(buildComponent(ComplexComponent, 'foo-flag="false"').fooFlag).toEqual(false);
      });

      it('should set a flag to true if its defined', () => {
        expect(buildComponent(ComplexComponent, 'foo-flag').fooFlag).toEqual(true);
      });

      it('should set renamed flags properly', () => {
        expect(buildComponent(ComplexComponent, 'renamed-flag').barFlag).toEqual(true);
      });

      it('should update the flag value when the binding changes', () => {
        const ctrl = buildComponent(ComplexComponent, 'foo-flag="{{flagInput}}"');

        inject($rootScope => {
          $rootScope.flagInput = false;
          $rootScope.$digest();
          expect(ctrl.fooFlag).toBe(false);

          $rootScope.flagInput = true;
          $rootScope.$digest();
          expect(ctrl.fooFlag).toBe(true);
        });
      });
    });

    describe('Events', () => {
      it('should set static event and binding getter values', () => {
        expect(ComplexComponent.events).toEqual({onFooEvent: 'fooEvent'});
        expect(ComplexComponent.bindings).toEqual(jasmine.objectContaining({
          _fooEventExpression: '&onFooEvent'
        }));
      });

      it('should create a ComponentEvent instance as the property', () => {
        expect(buildComponent(ComplexComponent).fooEvent).toEqual(jasmine.any(ComponentEvent));
      });

      it('should call the expression when the event is fired and expose locals', () => {
        const ctrl = buildComponent(ComplexComponent, 'on-foo-event="callExpression($foo)"');

        inject($rootScope => {
          $rootScope.callExpression = jasmine.createSpy('callExpression');
          ctrl.fooEvent.fire({$foo: 'foo'});
          expect($rootScope.callExpression).toHaveBeenCalledWith('foo');
        });
      });

      it('should be backwards compatible and support fireComponentEvent() as well', () => {
        const ctrl = buildComponent(ComplexComponent, 'on-foo-event="callExpression($bar)"');

        inject($rootScope => {
          $rootScope.callExpression = jasmine.createSpy('backwardsCompatibleCallExpression');
          ctrl.fireComponentEvent('fooEvent', {$bar: 'bar'});
          expect($rootScope.callExpression).toHaveBeenCalledWith('bar');
        });
      });
    });

    describe('StoreListeners', () => {
      it('should determine and set static storeListener values', () => {
        class AutoStoreListenerComponent {
          @StoreListener() onFooStoreChanged() {}
        }

        expect(AutoStoreListenerComponent.storeListeners)
        .toEqual({'fooStore:changed': 'onFooStoreChanged'});
      });

      it('should be possible to pass the listener descriptor', () => {
        class AutoStoreListenerComponent {
          @StoreListener('barStore:error') onFooStoreChanged() {}
        }

        expect(AutoStoreListenerComponent.storeListeners)
        .toEqual({'barStore:error': 'onFooStoreChanged'});
      });

      it('should throw when passsing an invalid descriptor', () => {
        expect(() => {
          /*eslint-disable no-unused-vars*/
          class AutoStoreListenerComponent {
            @StoreListener('barStoreerror') onFooStoreChanged() {}
          }
          /*eslint-enable no-unused-vars*/
        }).toThrowError(
            `An event for StoreListener should be provided in the form of 'store:event'. barStoreerror does not conform to this`);
      });

      it('should register a listener with the store', () => {
        @Component()
        class ListenerComponent {
          fooStore = {addListener: jasmine.createSpy()};
          @StoreListener() onFooStoreChanged() {}
        }
        expect(buildComponent(ListenerComponent).fooStore.addListener)
          .toHaveBeenCalledWith('changed', jasmine.any(Function));
      });

      it('should call the removal listener on onDestroy', () => {
        const removeListenerSpy = jasmine.createSpy();

        @Component()
        class DestroyListenerComponent {
          fooStore = {
            addListener: () => removeListenerSpy
          };
          @StoreListener() onFooStoreChanged() {}
        }

        buildComponent(DestroyListenerComponent);

        inject($rootScope => {
          $rootScope.$destroy();
          expect(removeListenerSpy).toHaveBeenCalled();
        });
      });
    });

    describe('Bindings', () => {
      it('should set static bindings getter values', () => {
        expect(ComplexComponent.bindings).toEqual(jasmine.objectContaining({
          fooBinding: '=fooBinding'
        }));
      });

      it('should support manually setting the incoming attribute name as a string', () => {
        expect(ComplexComponent.bindings).toEqual(jasmine.objectContaining({
          barBinding: '=renamedBinding'
        }));
      });

      it('should support manually setting the incoming attribute name in a config', () => {
        expect(ComplexComponent.bindings).toEqual(jasmine.objectContaining({
          configBinding: '=configRenamed'
        }));
      });

      it('should setting an expression binding by using the config', () => {
        expect(ComplexComponent.bindings).toEqual(jasmine.objectContaining({
          expressionBinding: '&expressionBinding'
        }));
      });

      it('should setting an string binding by using the config', () => {
        expect(ComplexComponent.bindings).toEqual(jasmine.objectContaining({
          stringBinding: '@stringBinding'
        }));
      });

      it('should have backwards compatibility for manual static bindings getter', () => {
        expect(ChildComponent.bindings).toEqual(jasmine.objectContaining({
          isCompatible: 'isCompatible'
        }));
      });

      it('should make it a two-way binding by default in backwards compatibility bindings', () => {
        const ctrl = buildComponent(ChildComponent, 'is-compatible="foo.bar"');

        inject($rootScope => {
          $rootScope.foo = {bar: 'foo'};
          $rootScope.$digest();

          expect(ctrl.isCompatible).toEqual('foo');

          ctrl.isCompatible = 'bar';
          $rootScope.$digest();

          expect($rootScope.foo.bar).toEqual('bar');
        });
      });
    });
  });
});
