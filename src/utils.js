import angular from 'angular';

// Static object members need to be overridden async since some keys
// need to be resolved AFTER the class has fully been defined. This is
// because some property decorators might rely on class decorator configs,
// and property decorators are called before class decorators.
export function addStaticGetterObjectMember(cls, propertyName, key, value) {
  let currentPropertyDescriptor = Object.getOwnPropertyDescriptor(cls, propertyName);
  Object.defineProperty(cls, propertyName, {
    configurable: true,
    get: () => {
      let newObject = getCurrentDescriptorValue(currentPropertyDescriptor);
      let resolvedKey = angular.isFunction(key) ? key() : key;
      newObject[resolvedKey] = value;
      return newObject;
    }
  });
}

export function mergeStaticGetterObject(cls, propertyName, values) {
  // Look at the explanation above addStaticGetterObjectMember to see
  // why we do this override asynchronously...
  let currentPropertyDescriptor = Object.getOwnPropertyDescriptor(cls, propertyName);
  Object.defineProperty(cls, propertyName, {
    configurable: true,
    get: () => Object.assign(getCurrentDescriptorValue(currentPropertyDescriptor), values)
  });
}

export function addStaticGetterArrayMember(cls, propertyName, value) {
  mergeStaticGetterArray(cls, propertyName, [value]);
}

export function mergeStaticGetterArray(cls, propertyName, values) {
  let currentArray = cls[propertyName] || [];
  let newArray = currentArray.concat(values);
  Object.defineProperty(cls, propertyName, {
    configurable: true,
    get: () => newArray
  });
}

export function addStaticGetter(cls, property, getter) {
  Object.defineProperty(cls, property, {configurable: true, get: getter});
}

export function addBehavior(cls, propertyName, BehaviorCls, methods = []) {
  let internalProperty = `_${propertyName}`;
  Object.defineProperty(cls.prototype, propertyName, {
    get: function() {
      if (!this[internalProperty]) {
        this[internalProperty] = new BehaviorCls(this);
      }
      return this[internalProperty];
    }
  });

  for (let method of methods) {
    let parts = method.split(':');
    let localName = parts[0].trim();
    let externalName = parts[1] ? parts[1].trim() : localName;
    Object.defineProperty(cls.prototype, localName, {

      /*eslint-disable no-loop-func */
      value: function() {
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
  return (cls) => {
    for (let decorator of decorators) {
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
