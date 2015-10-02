import angular from 'angular';

import {Annotation} from './annotation';
import {Annotations} from './annotations';

import {addStaticObjectMember, addStaticGetter} from './utils';

export class ComponentEvent {
	expression = null;
	fire(locals) {
		this.expression(locals);
	}
}

export class ComponentAnnotation extends Annotation {
	get controllerCls() {
		let annotation = this;
		let TargetCls = this.targetCls;
		let flags = this.flags;

		class ControllerCls extends TargetCls {
			constructor($scope) {
				let injected = Array.from(arguments).slice(1);

				super(...injected);

				annotation.applyInjectionBindings(this, injected);
				annotation.applyDecorators(this);

				console.log(flags);
				if (flags) {
					Object.keys(flags).forEach((flag) => {
						let flagBinding = `_${flag}Flag`;
						Object.defineProperty(this, flag, {
							get: () => this[flagBinding] !== undefined ? this[flagBinding] !== 'false' : false
						})
					});
				}

				if (this.onDestroy instanceof Function) {
					$scope.$on('$destroy', this.onDestroy.bind(this));
				}

				if (this.activate instanceof Function) {
					this.activate.call(this);
				}
			}

			fireComponentEvent(event, locals) {
				if (this._event_handlers && this._event_handlers[event]) {
					this._event_handlers[event].call(this, locals);
				}
			}
		}

		return ControllerCls;
	}

	getInjectionTokens() {
		return ['$scope'].concat(super.getInjectionTokens());
	}

	get dependencies() {
		let targetCls = this.targetCls;
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

	get getDirective() {
		return this.targetCls.getDirective || function(config) {
			return function() {
				return config;
			};
		};
	}

	get module() {
		if (!this._module) {
			let name = this.name;
			let template = this.template;
			let bindings = this.bindings;
			let events = this.events;

			let angular = window.angular;

			console.log(window.angular);

			this._module = angular.module(
				'components.' + name,
				this.dependencies
			);

			let directiveConfig = {
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
				let scope = directiveConfig.scope = {};
				for (let binding of Object.keys(bindings)) {
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
						let eventHandlers = ctrl._event_handlers = {};
						Object.keys(events).forEach((event) => {
							if (attr[event]) {
								eventHandlers[events[event]] = (locals) => {
									scope.$parent.$eval(attr[event], locals);
								};
								let componentEventName = events[event];
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
	return (cls) => {
		let angular = window.angular;
		console.log(angular);
		let isConfigObject = angular.isObject(config);
		let componentName = isConfigObject ? config.name : config;
		if (!componentName) {
			let clsName = cls.name.replace(/component$/i, '');
			componentName = `${clsName[0].toLowerCase()}${clsName.slice(1)}`;
		}
		if (isConfigObject && config.dependencies) {
			addStaticGetter(cls, 'dependencies', () => config.dependencies);
		}

		addStaticGetter(cls, 'annotation', () => Annotations.getComponent(componentName, cls));
	};
}

export function View(config) {
	return (cls) => {
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
		let isConfigObject = angular.isObject(config);
		let preparedName = propertyName;

		if (isConfigObject && config.name) {
			preparedName = config.name;
		}

		let attribute = preparedName;

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
				return this[preparedName];
			};
		}

		addStaticObjectMember(cls.constructor, 'bindings', preparedName, attribute);
	};
}

export function Flag(config) {
	return (cls, propertyName) => {
		let attribute = config || propertyName;
		addStaticObjectMember(cls.constructor, 'flags', propertyName, attribute);

		let propertyBinding = `_${propertyName}Flag`;
		let attributeBinding = `@${attribute}`;
		addStaticObjectMember(cls.constructor, 'bindings', propertyBinding, attributeBinding);
	}
}

export function Event() {
	return (cls, propertyName, descriptor) => {
		let attribute = `on${propertyName[0].toUpperCase()}${propertyName.slice(1)}`;
		if (!descriptor.initializer) {
			descriptor.initializer = () => {
				return new ComponentEvent();
			}
		}
		addStaticObjectMember(cls.constructor, 'events', attribute, propertyName);
		addStaticObjectMember(cls.constructor, 'bindings',
			`_${propertyName}Expression`, `&${attribute}`);
	};
}
