import angular from 'angular';

import {Annotation} from './annotation';
import {Annotations} from './annotations';

import {
  mergeStaticGetterObject,
  mergeStaticGetterArray,
  addStaticGetter
} from './utils';

export class ApplicationAnnotation extends Annotation {
  get dependencies() {
    const targetCls = this.targetCls;
    const extraDependencies = ['luxyflux'];
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
      const controllerDependencies = annotationNames.concat([() => {}]);

      this._module = angular.module(
        this.name,
        this.dependencies
      ).run(controllerDependencies);

      this.configure(this._module);
    }

    return this._module;
  }

  configure(angularModule) {
    const routes = this.targetCls.routes;

    // The ApplicationDispatcher is the (singleton) dispatcher instance used
    // in our entire application. Every ActionCreator in this app dispatches
    // through this instance and all app stores are registered to it
    angularModule.service('ApplicationDispatcher', [
      'LuxyFluxDispatcher',
      function(Dispatcher) {
        return new Dispatcher('ApplicationDispatcher');
      }
    ]);

    if (routes) {
      angularModule.config([
        '$stateProvider',
        '$urlRouterProvider',
        function routerConfig($stateProvider, $urlRouterProvider) {
          if (routes.defaultRoute) {
            $urlRouterProvider.otherwise(routes.defaultRoute);
            Reflect.deleteProperty(routes, 'defaultRoute');
          }

          if (routes.redirects) {
            Object.keys(routes.redirects).forEach(fromRoute => {
              $urlRouterProvider.when(fromRoute, routes.redirects[fromRoute]);
            });
            Reflect.deleteProperty(routes, 'redirects');
          }

          Object.keys(routes).forEach(name => {
            $stateProvider.state(name, routes[name]);
          });
        }
      ]);
    }
  }
}

export default ApplicationAnnotation;

export function Application(config) {
  return cls => {
    let applicationName;
    const isConfigObject = angular.isObject(config);

    if (isConfigObject && config.name) {
      applicationName = config.name;
    } else if (angular.isString(config)) {
      applicationName = config;
    } else {
      const clsName = cls.name.replace(/application$/i, '');
      applicationName = `${clsName[0].toLowerCase()}${clsName.slice(1)}`;
    }

    if (isConfigObject) {
      if (config.routes) {
        mergeStaticGetterObject(cls, 'routes', config.routes);
      }
      if (config.dependencies) {
        mergeStaticGetterArray(cls, 'dependencies', config.dependencies);
      }
      if (config.components) {
        mergeStaticGetterArray(cls, 'components', config.components);
      }
      if (config.stores) {
        mergeStaticGetterArray(cls, 'stores', config.stores);
      }
      if (config.actions) {
        mergeStaticGetterArray(cls, 'actions', config.actions);
      }
    }

    addStaticGetter(cls, 'annotation', () => Annotations.getApplication(applicationName, cls));
  };
}
