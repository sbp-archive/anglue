import angular from 'angular';

// Static object members need to be overridden async since some keys
// need to be resolved AFTER the class has fully been defined. This is
// because some property decorators might rely on class decorator configs,
// and property decorators are called before class decorators.
export function addStaticGetterObjectMember(cls, propertyName, key, value) {
  const currentPropertyDescriptor = Reflect.getOwnPropertyDescriptor(cls, propertyName);
  Reflect.defineProperty(cls, propertyName, {
    configurable: true,
    get: () => {
      const newObject = getCurrentDescriptorValue(currentPropertyDescriptor);
      const resolvedKey = angular.isFunction(key) ? key() : key;
      newObject[resolvedKey] = value;
      return newObject;
    }
  });
}

export function mergeStaticGetterObject(cls, propertyName, values) {
  // Look at the explanation above addStaticGetterObjectMember to see
  // why we do this override asynchronously...
  const currentPropertyDescriptor = Reflect.getOwnPropertyDescriptor(cls, propertyName);
  Reflect.defineProperty(cls, propertyName, {
    configurable: true,
    get: () => Object.assign(getCurrentDescriptorValue(currentPropertyDescriptor), values)
  });
}

export function addStaticGetterArrayMember(cls, propertyName, value) {
  mergeStaticGetterArray(cls, propertyName, [value]);
}

export function mergeStaticGetterArray(cls, propertyName, values) {
  const currentArray = cls[propertyName] || [];
  const newArray = currentArray.concat(values);
  Reflect.defineProperty(cls, propertyName, {
    configurable: true,
    get: () => newArray
  });
}

export function addStaticGetter(cls, property, getter) {
  Reflect.defineProperty(cls, property, {configurable: true, get: getter});
}

export function addBehavior(cls, propertyName, BehaviorCls, methods = []) {
  const internalProperty = `_${propertyName}`;
  Reflect.defineProperty(cls.prototype, propertyName, {
    get() {
      if (!this[internalProperty]) {
        this[internalProperty] = new BehaviorCls(this);
      }
      return this[internalProperty];
    }
  });

  for (const method of methods) {
    const parts = method.split(':');
    const localName = parts[0].trim();
    const externalName = parts[1] ? parts[1].trim() : localName;
    Reflect.defineProperty(cls.prototype, localName, {

      /*eslint-disable no-loop-func */
      value() {
        this[propertyName][externalName](...arguments);
      }

      /*eslint-enable no-loop-func */

    });
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

function getCurrentDescriptorValue(propertyDescriptor) {
  if (propertyDescriptor === undefined) {
    return {};
  } else if (propertyDescriptor.get) {
    return propertyDescriptor.get();
  }
  return propertyDescriptor.value;
}
