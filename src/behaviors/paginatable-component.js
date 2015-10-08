import angular from 'angular';
import {Behavior} from './behavior';
import {addBehavior} from '../utils';

export class PaginatableComponentBehavior extends Behavior {
  constructor(instance, {actions, store, initialPage, initialLimit} = {}) {
    super(...arguments);

    this.actions = actions;
    this.store = store;

    const className = Reflect.getPrototypeOf(instance).constructor.name;
    if (!this.actionsRef) {
      throw new Error(`PaginatableComponentBehavior: actionsRef '${actions}' not found on ${className}`);
    }
    if (!this.storeRef) {
      throw new Error(`PaginatableComponentBehavior: storeRef '${store}' not found on ${className}`);
    } else if (!this.storeRef.paginatableStore) {
      throw new Error(`PaginatableComponentBehavior: storeRef '${store}' on ${className} is not paginatable`);
    }

    if (initialPage) {
      this.page = initialPage;
    }
    if (initialLimit) {
      this.limit = initialLimit;
    }
  }

  get actionsRef() {
    return this.instance[this.actions];
  }
  get storeRef() {
    return this.instance[this.store];
  }

  set page(page) {
    if (page !== this.page) {
      this.actionsRef.pageChange(page);
    }
  }
  set limit(limit) {
    if (limit !== this.limit) {
      this.actionsRef.limitChange(limit);
    }
  }

  get page() {
    return this.storeRef.paginationState.page;
  }
  get limit() {
    return this.storeRef.paginationState.limit;
  }
  get total() {
    return this.storeRef.paginationState.total;
  }
}

const ENTITY_REGEX = /^([A-Z][a-z]*)/;

export function PaginatableComponent(config = {}) {
  return cls => {
    let preparedConfig = config;
    if (angular.isString(config)) {
      preparedConfig = {entity: config};
    }

    if (!preparedConfig.entity) {
      preparedConfig.entity = ENTITY_REGEX.exec(cls.name)[0].toLowerCase();
    }
    if (!preparedConfig.actions) {
      preparedConfig.actions = `${preparedConfig.entity}Actions`;
    }
    if (!preparedConfig.store) {
      preparedConfig.store = `${preparedConfig.entity}Store`;
    }

    addBehavior(cls, PaginatableComponentBehavior, {
      property: 'pagination',
      config: preparedConfig
    });
  };
}
