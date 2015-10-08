import {ApplicationAnnotation} from './application';
import {ComponentAnnotation} from './component';
import {StoreAnnotation} from './store';
import {ActionsAnnotation} from './actions';

export class AnnotationsCache {
  constructor() {
    this.clear();
  }

  clear() {
    this.actions = new Map();
    this.applications = new Map();
    this.components = new Map();
    this.stores = new Map();
  }

  getActions(name, targetCls) {
    let actions = this.actions.get(name);
    if (!actions) {
      actions = new ActionsAnnotation(name, targetCls);
      this.actions.set(name, actions);
    }
    return actions;
  }

  getApplication(name, targetCls) {
    let application = this.applications.get(name);
    if (!application) {
      application = new ApplicationAnnotation(name, targetCls);
      this.applications.set(name, application);
    }
    return application;
  }

  getComponent(name, targetCls) {
    let component = this.components.get(name);
    if (!component) {
      component = new ComponentAnnotation(name, targetCls);
      this.components.set(name, component);
    }
    return component;
  }

  getStore(name, targetCls) {
    let store = this.stores.get(name);
    if (!store) {
      store = new StoreAnnotation(name, targetCls);
      this.stores.set(name, store);
    }
    return store;
  }
}
export const Annotations = new AnnotationsCache();
export default Annotations;
