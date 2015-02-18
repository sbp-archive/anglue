import Annotation from './annotation';

export class Store extends Annotation {
    get module() {
        if (!this._module) {
            var name = this.name;
            var injections = this.injections;
            var decorators = this.decorators;
            var factoryArray = ['LuxaFlux', 'ApplicationDispatcher'];
            var StoreCls = this.targetCls;
            var storeAnnotation = this;
            var factoryName = name[0].toUpperCase() + name.slice(1) + 'Store';

            Object.keys(injections).forEach((binding) => {
                factoryArray.push(injections[binding]);
            });

            var factoryFn = function() {
                var store = new StoreCls();
                var args = Array.from(arguments);
                var injected = args.slice(2);
                Object.keys(injections).forEach((binding, index) => {
                    Object.defineProperty(
                        store,
                        binding,
                        {value: injected[index]}
                    );
                });
                Object.defineProperty(
                    store,
                    '_storeAnnotation',
                    {value: storeAnnotation}
                );

                for (let decorator of decorators) {
                    decorator.decorate(this);
                }

                var LuxaFlux = args[0];
                var ApplicationDispatcher = args[1];

                return LuxaFlux.createStore({
                    name: 'store.' + name,
                    dispatcher: ApplicationDispatcher,
                    handlers: StoreCls.handlers,
                    decorate: store
                });
            };
            factoryArray.push(factoryFn);

            this._module = angular.module(
                'stores.' + name,
                this.dependencies
            );
            this._module.factory(factoryName, factoryArray);
        }
        return this._module;
    }
}

export default Store;
