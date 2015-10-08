/*eslint-env node, jasmine*/
import {
  addStaticGetterObjectMember,
  addStaticGetterArrayMember,
  addStaticGetter,
  mergeStaticGetterArray,
  mergeStaticGetterObject,
  addBehavior,
  Inject,
  Decorators,
  Annotation,
  Behavior
} from 'anglue/anglue';

describe('Utils', () => {
  describe('@Inject()', () => {
    class Foo {
      @Inject() foo;
    }
    class Bar {
      @Inject('Foo') bar;
    }

    it('should use a CamelCased property name as the injection by default', () => {
      expect(Foo.injections).toEqual({foo: 'Foo'});
    });

    it('should accept a manual injection', () => {
      expect(Bar.injections).toEqual({bar: 'Foo'});
    });
  });

  describe('@Decorators()', () => {
    @Decorators(['Foo'])
    class Bar {}

    @Decorators(['Bar'])
    class Foo {
      static get decorators() {
        return ['Foo'];
      }
    }

    it('should set a static decorators getter on the class', () => {
      expect(Bar.decorators).toEqual(['Foo']);
    });

    it('should merge decorators with the existing getter', () => {
      expect(Foo.decorators).toEqual(['Foo', 'Bar']);
    });
  });

  describe('addStaticGetterObjectMember()', () => {
    it('should add a member to a static getters object', () => {
      class TestClass {}
      addStaticGetterObjectMember(TestClass, 'test', 'foo', 'bar');
      expect(TestClass.test).toEqual({foo: 'bar'});
    });

    it('should merge with current static getters object', () => {
      class TestClass {
        static get test() {
          return {foo: 'bar'};
        }
      }
      addStaticGetterObjectMember(TestClass, 'test', 'bar', 'foo');
      expect(TestClass.test).toEqual({foo: 'bar', bar: 'foo'});
    });

    it('should allow you to choose not to override existing properties', () => {
      class TestClass {
        static get test() {
          return {foo: 'bar'};
        }
      }
      addStaticGetterObjectMember(TestClass, 'test', 'foo', 'override', false);
      expect(TestClass.test).toEqual({foo: 'bar'});
    });

    it('should merge with current static property', () => {
      class TestClass {
        static test = {foo: 'bar'};
      }
      addStaticGetterObjectMember(TestClass, 'test', 'bar', 'foo');
      expect(TestClass.test).toEqual({foo: 'bar', bar: 'foo'});
    });

    it('should be possible to use a function as key', () => {
      class TestClass {}
      addStaticGetterObjectMember(TestClass, 'test', () => 'bar', 'foo');
      expect(TestClass.test).toEqual({bar: 'foo'});
    });
  });

  describe('mergeStaticGetterObject()', () => {
    it('should apply the object to a static getters object', () => {
      class TestClass {}
      mergeStaticGetterObject(TestClass, 'test', {foo: 'bar'});
      expect(TestClass.test).toEqual({foo: 'bar'});
    });

    it('should merge with current static getters object', () => {
      class TestClass {
        static get test() {
          return {foo: 'bar'};
        }
      }
      mergeStaticGetterObject(TestClass, 'test', {bar: 'foo'});
      expect(TestClass.test).toEqual({foo: 'bar', bar: 'foo'});
    });

    it('should allow you to choose not to override existing properties', () => {
      class TestClass {
        static get test() {
          return {foo: 'bar'};
        }
      }
      mergeStaticGetterObject(TestClass, 'test', {foo: 'override'}, false);
      expect(TestClass.test).toEqual({foo: 'bar'});
    });

    it('should merge with current static property', () => {
      class TestClass {
        static test = {foo: 'bar'};
      }
      mergeStaticGetterObject(TestClass, 'test', {bar: 'foo'});
      expect(TestClass.test).toEqual({foo: 'bar', bar: 'foo'});
    });
  });

  describe('addStaticGetterArrayMember()', () => {
    it('should push the value to a static getters array', () => {
      class TestClass {}
      addStaticGetterArrayMember(TestClass, 'test', 'foo');
      expect(TestClass.test).toEqual(['foo']);
    });

    it('should merge with current static getters array', () => {
      class TestClass {
        static get test() {
          return ['foo'];
        }
      }
      addStaticGetterArrayMember(TestClass, 'test', 'bar');
      expect(TestClass.test).toEqual(['foo', 'bar']);
    });

    it('should merge with current static property', () => {
      class TestClass {
        static test = ['foo'];
      }
      addStaticGetterArrayMember(TestClass, 'test', 'bar');
      expect(TestClass.test).toEqual(['foo', 'bar']);
    });
  });

  describe('mergeStaticGetterArray()', () => {
    it('should set the value to a static getters array', () => {
      class TestClass {}
      mergeStaticGetterArray(TestClass, 'test', ['foo']);
      expect(TestClass.test).toEqual(['foo']);
    });

    it('should merge with current static getters array', () => {
      class TestClass {
        static get test() {
          return ['foo'];
        }
      }
      mergeStaticGetterArray(TestClass, 'test', ['bar']);
      expect(TestClass.test).toEqual(['foo', 'bar']);
    });

    it('should ensure uniqueness', () => {
      class TestClass {
        static get test() {
          return ['foo'];
        }
      }
      mergeStaticGetterArray(TestClass, 'test', ['foo']);
      expect(TestClass.test).toEqual(['foo']);
    });

    it('should merge with current static property', () => {
      class TestClass {
        static test = ['foo'];
      }
      mergeStaticGetterArray(TestClass, 'test', ['bar']);
      expect(TestClass.test).toEqual(['foo', 'bar']);
    });
  });

  describe('addStaticGetter()', () => {
    it('should add a getter to a static object', () => {
      class TestClass {}
      addStaticGetter(TestClass, 'test', () => 'bar');
      expect(TestClass.test).toEqual('bar');
    });
  });

  describe('addBehavior()', () => {
    let cls, TestCls, BehaviorCls, methodSpy;
    beforeEach(() => {
      methodSpy = jasmine.createSpy('method');
      class BehaviorClass extends Behavior {
        bar() {
          methodSpy();
        }

        custom() {}

        stringProp = 'bar';
        boolProp = false;
        numberProp = 1;

        get getter() {
          return 'foo';
        }
      }
      class TestClass {
        custom() {
          methodSpy();
        }
      }

      TestCls = TestClass;
      BehaviorCls = BehaviorClass;

      cls = new TestClass();
    });

    it('should set an instance of the behavior as the chosen property on target class', () => {
      addBehavior(TestCls, BehaviorCls, {property: 'test'});
      expect(cls.test).toEqual(jasmine.any(BehaviorCls));
    });

    it('should set a unique behavior instance for each instance of the class', () => {
      addBehavior(TestCls, BehaviorCls, {property: 'test'});
      const anotherCls = new TestCls();
      expect(anotherCls.test).toEqual(jasmine.any(BehaviorCls));
      expect(anotherCls.test).not.toBe(cls.test);
    });

    it('should create working proxy methods on the prototype of the target cls', () => {
      addBehavior(TestCls, BehaviorCls, {property: 'foo', proxy: ['bar']});
      cls.bar();
      expect(methodSpy.calls.count()).toEqual(1);
    });

    it('should create working proxy getters on the prototype of the target cls', () => {
      addBehavior(TestCls, BehaviorCls, {property: 'foo', proxy: ['getter']});
      expect(cls.getter).toEqual('foo');
    });

    it('should create working proxy properties on the prototype of the target cls', () => {
      addBehavior(TestCls, BehaviorCls, {
        property: 'foo',
        proxy: ['stringProp', 'boolProp', 'numberProp']
      });
      expect(cls.stringProp).toEqual('bar');
      expect(cls.boolProp).toEqual(false);
      expect(cls.numberProp).toEqual(1);
    });

    it('should allow you to create an alias for a method', () => {
      addBehavior(TestCls, BehaviorCls, {property: 'foo', proxy: ['on:bar']});
      cls.on();
      expect(methodSpy.calls.count()).toEqual(1);
    });

    it('should not override existing methods on the class', () => {
      addBehavior(TestCls, BehaviorCls, {property: 'foo', proxy: ['custom']});
      cls.custom();
      expect(methodSpy).toHaveBeenCalled();
    });

    it('should store the decorated instance on the behavior instance', () => {
      addBehavior(TestCls, BehaviorCls, {property: 'foo'});
      expect(cls.foo.instance).toBe(cls);
    });
  });

  describe('Old-style class decorators', () => {
    class Bar {
      static decorate = jasmine.createSpy('decorate');
      static decorateClass = jasmine.createSpy('decorateClass');
    }

    class Foo {
      static get decorators() {
        return [Bar];
      }
    }

    const annotation = new Annotation('foo', Foo);

    it('should call the static decorateClass method on the decorator', () => {
      expect(Bar.decorateClass).toHaveBeenCalledWith(Foo);
    });

    it('should call the static decorate method passing the instance to be decorated', () => {
      const foo = new Foo();
      annotation.applyDecorators(foo);
      expect(Bar.decorate).toHaveBeenCalledWith(foo);
    });
  });
});
