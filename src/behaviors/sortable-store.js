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
  constructor(instance, {collection, transformerWeight, initial} = {}) {
    super(...arguments);

    this.sortExpression = null;
    this.collection = collection || 'items';
    this.transformerWeight = transformerWeight || 50;

    if (initial) {
      this.onChangeSort(initial);
    }
  }

  get $filter() {
    return this.instance.$filter;
  }

  get transformableCollection() {
    return this.instance.transformables[this.collection];
  }

  get transformer() {
    if (!this._transformer) {
      this._transformer = new Transformer('sortableStore', items => {
        return this.$filter('orderBy')(items, this.sortExpression);
      }, this.transformerWeight);
    }
    return this._transformer;
  }

  /**
   * This is a handler proxy for the Store. It get's called with the payload of
   * the ENTITY_SORT_CHANGE action.
   *
   * @param  {String/Array/Boolean} expression
   * This can be any valid angular orderBy $filter expression, or a reverse boolean
   * if the collection we are sorting contains primitives.
   *
   *    Valid angular orderBy $filter expressions are
   *
   *    - `function`: Getter function. The result of this function will be sorted using the
   *      `<`, `===`, `>` operator.
   *    - `string`: An Angular expression. The result of this expression is used to compare elements
   *      (for example `name` to sort by a property called `name` or `name.substr(0, 3)` to sort by
   *      3 first characters of a property called `name`). The result of a constant expression
   *      is interpreted as a property name to be used in comparisons (for example `"special name"`
   *      to sort object by the value of their `special name` property). An expression can be
   *      optionally prefixed with `+` or `-` to control ascending or descending sort order
   *      (for example, `+name` or `-name`). If no property is provided, (e.g. `'+'`) then the array
   *      element itself is used to compare where sorting.
   *    - `Array`: An array of string predicates. The first predicate in the array
   *      is used for sorting, but when two items are equivalent, the next predicate is used.
   */
  onChangeSort(expression = false) {
    const collection = this.transformableCollection;
    const transformer = this.transformer;

    let orderByExpression = expression;
    if (typeof expression === 'boolean') {
      orderByExpression = expression ? '-' : '+';
    }

    this.sortExpression = orderByExpression;

    if (collection.transformers.indexOf(transformer) >= 0) {
      collection.refresh();
    } else {
      collection.addTransformer(transformer);
    }
  }

  onClearSort() {
    this.sortExpression = null;
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

    const changeHandlerName = `on${preparedConfig.entity}ChangeSort`;
    const clearHandlerName = `on${preparedConfig.entity}ClearSort`;
    handlerDecorator(null, false)(cls.prototype, changeHandlerName);
    handlerDecorator(null, false)(cls.prototype, clearHandlerName);

    addBehavior(cls, SortableStoreBehavior, {
      property: 'sortableStore',
      config: preparedConfig,
      proxy: [
        `${changeHandlerName}:onChangeSort`,
        `${clearHandlerName}:onClearSort`,
        'sortExpression'
      ]
    });
  };
}
