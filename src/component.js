import angular from 'angular';

import {Annotation} from './annotation';
import {Annotations} from './annotations';

import {addStaticGetterObjectMember, addStaticGetter} from './utils';

export class ComponentEvent {
  expression = null;
  fire(locals) {
    this.expression(locals);
  }
}

export class ComponentAnnotation extends Annotation {
  get controllerCls() {
    const annotation = this;
    const TargetCls = this.targetCls;
    const flags = this.flags;

    class ControllerCls extends TargetCls {
      constructor($scope, $log) {
        const injected = Array.from(arguments).slice(2);

        super(...injected);

        annotation.applyInjectionBindings(this, injected);
        annotation.applyDecorators(this);

        if (flags) {
          Object.keys(flags).forEach(flag => {
            const flagBinding = `_${flag}Flag`;
            Reflect.defineProperty(this, flag, {
              get: () => angular.isDefined(this[flagBinding]) ? this[flagBinding] !== 'false' : false
            });
          });
        }

        if (this.onDestroy instanceof Function) {
          $scope.$on('$destroy', this.onDestroy.bind(this));
        }

        if (this.activate instanceof Function) {
          this.activate();
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

  get module() {
    if (!this._module) {
      const name = this.name;
      const template = this.template;
      const bindings = this.bindings;
      const events = this.events;

      this._module = angular.module(
        `components.${name}`,
        this.dependencies
      );

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
        directiveConfig.link = (scope, el, attr, ctrl) => {
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
        };
      }

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

    if (isConfigObject && config.dependencies) {
      addStaticGetter(cls, 'dependencies', () => config.dependencies);
    }
    addStaticGetter(cls, 'annotation', () => Annotations.getComponent(componentName, cls));
  };
}

export function View(config) {
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
