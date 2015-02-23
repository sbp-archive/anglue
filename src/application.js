import angular from 'angular';
import Annotation from './annotation';

export class Application extends Annotation {
    get dependencies() {
        var targetCls = this.targetCls;
        return [
            'ui.router',
            'luxyflux'
        ].concat(
            targetCls.dependencies || [],
            this.getModuleNames(targetCls.components),
            this.getModuleNames(targetCls.stores),
            this.getModuleNames(targetCls.actions)
        );
    }

    get module() {
        if (!this._module) {
            this._module = angular.module(
                this.name,
                this.dependencies
            );

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
