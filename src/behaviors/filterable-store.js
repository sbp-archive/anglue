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
  constructor(instance, {collection, transformerWeight} = {}) {
    super(...arguments);

    this.searchText = null;
    this.collection = collection || 'items';
    this.transformerWeight = transformerWeight || 25;
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
      this._transformer = new Transformer('filterableStore', items => items, this.transformerWeight);
    }
    return this._transformer;
  }

  onChangeFilter(filterName, expression, comparator) {
    this.filters.set(filterName, items => {
      return this.$filter('filter')(items, expression, comparator);
    });
    this.doFilter();
  }

  onClearFilter(filterName) {
    this.filters.delete(filterName);
    this.doFilter();
  }

  onChangeSearch(searchText) {
    if (angular.isString(searchText) && searchText.trim().length > 0) {
      this.searchText = searchText.trim();
      this.onChangeFilter('__search', this.searchText);
    }
  }

  onClearSearch() {
    this.searchText = null;
    this.onClearFilter('__search');
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

    const changeFilterHandlerName = `on${preparedConfig.entity}ChangeFilter`;
    const clearFilterHandlerName = `on${preparedConfig.entity}ClearFilter`;
    handlerDecorator(null, false)(cls.prototype, changeFilterHandlerName);
    handlerDecorator(null, false)(cls.prototype, clearFilterHandlerName);

    const changeSearchHandlerName = `on${preparedConfig.entity}ChangeSearch`;
    const clearSearchHandlerName = `on${preparedConfig.entity}ClearSearch`;
    handlerDecorator(null, false)(cls.prototype, changeSearchHandlerName);
    handlerDecorator(null, false)(cls.prototype, clearSearchHandlerName);

    addBehavior(cls, FilterableStoreBehavior, {
      property: 'filterableStore',
      config: preparedConfig,
      proxy: [
        `${changeFilterHandlerName}:onChangeFilter`,
        `${clearFilterHandlerName}:onClearFilter`,
        `${changeSearchHandlerName}:onChangeSearch`,
        `${clearSearchHandlerName}:onClearSearch`,
        'searchText'
      ]
    });
  };
}
