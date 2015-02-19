import angular from 'angular';
import Annotation from './annotation';

export class Component extends Annotation {
    get controllerCls() {
        var annotation = this;

        return class controllerCls extends this.targetCls {
            constructor() {
                var injected = Array.from(arguments);

                annotation.applyInjectionBindings(this, injected);
                annotation.applyDecorators(this);

                super(...injected);

                if (this.activate instanceof Function) {
                    this.activate();
                }
            }
        };
    }

    get dependencies() {
        var targetCls = this.targetCls;
        return targetCls.dependencies.concat(
            this.getModuleNames(targetCls.components)
        );
    }

    get module() {
        if (!this._module) {
            var name = this.name;

            this._module = angular.module(
                'components.' + name,
                this.dependencies
            );

            this._module.directive(name, () => {
                return {
                    restrict: 'E',
                    controllerAs: name,
                    bindToController: true,
                    controller: this.getInjectionTokens().concat([
                        this.controllerCls
                    ])
                };
            });

            this.configure(this._module);
        }

        return this._module;
    }
}

export default Component;
