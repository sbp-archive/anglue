import angular from 'angular';
import Annotation from './annotation';

export class Store extends Annotation {
    get serviceName() {
        var name = this.name;
        return name[0].toUpperCase() + name.slice(1) + 'Store';
    }

    getInjectionTokens() {
        return [
            'LuxyFlux',
            'LuxyFluxStore',
            'ApplicationDispatcher'
        ].concat(super.getInjectionTokens());
    }

    get factoryFn() {
        var TargetCls = this.targetCls;
        var annotation = this;

        return function(LuxyFlux, LuxyFluxStore, ApplicationDispatcher) {
            var injected = Array.from(arguments).slice(3);
            var instance = new TargetCls(...injected);

            annotation.applyInjectionBindings(instance, injected);
            annotation.applyDecorators(instance);

            return LuxyFlux.createStore({
                name: 'store.' + annotation.name,
                dispatcher: ApplicationDispatcher,
                handlers: TargetCls.handlers,
                decorate: instance
            }, LuxyFluxStore);
        };
    }

    get module() {
        if (!this._module) {
            this._module = angular.module(
                'stores.' + this.name,
                this.dependencies
            );

            this._module.factory(
                this.serviceName,
                this.getInjectionTokens().concat([this.factoryFn])
            );

            this.configure(this._module);
        }
        return this._module;
    }
}

export default Store;
