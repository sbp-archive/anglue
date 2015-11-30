import angular from 'angular';

import {Annotation} from './annotation';
import {Annotations} from './annotations';

import {addStaticGetterObjectMember, addStaticGetter} from './utils';

export const COMPONENT_ENTITY_REGEX = /^([A-Z][a-z]*)/;

export class ComponentEvent {
  expression = null;
  fire(locals) {
    if (this.expression) {
      this.expression(locals);
    }
  }
}

export class ComponentAnnotation extends Annotation {
  get controllerCls() {
    const annotation = this;
    const TargetCls = this.targetCls;
    const storeListeners = this.storeListeners;

    class ControllerCls extends TargetCls {
      constructor($scope, $log) {
        const injected = Array.from(arguments).slice(2);

        super(...injected);

        annotation.applyInjectionBindings(this, injected);
        annotation.applyFlags(this);
        annotation.applyBehaviors(this);
        annotation.applyDecorators(this);
        annotation.applyStoreListeners(this);

        if (storeListeners || this.onDestroy instanceof Function) {
          $scope.$on('$destroy', () => {
            if (this._storeListeners) {
              this._storeListeners.forEach(listener => listener());
            }
            if (this.onDestroy instanceof Function) {
              this.onDestroy();
            }
          });
        }

        this.fireComponentEvent = (event, locals) => {
          $log.warn(`
            Component.fireComponentEvent() has been deprecated in Anglue 1.x.
            Please use @Event() myEvent; in combination with this.myEvent.fire().
          `);
          if (this._eventHandlers && this._eventHandlers[event]) {
            Reflect.apply(this._eventHandlers[event], this, [locals]);
          }
        };
      }
    }

    return ControllerCls;
  }

  applyFlags(instance) {
    const flags = this.flags;
    if (flags) {
      Object.keys(flags).forEach(flag => {
        const property = `_${flag}Flag`;
        Reflect.defineProperty(instance, flag, {
          get() {
            return angular.isDefined(this[property]) ? this[property] !== 'false' : false;
          }
        });
      });
    }
  }

  applyStoreListeners(instance) {
    const storeListeners = this.storeListeners;
    if (storeListeners) {
      instance._storeListeners = instance._storeListeners || [];

      Object.keys(storeListeners).forEach(listener => {
        const handler = storeListeners[listener];
        const parts = listener.split(':');
        const store = parts[0];
        const event = parts[1];

        instance._storeListeners.push(
          instance[store].addListener(event, instance[handler].bind(instance)));
      });
    }
  }

  getInjectionTokens() {
    return ['$scope', '$log'].concat(super.getInjectionTokens());
  }

