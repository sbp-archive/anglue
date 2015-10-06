import angular from 'angular';

import {Annotation} from './annotation';
import {Annotations} from './annotations';
import {EventEmitter as eventEmitterDecorator} from './behaviors/event-emitter';

import {addStaticGetterObjectMember, addStaticGetter} from './utils';

export class StoreAnnotation extends Annotation {
  get serviceName() {
    const name = this.name;
    return `${name[0].toUpperCase()}${name.slice(1)}Store`;
  }

  getInjectionTokens() {
    return [
      'LuxyFlux',
      'LuxyFluxStore',
      'ApplicationDispatcher'
    ].concat(super.getInjectionTokens());
  }

  get factoryFn() {
    const TargetCls = this.targetCls;
    const annotation = this;

    return function(LuxyFlux, LuxyFluxStore, ApplicationDispatcher) {
      const injected = Array.from(arguments).slice(3);
      const instance = new TargetCls(...injected);

      annotation.applyInjectionBindings(instance, injected);
      annotation.applyDecorators(instance);

      return LuxyFlux.createStore({
        name: `store.${annotation.name}`,
        dispatcher: ApplicationDispatcher,
        handlers: TargetCls.handlers,
        decorate: instance
      }, LuxyFluxStore);
    };
  }

  get module() {
    if (!this._module) {
      this._module = angular.module(
        `stores.${this.name}`,
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

export function Store(config) {
  return cls => {
    // Decorate a store with the EventEmitterBehavior
    eventEmitterDecorator()(cls);

    let storeName;
    const isConfigObject = angular.isObject(config);

    if (isConfigObject && config.name) {
      storeName = config.name;
    } else if (angular.isString(config)) {
      storeName = config;
    } else {
      const clsName = cls.name.replace(/store$/i, '');
      storeName = `${clsName[0].toLowerCase()}${clsName.slice(1)}`;
    }

    addStaticGetter(cls, 'annotation', () => Annotations.getStore(storeName, cls));
  };
}

export function Handlers(handlers) {
  return cls => {
    Object.keys(handlers).forEach(actionName => {
      const handlerName = handlers[actionName];
      addStaticGetterObjectMember(cls, 'handlers', actionName, handlerName);
    });
  };
}

export function Handler(actionName) {
  return (cls, handlerName) => {
    let action = actionName;
    if (!action) {
      action = handlerName
        .replace(/^on([A-Z])/, (match, first) => first.toLowerCase())
        .replace(/([A-Z])/g, '_$1').toUpperCase();
    }
    addStaticGetterObjectMember(cls.constructor, 'handlers', action, handlerName);
  };
}

export default StoreAnnotation;
