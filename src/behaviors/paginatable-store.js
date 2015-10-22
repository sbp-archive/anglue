import angular from 'angular';
import {Behavior} from './behavior';
import {Handler as handlerDecorator} from '../store';

import {
  Transformer,
  Transformable as transformableDecorator
} from './transformable';

import {
  addBehavior,
  camelcase
} from '../utils';

export class PaginationState {
  total = 0;
  constructor(page = 1, limit = null) {
    this.page = page;
    this.limit = limit;
  }
}

export class PaginatableStoreBehavior extends Behavior {
  constructor(instance, {collection, initialPage, initialLimit, transformerWeight} = {}) {
    super(...arguments);

    this.collection = collection || 'items';
    this.transformerWeight = transformerWeight || 75;

    this.state = new PaginationState(initialPage, initialLimit);

    this.refresh();
  }

  get transformableCollection() {
    return this.instance.transformables[this.collection];
  }

  get transformer() {
    if (!this._transformer) {
      const state = this.state;
      this._transformer = new Transformer('paginatableStore', items => {
        // We update the total based on the amount of items we get
        // when this transformer is run. This means that if there is
        // a filtering transformer before the pagination filter, those
        // items will not count to the total property.
        state.total = items.length;

        const limit = state.limit;
        const start = (state.page - 1) * limit;
        const end = Math.min(state.total, start + limit);

        return items.slice(start, end);
      }, this.transformerWeight);
    }

    return this._transformer;
  }

  refresh() {
    const collection = this.transformableCollection;
    const limit = this.state.limit;

    if (collection.transformers.indexOf(this.transformer) >= 0) {
      if (limit === null) {
        collection.removeTransformer(this.transformer);
      } else {
        collection.refresh();
      }
    } else if (limit !== null) {
      collection.addTransformer(this.transformer);
    }
  }

  onPageChange(page) {
    if (this.state.page !== page) {
      this.state.page = Math.max(0, page);
      this.refresh();
    }
  }

  onLimitChange(limit) {
    if (this.state.limit !== limit) {
      this.state.limit = limit;
      this.refresh();
    }
  }
}

export function PaginatableStore(config) {
  return cls => {
    let preparedConfig = config;
    if (angular.isString(config)) {
      preparedConfig = {entity: config};
    }

    preparedConfig = Object.assign({
      collection: 'items',
      entity: cls.name.replace(/store$/i, '')
    }, preparedConfig);

    transformableDecorator()(cls.prototype, preparedConfig.collection);

    const pageChangeHandlerName = `on${camelcase(preparedConfig.entity)}PageChange`;
    const limitChangeHandlerName = `on${camelcase(preparedConfig.entity)}LimitChange`;
    handlerDecorator(null, false)(cls.prototype, pageChangeHandlerName);
    handlerDecorator(null, false)(cls.prototype, limitChangeHandlerName);

    addBehavior(cls, PaginatableStoreBehavior, {
      property: 'paginatableStore',
      config: preparedConfig,
      proxy: [
        `${pageChangeHandlerName}:onPageChange`,
        `${limitChangeHandlerName}:onLimitChange`,
        `paginationState:state`
      ]
    });
  };
}
