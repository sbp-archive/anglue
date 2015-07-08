import angular from 'angular';
import Annotation from './annotation';

export class Application extends Annotation {
    get dependencies() {
        var targetCls = this.targetCls;
        var extraDependencies = ['luxyflux'];
        if (targetCls.routes) {
            extraDependencies.push('ui.router');
        }
        return extraDependencies.concat(
            targetCls.dependencies || [],
            Annotation.getModuleNames(targetCls.components),
            Annotation.getModuleNames(targetCls.stores),
            Annotation.getModuleNames(targetCls.actions)
        );
    }

    get module() {
        if (!this._module) {
            const annotationNames = Annotation.getAnnotationServiceNames(this.targetCls.stores);
            const controllerDeps = annotationNames.concat([() => {}]);

            this._module = angular.module(
                this.name,
                this.dependencies
            ).controller('__AnglueApp__', controllerDeps);

            this.configure(this._module);
        }

        return this._module;
    }

    configure(angularModule) {
        // The ApplicationDispatcher is the (singleton) dispatcher instance used
        // in our entire application. Every ActionCreator in this app dispatches
        // through this instance and all app stores are registered to it
        angularModule.service('ApplicationDispatcher', [
            'LuxyFluxDispatcher',
            function(Dispatcher) {
                return new Dispatcher('ApplicationDispatcher');
            }
        ]);

        var routes = this.targetCls.routes;
        if (routes) {
            angularModule.config([
                '$stateProvider',
                '$urlRouterProvider',
                function routerConfig($stateProvider, $urlRouterProvider) {
                    if (routes.defaultRoute) {
                        $urlRouterProvider.otherwise(routes.defaultRoute);
                        delete routes.defaultRoute;
                    }

                    Object.keys(routes).forEach((name) => {
                        $stateProvider.state(name, routes[name]);
                    });
                }
            ]);
        }
    }
}
export default Application;
