import angular from 'angular';
import {Behavior} from './behavior';
import {addBehavior} from '../utils';
import {COMPONENT_ENTITY_REGEX} from '../component';

export class SearchableComponentBehavior extends Behavior {
  constructor(instance, {actions, store} = {}) {
    super(...arguments);

    this.actions = actions;
    this.store = store;

    const className = Reflect.getPrototypeOf(instance).constructor.name;
    if (!this.actionsRef) {
      throw new Error(`SearchableComponentBehavior: '${actions}' not found on ${className}`);
    }
    if (!this.storeRef) {
      throw new Error(`SearchableComponentBehavior: '${store}' not found on ${className}`);
    }
  }

  get actionsRef() {
    return this.instance[this.actions];
  }

  get storeRef() {
    return this.instance[this.store];
  }

  set searchText(searchText) {
    if (angular.isString(searchText) && searchText.trim().length > 0) {
      this.actionsRef.changeSearch(searchText);
    } else {
      this.actionsRef.clearSearch();
    }
  }

  get searchText() {
    return this.storeRef.searchText;
  }
}

export function SearchableComponent(config = {}) {
  return cls => {
    let preparedConfig = config;
    if (angular.isString(config)) {
      preparedConfig = {actions: config};
    }

    if (!preparedConfig.entity) {
      preparedConfig.entity = cls.name.match(COMPONENT_ENTITY_REGEX)[1].toLowerCase();
    }
    if (!preparedConfig.actions) {
      preparedConfig.actions = `${preparedConfig.entity.toLowerCase()}Actions`;
    }
    if (!preparedConfig.store) {
      preparedConfig.store = `${preparedConfig.entity.toLowerCase()}Store`;
    }

    addBehavior(cls, SearchableComponentBehavior, {
      property: 'searchableComponent',
      config: preparedConfig,
      proxy: ['searchText']
    });
  };
}
