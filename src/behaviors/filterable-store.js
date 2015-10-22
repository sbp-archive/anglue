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

export class FilterableStoreBehavior extends Behavior {
  constructor(instance, {collection} = {}) {
    super(...arguments);

    this.collection = collection || 'items';
    this.filters = new Map();
  }

  get $filter() {
    return this.instance.$filter;
  }

  get transformableCollection() {
    return this.instance.transformables[this.collection];
  }

  get transformer() {
    if (!this._transformer) {
      this._transformer = new Transformer('filterableStore', items => items);
    }
    return this._transformer;
  }

  onFilterChange(filterName, filter) {
    if (Reflect.apply(Object.prototype.toString, filter) === '[object String]') {
      this.filters.set(filterName, items => {
        return this.$filter('filter')(items, filter);
      });
    } else {
      this.filters.set(filterName, items => {
        return items.filter(item => {

          const exclude = filter.exclude;
          const filterProperty = filter.property;
          let filterValues = filter.value;
          const value = item[filterProperty];

          if (filterValues) {
            if (!Array.isArray(filterValues)) {
              filterValues = [filterValues];
            }

            for (const filterValue of filterValues) {
              if (value === filterValue) {
                return !exclude;
              }
            }
          }

          return Boolean(exclude);
        });
      });
    }

    this.doFilter();
  }

  onFilterClear(filterName) {
    this.filters.delete(filterName);
    this.doFilter();
  }

  onSearchChange(expression) {
    this.onFilterChange('__search', expression);
  }

  onSearchClear() {
    this.onFilterClear('__search');
  }

  doFilter() {
    const collection = this.transformableCollection;
    const transformer = this.transformer;

    transformer.fn = items => {
      let filtered = items.slice();

      for (const filterFn of this.filters.values()) {
        filtered = filterFn(filtered);
      }

      return filtered;
    };

    if (collection.transformers.indexOf(transformer) >= 0) {
      collection.refresh();
    } else {
      collection.addTransformer(transformer);
    }
  }
}

export function FilterableStore(config) {
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

    const filterChangeHandlerName = `on${preparedConfig.entity}FilterChange`;
    const filterClearHandlerName = `on${preparedConfig.entity}FilterClear`;
    handlerDecorator(null, false)(cls.prototype, filterChangeHandlerName);
    handlerDecorator(null, false)(cls.prototype, filterClearHandlerName);

    const searchChangeHandlerName = `on${preparedConfig.entity}SearchChange`;
    const searchClearHandlerName = `on${preparedConfig.entity}SearchClear`;
    handlerDecorator(null, false)(cls.prototype, searchChangeHandlerName);
    handlerDecorator(null, false)(cls.prototype, searchClearHandlerName);

    addBehavior(cls, FilterableStoreBehavior, {
      property: 'filterableStore',
      config: preparedConfig,
      proxy: [
        `${filterChangeHandlerName}:onFilterChange`,
        `${filterClearHandlerName}:onFilterClear`,
        `${searchChangeHandlerName}:onSearchChange`,
        `${searchClearHandlerName}:onSearchClear`
      ]
    });
  };
}
