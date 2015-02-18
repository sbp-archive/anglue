import Annotation from './annotation';

class Component extends Annotation {
    get module() {
        if (!this._module) {
            var name = this.name;
            var injections = this.injections;
            var decorators = this.decorators;
            var controllerArray = [];
            var ComponentCls = this.targetCls;
            var componentAnnotation = this;

            Object.keys(injections).forEach((binding) => {
                controllerArray.push(injections[binding]);
            });

            class ControllerCls extends ComponentCls {
                constructor() {
                    var injected = Array.from(arguments);
                    Object.keys(injections).forEach((binding, index) => {
                        Object.defineProperty(
                            this,
                            binding,
                            {value: injected[index]}
                        );
                    });
                    Object.defineProperty(
                        this,
                        '_componentAnnotation',
                        {value: componentAnnotation}
                    );

                    for (let decorator of decorators) {
                        decorator.decorate(this);
                    }

                    super(...arguments);

                    if (this.activate instanceof Function) {
                        this.activate();
                    }
                }
            };
            controllerArray.push(ControllerCls);

            this._module = angular.module(
                'components.' + name,
                this.dependencies
            );
            this._module.directive(name, () => {
                return {
                    restrict: 'E',
                    controllerAs: name,
                    bindToController: true,
                    controller: controllerArray
                }
            });
        }

        return this._module;
    }
}
export default Component;
