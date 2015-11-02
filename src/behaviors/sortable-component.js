import angular from 'angular';
import {Behavior} from './behavior';
import {addBehavior} from '../utils';
import {COMPONENT_ENTITY_REGEX} from '../component';

export class SortableComponentBehavior extends Behavior {
  constructor(instance, {actions, store} = {}) {
    super(...arguments);

    this.actions = actions;
    this.store = store;

    const className = Reflect.getPrototypeOf(instance).constructor.name;
    if (!this.actionsRef) {
      throw new Error(`SortableComponentBehavior: '${actions}' not found on ${className}`);
    }
    if (!this.storeRef) {
      throw new Error(`SortableComponentBehavior: '${store}' not found on ${className}`);
    }
  }

  get actionsRef() {
    return this.instance[this.actions];
  }

  get storeRef() {
    return this.instance[this.store];
  }

  set sortExpression(sortExpression) {
    if (sortExpression === null) {
      this.actionsRef.clearSort();
    } else {
      this.actionsRef.changeSort(sortExpression);
    }
  }

  get sortExpression() {
    return this.storeRef.sortExpression;
  }
}

export function SortableComponent(config = {}) {
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

    addBehavior(cls, SortableComponentBehavior, {
      property: 'sortableComponent',
      config: preparedConfig,
      proxy: ['sortExpression']
    });
  };
}
