import angular from 'angular';

import {Annotation} from './annotation';
import {Annotations} from './annotations';

import {addStaticGetterObjectMember, addStaticGetter} from './utils';


export class ActionsAnnotation extends Annotation {
  get serviceName() {
    let name = this.name;
    return name[0].toUpperCase() + name.slice(1) + 'Actions';
  }

  getInjectionTokens() {
    return [
      'LuxyFlux',
      'LuxyFluxActionCreators',
      'ApplicationDispatcher'
    ].concat(super.getInjectionTokens());
  }

  get factoryFn() {
    let TargetCls = this.targetCls;
    let annotation = this;

    return function(LuxyFlux, LuxyFluxActionCreators, ApplicationDispatcher) {
      let injected = Array.from(arguments).slice(3);
      let instance = new TargetCls(...injected);

      annotation.applyInjectionBindings(instance, injected);
      annotation.applyDecorators(instance);

      return LuxyFlux.createActions({
        dispatcher: ApplicationDispatcher,
        serviceActions: TargetCls.serviceActions,
        decorate: instance
      }, LuxyFluxActionCreators);
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

// Decorators
export function Actions(config) {
  return (cls) => {
    let actionsName;
    let isConfigObject = angular.isObject(config);

    if (isConfigObject && config.name) {
      actionsName = config.name;
    } else if (angular.isString(config)) {
      actionsName = config;
    } else {
      let clsName = cls.name.replace(/actions$/i, '');
      actionsName = `${clsName[0].toLowerCase()}${clsName.slice(1)}`;
    }

    let namespace = isConfigObject && config.namespace !== undefined
      ? config.namespace
      : actionsName;

    cls.actionNamespace = angular.isString(namespace) && namespace.length
      ? namespace
        .replace(/([A-Z])/g, '_$1')
        .toUpperCase()
      : null;

    addStaticGetter(cls, 'annotation', () => Annotations.getActions(actionsName, cls));
  };
}

export function AsyncAction(actionName) {
  return (cls, methodName) => {
    addStaticGetterObjectMember(cls.constructor, 'serviceActions',
      () => prepareActionName(cls, actionName, methodName), methodName);
  };
}

export function Action(actionName) {
  return (cls, methodName, descriptor) => {
    let originalMethod = descriptor.value;
    descriptor.value = function(...payload) {
      let action = prepareActionName(cls, actionName, methodName);
      let originalReturn = originalMethod.apply(this, payload);
      let dispatchPromise = this.dispatch(action, ...payload);
      return angular.isDefined(originalReturn) ? originalReturn : dispatchPromise;
    };
  };
}

export default ActionsAnnotation;

function prepareActionName(cls, actionName, methodName) {
  let preparedActionName = actionName;
  if (!preparedActionName) {
    preparedActionName = methodName.replace(/([A-Z])/g, '_$1');
  }
  let actionNamespace = cls.constructor.actionNamespace;
  if (actionNamespace) {
    preparedActionName = `${actionNamespace}_${preparedActionName}`;
  }
  return preparedActionName.toUpperCase();
}
