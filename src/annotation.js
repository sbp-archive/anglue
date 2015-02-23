export class Annotation {
    constructor(name, targetCls) {
        this.name = name;
        this.targetCls = targetCls;

        // We allow the decorators to decorate the targetCls
        // before we create and configure the module
        this.applyClassDecorators(targetCls);
    }

    getInjectionTokens() {
        var tokens = [];
        var injections = this.injections;
        Object.keys(injections).forEach((binding) => {
            tokens.push(injections[binding]);
        });
        return tokens;
    }

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
     * This method can be overriden by child classes to
     * configure the angular module after it is created
     * @param {module} module The created angular module
     */
    configure() {}

    /**
     * This method applies all the requested injection bindings
     * from the targetCls to the created instance
     * @param  {TargetCls} instance The created instance that
     * wants the bindings
     * @param  {Array<Binding>} injected An array with the injected
     * instances that we will apply on the class instance
     */
    applyInjectionBindings(instance, injected) {
        var injections = this.injections;

        Object.keys(injections).forEach((binding, index) => {
            Object.defineProperty(instance, binding, {
                value: injected[index]
            });
        });

        Object.defineProperty(instance, '_annotation', {
            value: this
        });
    }

    /**
     * This method decorates the created instance with all the
     * targetCls decorators
     * @param  {Instance} instance The created instance to be decorated
     */
    applyDecorators(instance) {
        var decorators = this.decorators;
        for (let decorator of decorators) {
            if (decorator.decorate instanceof Function) {
                decorator.decorate(instance);
            }
        }
    }

    /**
     * This method decorates the class with all the targetCls decorators
     * @param  {Class} instance The targetCls to be decorated
     */
    applyClassDecorators(targetCls) {
        var decorators = this.decorators;
        for (let decorator of decorators) {
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
    getModuleNames(classes = []) {
        var names = [];
        for (let cls of classes) {
            let annotation = cls.annotation;
            if (annotation) {
                names.push(annotation.module.name);
            }
        }
        return names;
    }
}
export default Annotation;
