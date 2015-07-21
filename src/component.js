import angular from 'angular';
import Annotation from './annotation';

export class Component extends Annotation {
    get controllerCls() {
        var annotation = this;
        var TargetCls = this.targetCls;

        class ControllerCls extends TargetCls {
            constructor($scope) {
                var injected = Array.from(arguments).slice(1);

                super(...injected);

                annotation.applyInjectionBindings(this, injected);
                annotation.applyDecorators(this);

                if (this.onDestroy instanceof Function) {
                    $scope.$on('$destroy', this.onDestroy.bind(this));
                }

                if (this.activate instanceof Function) {
                    this.activate();
                }
            }

            fireComponentEvent(event, locals) {
                if (this._event_handlers && this._event_handlers[event]) {
                    this._event_handlers[event].call(this, locals);
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

    get events() {
        return this.targetCls.events || null;
    }

    get getDirective() {
        return this.targetCls.getDirective || function(config) {
            return function() {
                return config;
            };
        };
    }

    get module() {
        if (!this._module) {
            var name = this.name;
            var template = this.template;
            var bindings = this.bindings;
            var events = this.events;

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
                if (template.replace) {
                    directiveConfig.replace = true;
                }
            }

            if (bindings) {
                let scope = directiveConfig.scope = {};
                for (let binding of Object.keys(bindings)) {
                    let attr = bindings[binding];
                    scope[binding] = `=${attr}`;
                }
            }

            if (events) {
                directiveConfig.link = (scope, el, attr, ctrl) => {
                    var eventHandlers = ctrl._event_handlers = {};
                    Object.keys(events).forEach((event) => {
                        if (attr[event]) {
                            eventHandlers[events[event]] = (locals) => {
                                scope.$parent.$eval(attr[event], locals);
                            };
                        }
                    });
                };
            }

            this._module.directive(name, this.getDirective(directiveConfig));

            this.configure(this._module);
        }

        return this._module;
    }
}

export default Component;
