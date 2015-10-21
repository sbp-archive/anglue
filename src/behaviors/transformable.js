import {addStaticGetterArrayMember} from '../utils';

export class Transformer {
  constructor(name, fn, weight = 100) {
    this.name = name;
    this.fn = fn;
    this.weight = weight;
  }

  exec(value) {
    return this.fn(value);
  }
}

export class TransformableCollection {
  transformed = [];
  transformers = [];

  set data(data) {
    this._data = data;
    this.refresh();
  }

  get data() {
    if (!this._data) {
      this._data = [];
    }
    return this._data;
  }

  addTransformer(transformer) {
    this.insertTransformer(transformer);
  }

  insertTransformer(transformer) {
    if (this.transformers.indexOf(transformer) === -1) {
      this.transformers.push(transformer);

      this.transformers.sort((transA, transB) => {
        if (transA.weight > transB.weight) {
          return 1;
        } else if (transA.weight < transB.weight) {
          return -1;
        }
        return 0;
      });

      this.refresh();
    }
  }

  removeTransformer(transformer) {
    const index = this.transformers.indexOf(transformer);
    if (index >= 0) {
      this.transformers.splice(index, 1);
      this.refresh();
    }
  }

  clearTransformers() {
    this.transformers.splice(0, this.transformers.length);
    this.refresh();
  }

  refresh() {
    let transformed = this.data.slice();
    for (const transformer of this.transformers) {
      transformed = transformer.exec(transformed);
    }
    this.transformed = transformed;
  }
}

export function Transformable() {
  return (cls, propertyName) => {
    const transformableDescriptor = {
      get() {
        return this.transformables[propertyName].transformed;
      },
      set(data) {
        this.transformables[propertyName].data = data;
      }
    };

    addStaticGetterArrayMember(cls.constructor, 'transformers', propertyName);

    if (!Reflect.getOwnPropertyDescriptor(cls, 'transformables')) {
      Reflect.defineProperty(cls, 'transformables', {
        get() {
          if (!this._transformables) {
            this._transformables = {};
            for (const transformer of cls.constructor.transformers) {
              this._transformables[transformer] = new TransformableCollection();
            }
          }
          return this._transformables;
        }
      });
    }

    if (!Reflect.getOwnPropertyDescriptor(cls, propertyName)) {
      Reflect.defineProperty(cls, propertyName, transformableDescriptor);
    }

    return transformableDescriptor;
  };
}
