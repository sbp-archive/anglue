import angular from 'angular';
import Annotation from './annotation';

export class Component extends Annotation {
    get controllerCls() {
        var annotation = this;
        var TargetCls = this.targetCls;

        class ControllerCls extends TargetCls {
            constructor($scope, LuxyFlux, LuxyFluxStore, ApplicationDispatcher) {
                var injected = Array.from(arguments).slice(4);
                var componentStores = annotation.componentStores;

                super(...injected);

                Object.keys(componentStores).forEach((injectionName) => {
                    this[injectionName] = new componentStores[injectionName]();
                });

                annotation.applyInjectionBindings(this, injected);
                annotation.applyDecorators(this);

                $scope.$on('$destroy', () => {
                    if (this.onDestroy instanceof Function) {
                        this.onDestroy.call(this);
                    }

                    Object.keys(componentStores).forEach((injectionName) => {
                        this[injectionName].dispatcher = null;
                        this[injectionName] = null;
                    });
                });


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
            '$scope',
            'LuxyFlux',
            'LuxyFluxStore',
            'ApplicationDispatcher'
        ].concat(super.getInjectionTokens());
    }

    getComponentStoreClasses() {
        var componentStores = this.componentStores;
        var classes = [];

        Object.keys(componentStores).forEach((injectionName) => {
            let storeClass = componentStores[injectionName];
            if (classes.indexOf(storeClass) === -1) {
                classes.push(storeClass);
            }
        });
        return classes;
    }

    get dependencies() {
        var targetCls = this.targetCls;
        return [].concat(
            targetCls.dependencies || [],
            Annotation.getModuleNames(targetCls.components),
            Annotation.getModuleNames(this.getComponentStoreClasses())
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

    get componentStores() {
        return this.targetCls.componentStores || {};
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

            this._module.directive(name, () => {
                return directiveConfig;
            });

            this.configure(this._module);
        }

        return this._module;
    }
}

export default Component;
