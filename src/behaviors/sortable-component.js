import angular from 'angular';
import {Behavior} from './behavior';
import {addBehavior} from '../utils';

export class SortableComponentBehavior extends Behavior {
  constructor(instance, {actions, initial} = {}) {
    super(...arguments);

    this.actions = actions;

    if (!this.actionsRef) {
      const className = Reflect.getPrototypeOf(instance).constructor.name;
      throw new Error(`SortableComponentBehavior: '${actions}' not found on ${className}`);
    }

    if (initial) {
      this.sortExpression = initial;
    }
  }

  get actionsRef() {
    return this.instance[this.actions];
  }

  set sortExpression(sortExpression) {
    this._sortExpression = sortExpression;
    if (sortExpression === null) {
      this.actionsRef.sortClear();
    } else {
      this.actionsRef.sortChange(sortExpression);
    }
  }

  get sortExpression() {
    return this._sortExpression || null;
  }
}

const ENTITY_REGEX = /^([A-Z][a-z]*)/;

export function SortableComponent(config = {}) {
  return cls => {
    let preparedConfig = config;
    if (angular.isString(config)) {
      preparedConfig = {actions: config};
    }

    if (!preparedConfig.entity) {
      preparedConfig.entity = ENTITY_REGEX.exec(cls.name)[0];
    }
    if (!preparedConfig.actions) {
      preparedConfig.actions = `${preparedConfig.entity.toLowerCase()}Actions`;
    }

    addBehavior(cls, SortableComponentBehavior, {
      property: 'sortableComponent',
      config: preparedConfig,
      proxy: ['sortExpression']
    });
  };
}
