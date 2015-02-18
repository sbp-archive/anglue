import Component from './component';
import Store from './store';
import Actions from './actions';

export {Component, Store, Actions};

export class Annotations {
    constructor() {
        this.components = new Map();
        this.stores = new Map();
        this.actions = new Map();
    }

    get Component() {
        return Component;
    }

    get Store() {
        return Store;
    }

    get Actions() {
        return ActionCreators;
    }

    getComponent(name, targetCls) {
        var component = this.components.get(name);
        if (!component) {
            component = new Component(name, targetCls);
            this.components.set(name, component);
        }
        return component;
    }

    getStore(name, targetCls) {
        var store = this.stores.get(name);
        if (!store) {
            store = new Store(name, targetCls);
            this.stores.set(name, store);
        }
        return store;
    }

    getActions(name, targetCls) {
        var actions = this.actions.get(name);
        if (!actions) {
            actions = new Actions(name, targetCls);
            this.actions.set(name, actions);
        }
        return actions;
    }
}
export default new Annotations;
