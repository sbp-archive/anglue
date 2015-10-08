import angular from 'angular';

// Static object members need to be overridden async since some keys
// need to be resolved AFTER the class has fully been defined. This is
// because some property decorators might rely on class decorator configs,
// and property decorators are called before class decorators.
export function addStaticGetterObjectMember(cls, propertyName, key, value, override = true) {
  const currentPropertyDescriptor = Reflect.getOwnPropertyDescriptor(cls, propertyName);
  Reflect.defineProperty(cls, propertyName, {
    configurable: true,
    get: () => {
      const newObject = getCurrentDescriptorValue(currentPropertyDescriptor);
      const resolvedKey = angular.isFunction(key) ? key() : key;
      if (override === true || !angular.isDefined(newObject[resolvedKey])) {
        newObject[resolvedKey] = value;
      }
      return newObject;
    }
  });
}

export function mergeStaticGetterObject(cls, propertyName, values, override = true) {
  // Look at the explanation above addStaticGetterObjectMember to see
  // why we do this override asynchronously...
  const currentPropertyDescriptor = Reflect.getOwnPropertyDescriptor(cls, propertyName);
  Reflect.defineProperty(cls, propertyName, {
    configurable: true,
    get: () => {
      return override
        ? Object.assign({}, getCurrentDescriptorValue(currentPropertyDescriptor), values)
        : Object.assign({}, values, getCurrentDescriptorValue(currentPropertyDescriptor));
    }
  });
}

export function addStaticGetterArrayMember(cls, propertyName, value) {
  mergeStaticGetterArray(cls, propertyName, [value]);
}

export function mergeStaticGetterArray(cls, propertyName, values) {
  const getterArray = cls[propertyName] || [];
  for (const value of values) {
    if (getterArray.indexOf(value) === -1) {
      getterArray.push(value);
    }
  }
  Reflect.defineProperty(cls, propertyName, {
    configurable: true,
    get: () => getterArray
  });
}

export function addStaticGetter(cls, property, getter) {
  Reflect.defineProperty(cls, property, {configurable: true, get: getter});
}

export function addBehavior(cls, BehaviorCls, {property, config, proxy}) {
  const internalProperty = `_${property}`;
  Reflect.defineProperty(cls.prototype, property, {
    get() {
      if (!this[internalProperty]) {
        this[internalProperty] = new BehaviorCls(this, config);
      }
      return this[internalProperty];
    }
  });

  if (proxy) {
    addProxies(cls, BehaviorCls, property, proxy);
  }
}

export function addProxies(cls, BehaviorCls, property, proxies) {
  for (const proxy of proxies) {
    const parts = proxy.split(':');
    const localName = parts[0].trim();

    // We don't want to override any methods that already exist in the prototype
    // of the target cls. If the method already exists, its the class author's
    // responsibility to call behavior methods.
    if (!Reflect.getOwnPropertyDescriptor(cls.prototype, localName)) {
      const externalName = parts[1] ? parts[1].trim() : localName;
      const descriptor = Reflect.getOwnPropertyDescriptor(BehaviorCls.prototype, externalName);

      // This should be a simple property
      if (angular.isUndefined(descriptor) || angular.isDefined(descriptor.get)) {
        Reflect.defineProperty(cls.prototype, localName, {

          /*eslint-disable no-loop-func */
          get() {
            return this[property][externalName];
          }

          /*eslint-disable no-loop-func */
        });
      } else if (angular.isDefined(descriptor.value)) {
        Reflect.defineProperty(cls.prototype, localName, {

          /*eslint-disable no-loop-func */
          value() {
            return this[property][externalName](...arguments);
          }

          /*eslint-enable no-loop-func */
        });
      }
    }
  }
}

export function Inject(injectionName) {
  return (cls, propertyName) => {
    let preparedInjectionName = injectionName;
    if (!preparedInjectionName) {
      preparedInjectionName = `${propertyName[0].toUpperCase()}${propertyName.slice(1)}`;
    }
    addStaticGetterObjectMember(cls.constructor, 'injections',
      propertyName, preparedInjectionName);
  };
}

export function Decorators(decorators) {
  return cls => {
    for (const decorator of decorators) {
      addStaticGetterArrayMember(cls, 'decorators', decorator);
    }
  };
}

export function getCurrentDescriptorValue(propertyDescriptor) {
  if (propertyDescriptor === undefined) {
    return {};
  } else if (propertyDescriptor.get) {
    return propertyDescriptor.get();
  }
  return propertyDescriptor.value;
}

export function camelcase(name) {
  return `${name[0].toUpperCase()}${name.slice(1)}`;
}
