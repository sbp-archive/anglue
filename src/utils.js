import angular from 'angular';

export function addStaticObjectMember(cls, propertyName, key, value) {
	let currentGetter = Object.getOwnPropertyDescriptor(cls, propertyName);
	Object.defineProperty(cls, propertyName, {
		configurable: true,
		get: () => {
			let newObject = currentGetter !== undefined ?
				currentGetter.get() : {};
			let resolvedKey = angular.isFunction(key) ? key() : key;
			newObject[resolvedKey] = value;
			return newObject;
		}
	});
}

export function addStaticGetter(cls, property, getter) {
	Object.defineProperty(cls, property, {configurable: true, get: getter});
}

export function addBehavior(cls, propertyName, BehaviorCls, methods) {
	let internalProperty = `_${propertyName}`;

	Object.defineProperty(cls, propertyName, {
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

		Object.defineProperty(cls, localName, {
			value: function() {
				this[propertyName][externalName](...arguments);
			}
		})
	}
}

export function Inject(injectionName) {
	return (cls, propertyName) => {
		let preparedInjectionName = injectionName;
		if (!preparedInjectionName) {
			preparedInjectionName = `${propertyName[0].toUpperCase()}${propertyName.slice(1)}`;
		}
		addStaticObjectMember(cls.constructor, 'injections',
			propertyName, preparedInjectionName);
	};
}

export function Decorators(decorators) {
	return (cls) => {
		addStaticGetter(cls, 'decorators', () => decorators);
	};
}
