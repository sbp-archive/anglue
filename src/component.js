import angular from 'angular';
import Annotation from './annotation';

export class Component extends Annotation {
    get controllerCls() {
        var annotation = this;
        var TargetCls = this.targetCls;

        class ControllerCls extends TargetCls {
            constructor($scope) {
                var injected = Array.from(arguments).slice(1);

                annotation.applyInjectionBindings(this, injected);
                annotation.applyDecorators(this);

                super(...injected);

                if (this.onDestroy instanceof Function) {
                    $scope.$on('$destroy', this.onDestroy.bind(this));
                }

                if (this.activate instanceof Function) {
                    this.activate();
                }
            }
        }

        return ControllerCls;
    }

    getInjectionTokens() {
        return [
            '$scope'
        ].concat(super.getInjectionTokens());
    }

    get dependencies() {
        var targetCls = this.targetCls;
        return [].concat(
            targetCls.dependencies || [],
            Annotation.getModuleNames(targetCls.components)
        );
    }

    get template() {
        return this.targetCls.template || null;
    }

    get bindings() {
        return this.targetCls.bindings || null;
    }

    get module() {
        if (!this._module) {
            var name = this.name;
            var template = this.template;
            var bindings = this.bindings;

            this._module = angular.module(
                'components.' + name,
                this.dependencies
            );

            var directiveConfig = {
                restrict: 'EA',
                controllerAs: name,
                bindToController: true,
                scope: true,
                controller: this.getInjectionTokens().concat([
                    this.controllerCls
                ])
            };

            if (template) {
                if (template.url) {
                    directiveConfig.templateUrl = template.url;
                } else if (template.inline) {
                    directiveConfig.template = template.inline;
                }
            }

            if (bindings) {
                let scope = directiveConfig.scope = {};
                for (let binding of Object.keys(bindings)) {
                    let attr = bindings[binding];
                    scope[binding] = `=${attr}`;
                }
            }

            this._module.directive(name, () => {
                return directiveConfig;
            });

            this.configure(this._module);
        }

        return this._module;
    }
}

export default Component;
