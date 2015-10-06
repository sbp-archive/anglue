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
  View
} from 'anglue/anglue';

describe('Components', () => {
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
    @View({templateUrl: '/someUrl.html'})
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

    angular.module('componentApp', [
      ComplexComponent.annotation.module.name,
      TemplateUrlComponent.annotation.module.name,
      ReplaceComponent.annotation.module.name
    ]);

    let $compile, $rootScope, $timeout;
    beforeEach(module('componentApp'));
    beforeEach(inject((_$compile_, _$rootScope_, _$timeout_) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    }));

    describe('View', () => {
      it('should set the components static template getter url property', () => {
        expect(TemplateUrlComponent.template).toEqual(jasmine.objectContaining({
          url: '/someUrl.html'
        }));
      });

      it('should not replace the view element by default', () => {
        const el = compileTemplate('<complex></complex>', $compile, $rootScope);
        expect(el[0].tagName.toLowerCase()).toEqual('complex');
      });

      it('should replace the view element if replace is set to true on the view', () => {
        const el = compileTemplate('<replace></replace>', $compile, $rootScope);
        expect(el[0].tagName.toLowerCase()).toEqual('is-replaced');
      });

      it('should expose properties namespaced to the component template', () => {
        const el = compileTemplate('<complex></complex>', $compile, $rootScope);
        expect(el.text()).toEqual('foobar');
      });

      it('should support specifying child components', () => {
        const el = compileTemplate('<complex></complex>', $compile, $rootScope);
        const ctrl = el.controller('complex');

        ctrl.showChild = true;
        $rootScope.$digest();

        expect(el.text()).toEqual('foobar[child]');
      });
    });

    describe('Lifecycle', () => {
      it('should create an instance of our class as the directives controller', () => {
        expect(compileTemplate('<complex></complex>', $compile, $rootScope)
          .controller('complex'))
          .toEqual(jasmine.any(ComplexComponent));
      });

      it('should call the activate method', () => {
        expect(compileTemplate('<complex></complex>', $compile, $rootScope)
          .controller('complex').activate)
          .toHaveBeenCalled();
      });

      it('should inject into the component', () => {
        expect(compileTemplate('<complex></complex>', $compile, $rootScope)
          .controller('complex').$timeout)
          .toBe($timeout);
      });

      it('should call the onDestroy method', () => {
        const el = compileTemplate('<complex></complex>', $compile, $rootScope);
        $rootScope.$destroy();
        expect(el.controller('complex').onDestroy).toHaveBeenCalled();
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
        expect(compileTemplate('<complex></complex>', $compile, $rootScope)
          .controller('complex').fooFlag)
          .toEqual(false);
      });

      it('should set a flag to false if set to the string false', () => {
        expect(compileTemplate('<complex foo-flag="false"></complex>', $compile, $rootScope)
          .controller('complex').fooFlag)
          .toEqual(false);
      });

      it('should set a flag to true if its defined', () => {
        expect(compileTemplate('<complex foo-flag></complex>', $compile, $rootScope)
          .controller('complex').fooFlag)
          .toEqual(true);
      });

      it('should set renamed flags properly', () => {
        expect(compileTemplate('<complex renamed-flag></complex>', $compile, $rootScope)
          .controller('complex').barFlag)
          .toEqual(true);
      });

      it('should update the flag value when the binding changes', () => {
        const el = compileTemplate('<complex foo-flag="{{flagInput}}"></complex>', $compile, $rootScope);
        const ctrl = el.controller('complex');

        $rootScope.flagInput = false;
        $rootScope.$digest();
        expect(ctrl.fooFlag).toBe(false);

        $rootScope.flagInput = true;
        $rootScope.$digest();
        expect(ctrl.fooFlag).toBe(true);
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
        expect(compileTemplate('<complex></complex>', $compile, $rootScope)
          .controller('complex').fooEvent)
          .toEqual(jasmine.any(ComponentEvent));
      });

      it('should call the expression when the event is fired and expose locals', () => {
        const el = compileTemplate('<complex on-foo-event="callExpression($foo)"></complex>',
          $compile, $rootScope);

        $rootScope.callExpression = jasmine.createSpy('callExpression');
        el.controller('complex').fooEvent.fire({$foo: 'foo'});
        expect($rootScope.callExpression).toHaveBeenCalledWith('foo');
      });

      it('should be backwards compatible and support fireComponentEvent() as well', () => {
        const el = compileTemplate('<complex on-foo-event="callExpression($bar)"></complex>',
          $compile, $rootScope);

        $rootScope.callExpression = jasmine.createSpy('backwardsCompatibleCallExpression');
        el.controller('complex').fireComponentEvent('fooEvent', {$bar: 'bar'});
        expect($rootScope.callExpression).toHaveBeenCalledWith('bar');
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
        const el = compileTemplate('<child is-compatible="foo.bar"></child>',
          $compile, $rootScope);
        const ctrl = el.controller('child');

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


function compileTemplate(template, $compile, $rootScope) {
  const el = angular.element(template.trim());
  $compile(el)($rootScope.$new());
  $rootScope.$digest();
  return el;
}
