import Annotation from './annotation';

class Actions extends Annotation {
    get module() {
        if (!this._module) {
            var name = this.name;
            var injections = this.injections;
            var decorators = this.decorators;
            var factoryArray = ['LuxaFlux', 'ApplicationDispatcher'];
            var ActionsCls = this.targetCls;
            var actionsAnnotation = this;
            var factoryName = name[0].toUpperCase() + name.slice(1) + 'Actions';

            Object.keys(injections).forEach((binding) => {
                factoryArray.push(injections[binding]);
            });

            var factoryFn = function() {
                var actions = new ActionsCls();
                var args = Array.from(arguments);
                var injected = args.slice(2);
                Object.keys(injections).forEach((binding, index) => {
                    Object.defineProperty(
                        actions,
                        binding,
                        {value: injected[index]}
                    );
                });
                Object.defineProperty(
                    actions,
                    '_actionsAnnotation',
                    {value: actionsAnnotation}
                );

                for (let decorator of decorators) {
                    decorator.decorate(this);
                }

                var LuxaFlux = args[0];
                var ApplicationDispatcher = args[1];

                return LuxaFlux.createActions({
                    dispatcher: ApplicationDispatcher,
                    serviceActions: ActionsCls.serviceActions,
                    decorate: actions
                });
            };
            factoryArray.push(factoryFn);

            this._module = angular.module(
                'actions.' + name,
                this.dependencies
            );
            this._module.factory(factoryName, factoryArray);
        }
        return this._module;
    }
}
export default Actions;
