import angular from 'angular';
import {Behavior} from './behavior';
import {Handler as handlerDecorator} from '../store';

import {
  Transformer,
  Transformable as transformableDecorator
} from './transformable';

import {
  addBehavior,
  camelcase,
  Inject as injectDecorator
} from '../utils';

export class SortableStoreBehavior extends Behavior {
  constructor(instance, {collection} = {}) {
    super(...arguments);

    this.collection = collection || 'items';
  }

  get $filter() {
    return this.instance.$filter;
  }

  get transformableCollection() {
    return this.instance.transformables[this.collection];
  }

  get transformer() {
    if (!this._transformer) {
      this._transformer = new Transformer('sortableStore', items => items);
    }
    return this._transformer;
  }

  onSortChange(expression = false) {
    const collection = this.transformableCollection;
    const transformer = this.transformer;

    if (angular.isString(expression) || angular.isArray(expression)) {
      transformer.fn = items => {
        return this.$filter('orderBy')(items, expression);
      };
    } else {
      transformer.fn = items => items.sort((itemA, itemB) => {
        let res = 0;
        if (itemA > itemB) {
          res = 1;
        } else if (itemA < itemB) {
          res = -1;
        }
        return expression ? res * -1 : res;
      });
    }

    if (collection.transformers.indexOf(transformer) >= 0) {
      collection.refresh();
    } else {
      collection.addTransformer(transformer);
    }
  }

  onSortClear() {
    this.transformableCollection.removeTransformer(this.transformer);
  }
}

export function SortableStore(config) {
  return cls => {
    let preparedConfig = config;
    if (angular.isString(config)) {
      preparedConfig = {entity: config};
    }

    preparedConfig = Object.assign({
      collection: 'items',
      entity: cls.name.replace(/store$/i, '')
    }, preparedConfig);
    preparedConfig.entity = camelcase(preparedConfig.entity);

    injectDecorator()(cls.prototype, '$filter');
    transformableDecorator()(cls.prototype, preparedConfig.collection);

    const changeHandlerName = `on${preparedConfig.entity}SortChange`;
    const clearHandlerName = `on${preparedConfig.entity}SortClear`;
    handlerDecorator(null, false)(cls.prototype, changeHandlerName);
    handlerDecorator(null, false)(cls.prototype, clearHandlerName);

    addBehavior(cls, SortableStoreBehavior, {
      property: 'sortableStore',
      config: preparedConfig,
      proxy: [
        `${changeHandlerName}:onSortChange`,
        `${clearHandlerName}:onSortClear`
      ]
    });
  };
}