  get dependencies() {
    const targetCls = this.targetCls;
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

  get storeListeners() {
    return this.targetCls.storeListeners || null;
  }

  get flags() {
    return this.targetCls.flags || null;
  }

  //noinspection InfiniteRecursionJS
  get getDirective() {
    return this.targetCls.getDirective || function(config) {
      return function() {
        return config;
      };
    };
  }

  registerEvents(events, scope, attr, ctrl) {
    if (events) {
      const eventHandlers = ctrl._eventHandlers = {};
      Object.keys(events).forEach(event => {
        if (attr[event]) {
          eventHandlers[events[event]] = locals => {
            scope.$parent.$eval(attr[event], locals);
          };
          const componentEventName = events[event];
          if (ctrl[componentEventName] instanceof ComponentEvent) {
            ctrl[componentEventName].expression = ctrl[`_${componentEventName}Expression`];
          }
        }
      });
    }
  }

  get directiveConfig() {
    const name = this.name;
    const template = this.template;
    const bindings = this.bindings;
    const events = this.events;

    let preLink = () => {};
    const postLink = (scope, el, attr, ctrl) => {
      if (ctrl.activate instanceof Function) {
        ctrl.activate();
      }
    };

    const directiveConfig = {
      restrict: 'EA',
      controllerAs: name,
      bindToController: true,
      scope: true,
      controller: this.getInjectionTokens().concat([this.controllerCls])
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
      const scope = directiveConfig.scope = {};
      for (const binding of Object.keys(bindings)) {
        let attr = bindings[binding];
        if (!attr[0].match(/(&|=|@)/)) {
          attr = `=${attr}`;
        }
        scope[binding] = attr;
      }
    }

    if (events) {
      preLink = (scope, el, attr, ctrl) => {
        this.registerEvents(events, scope, attr, ctrl);
      };
    }

    directiveConfig.compile = () => {
      return {
        pre: preLink,
        post: postLink
      };
    };

    return directiveConfig;
  }

  get module() {
    if (!this._module) {
      const name = this.name;

      this._module = angular.module(
        `components.${name}`,
        this.dependencies
      );

      const directiveConfig = this.directiveConfig;

      this._module.directive(name, this.getDirective(directiveConfig));

      this.configure(this._module);
    }

    return this._module;
  }
}

export default ComponentAnnotation;

export function Component(config) {
  return cls => {
    let componentName;
    const isConfigObject = angular.isObject(config);

    if (isConfigObject && config.name) {
      componentName = config.name;
    } else if (angular.isString(config)) {
      componentName = config;
    } else {
      const clsName = cls.name.replace(/component$/i, '');
      componentName = `${clsName[0].toLowerCase()}${clsName.slice(1)}`;
    }

    if (isConfigObject) {
      if (config.dependencies) {
        addStaticGetter(cls, 'dependencies', () => config.dependencies);
      }

      new View(config)(cls);
    }

    addStaticGetter(cls, 'annotation', () => Annotations.getComponent(componentName, cls));
  };
}

export function View(config = {}) {
  return cls => {
    if (config.template) {
      addStaticGetter(cls, 'template', () => ({
        inline: config.template,
        replace: config.replace || false
      }));
    } else if (config.templateUrl) {
      addStaticGetter(cls, 'template', () => ({
        url: config.templateUrl,
        replace: config.replace || false
      }));
    }
    if (config.components) {
      addStaticGetter(cls, 'components', () => config.components);
    }
  };
}

export function Binding(config) {
  return (cls, propertyName, descriptor) => {
    const isConfigObject = angular.isObject(config);
    let attribute = propertyName;

    if (isConfigObject && config.attribute) {
      attribute = config.attribute;
    } else if (angular.isString(config)) {
      attribute = config;
    }

    if (isConfigObject && config.expression === true) {
      attribute = `&${attribute}`;
    } else if (isConfigObject && config.string === true) {
      attribute = `@${attribute}`;
    } else {
      attribute = `=${attribute}`;
    }

    // For some reason these property initializers are called after
    // the bindings have already been set by angular. This causes
    // them to be set back to undefined again. Thus this override
    // to make sure we just return whatever the value was already.
    if (descriptor.initializer !== undefined) {
      descriptor.initializer = function() {
        return this[propertyName];
      };
    }

    addStaticGetterObjectMember(cls.constructor, 'bindings', propertyName, attribute);
  };
}

export function Flag(config) {
  return (cls, propertyName) => {
    const attribute = config || propertyName;
    addStaticGetterObjectMember(cls.constructor, 'flags', propertyName, attribute);

    const propertyBinding = `_${propertyName}Flag`;
    const attributeBinding = `@${attribute}`;
    addStaticGetterObjectMember(cls.constructor, 'bindings', propertyBinding, attributeBinding);
  };
}

export function Event() {
  return (cls, propertyName, descriptor) => {
    const attribute = `on${propertyName[0].toUpperCase()}${propertyName.slice(1)}`;
    if (!descriptor.initializer) {
      descriptor.initializer = () => {
        return new ComponentEvent();
      };
    }
    addStaticGetterObjectMember(cls.constructor, 'events', attribute, propertyName);
    addStaticGetterObjectMember(cls.constructor, 'bindings',
      `_${propertyName}Expression`, `&${attribute}`);
  };
}

const STORE_LISTENER_REGEX = /^on([A-Z])([\w]+Store)([A-Z])(.*)$/;

export function StoreListener(listenerDescriptor) {
  return (cls, handlerName) => {
    let descriptor;
    if (listenerDescriptor) {
      if (listenerDescriptor.split(':').length !== 2) {
        throw new Error(
          `An event for StoreListener should be provided in the form of 'store:event'. ${listenerDescriptor} does not conform to this`);
      }
      descriptor = listenerDescriptor;
    } else {
      descriptor = handlerName.replace(STORE_LISTENER_REGEX,
          (match, _1, _2, _3, _4) => `${_1.toLowerCase()}${_2}:${_3.toLowerCase()}${_4}`);
    }

    addStaticGetterObjectMember(cls.constructor, 'storeListeners', descriptor, handlerName);
  };
}
