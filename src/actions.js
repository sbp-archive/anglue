import angular from 'angular';

import {Annotation} from './annotation';
import {Annotations} from './annotations';

import {addStaticObjectMember, addStaticGetter} from './utils';


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
		let isConfigObject = angular.isObject(config);
		let actionsName = isConfigObject ? config.name : config;
		if (!actionsName) {
			let clsName = cls.name.replace(/actions$/i, '');
			actionsName = `${clsName[0].toLowerCase()}${clsName.slice(1)}`;
		}
		if (isConfigObject && config.namespace) {
			cls._actionNamespace = config.namespace;
		} else {
			cls._actionNamespace = actionsName
				.replace(/([\A-Z])/g, '_$1')
				.toUpperCase();
		}
		addStaticGetter(cls, 'annotation', () => Annotations.getActions(actionsName, cls));
	};
}

export function AsyncAction(actionName) {
	return (cls, methodName) => {
		actionName = prepareActionName(cls, actionName, methodName);
		addStaticObjectMember(cls.constructor, 'serviceActions',
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
			return originalReturn !== undefined ? originalReturn : dispatchPromise;
		};
	};
}

export default ActionsAnnotation;

function prepareActionName(cls, actionName, methodName) {
	if (!actionName) {
		actionName = methodName.replace(/([\A-Z])/g, '_$1').toUpperCase();
	}
	let actionNamespace = cls.constructor._actionNamespace;
	if (actionNamespace) {
		actionName = `${actionNamespace.toUpperCase()}_${actionName}`;
	}
	return actionName;
}
