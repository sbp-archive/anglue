import angular from 'angular';

import {Annotation} from './annotation';
import {Annotations} from './annotations';
import {EventEmitter} from './behaviors/event-emitter';

import {addStaticObjectMember, addStaticGetter} from './utils';

export class StoreAnnotation extends Annotation {
	get serviceName() {
		var name = this.name;
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
		var TargetCls = this.targetCls;
		var annotation = this;

		return function(LuxyFlux, LuxyFluxStore, ApplicationDispatcher) {
			var injected = Array.from(arguments).slice(3);
			var instance = new TargetCls(...injected);

			annotation.applyInjectionBindings(instance, injected);
			annotation.applyDecorators(instance);

			return LuxyFlux.createStore({
				name: 'store.' + annotation.name,
				dispatcher: ApplicationDispatcher,
				handlers: TargetCls.handlers,
				decorate: instance
			}, LuxyFluxStore);
		};
	}

	get module() {
		if (!this._module) {
			this._module = angular.module(
				'stores.' + this.name,
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
	return (cls) => {
		// A store by default is an EventEmitter.
		// We just reuse the EventEmitter decorator
		EventEmitter()(cls);

		let isConfigObject = angular.isObject(config);
		let storeName = isConfigObject ? config.name : config;
		if (!storeName) {
			let clsName = cls.name.replace(/store$/i, '');
			storeName = `${clsName[0].toLowerCase()}${clsName.slice(1)}`;
		}

		addStaticGetter(cls, 'annotation', () => Annotations.getStore(storeName, cls));
	};
}

export function Handlers(handlers) {
	return (cls) => {
		Object.keys(handlers).forEach((actionName) => {
			let handlerName = handlers[actionName];
			addStaticObjectMember(cls, 'handlers', actionName, handlerName);
		});
	};
}

export function Handler(actionName) {
	return (cls, handlerName) => {
		let action = actionName;
		if (!action) {
			action = handlerName
				.replace(/^on([A-Z]{1})/, (match, first) => first.toLowerCase())
				.replace(/([A-Z])/g, '_$1').toUpperCase();
		}
		addStaticObjectMember(cls.constructor, 'handlers', action, handlerName);
	};
}

export default StoreAnnotation;
