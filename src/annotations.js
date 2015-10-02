import {ApplicationAnnotation} from './application';
import {ComponentAnnotation} from './component';
import {StoreAnnotation} from './store';
import {ActionsAnnotation} from './actions';

export class AnnotationsCache {
	constructor() {
		this.applications = new Map();
		this.components = new Map();
		this.stores = new Map();
		this.actions = new Map();
	}

	getApplication(name, targetCls) {
		var application = this.applications.get(name);
		if (!application) {
			application = new ApplicationAnnotation(name, targetCls);
			this.applications.set(name, application);
		}
		return application;
	}

	getComponent(name, targetCls) {
		var component = this.components.get(name);
		if (!component) {
			component = new ComponentAnnotation(name, targetCls);
			this.components.set(name, component);
		}
		return component;
	}

	getStore(name, targetCls) {
		var store = this.stores.get(name);
		if (!store) {
			store = new StoreAnnotation(name, targetCls);
			this.stores.set(name, store);
		}
		return store;
	}

	getActions(name, targetCls) {
		var actions = this.actions.get(name);
		if (!actions) {
			actions = new ActionsAnnotation(name, targetCls);
			this.actions.set(name, actions);
		}
		return actions;
	}
}

export var Annotations = new AnnotationsCache();
export default Annotations;
