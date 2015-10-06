export class Annotation {
  constructor(name, targetCls) {
    this.name = name;
    this.targetCls = targetCls;

    // We allow the decorators to decorate the targetCls
    // before we create and configure the module
    this.applyClassDecorators(targetCls);
  }

  getInjectionTokens() {
    const tokens = [];
    const injections = this.injections;
    Object.keys(injections).forEach(binding => {
      tokens.push(injections[binding]);
    });
    return tokens;
  }

  //noinspection InfiniteRecursionJS
  get injections() {
    return this.targetCls.injections || {};
  }

  get decorators() {
    return this.targetCls.decorators || [];
  }

  get dependencies() {
    return this.targetCls.dependencies || [];
  }

  /**
   * This method can be overridden by child classes to
   * configure the angular module after it is created
   * @param {module} module The created angular module
   * @returns {undefined}
   */
  configure(/*module*/) {}

  /**
   * This method applies all the requested injection bindings
   * from the targetCls to the created instance
   * @param  {Object} instance The created instance that
   * wants the bindings
   * @param  {Array} injected An array with the injected
   * instances that we will apply on the class instance
   * @returns {undefined}
   */
  applyInjectionBindings(instance, injected) {
    const injections = this.injections;

    Object.keys(injections).forEach((binding, index) => {
      Reflect.defineProperty(instance, binding, {value: injected[index]});
    });

    Reflect.defineProperty(instance, '_annotation', {value: this});
  }

  /**
   * This method decorates the created instance with all the
   * targetCls decorators
   * @deprecated
   * @param  {Object} instance The created instance to be decorated
   * @returns {undefined}
   */
  applyDecorators(instance) {
    const decorators = this.decorators;

    for (const decorator of decorators) {
      if (decorator.decorate instanceof Function) {
        decorator.decorate(instance);
      }
    }
  }

  /**
   * This method decorates the class with all the targetCls decorators
   * @deprecated
   * @param  {Object} targetCls The targetCls to be decorated
   * @returns {undefined}
   */
  applyClassDecorators(targetCls) {
    const decorators = this.decorators;

    for (const decorator of decorators) {
      if (decorator.decorateClass instanceof Function) {
        decorator.decorateClass(targetCls);
      }
    }
  }

  /**
   * Returns all the angular module names for an array of classes
   * @param  {Array} classes An array of classes you want to module names for
   * @return {Array} The name of the angular modules for these classes
   */
  static getModuleNames(classes = []) {
    const names = [];

    for (const cls of classes) {
      const annotation = cls.annotation;
      if (annotation) {
        names.push(annotation.module.name);
      }
    }

    return names;
  }

  static getAnnotationServiceNames(classes = []) {
    const names = [];

    for (const cls of classes) {
      const annotation = cls.annotation;
      if (annotation) {
        names.push(annotation.serviceName);
      }
    }

    return names;
  }
}
export default Annotation;
