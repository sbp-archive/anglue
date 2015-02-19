import angular from 'angular';
import Annotation from './annotation';

export class Actions extends Annotation {
    get serviceName() {
        var name = this.name;
        return name[0].toUpperCase() + name.slice(1) + 'Actions';
    }

    getInjectionTokens() {
        return [
            'LuxyFlux',
            'ApplicationDispatcher'
        ].concat(super.getInjectionTokens());
    }

    get factoryFn() {
        var TargetCls = this.targetCls;
        var annotation = this;

        return function(LuxyFlux, ApplicationDispatcher) {
            var injected = Array.from(arguments).slice(2);
            var instance = new TargetCls(...injected);

            annotation.applyInjectionBindings(instance, injected);
            annotation.applyDecorators(instance);

            return LuxyFlux.createActions({
                dispatcher: ApplicationDispatcher,
                serviceActions: TargetCls.serviceActions,
                decorate: instance
            });
        };
    }

    get module() {
        if (!this._module) {
            this._module = angular.module(
                'actions.' + this.name,
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
export default Actions;
