import {addStaticGetterArrayMember} from '../utils';

export class Transformer {
  constructor(name, fn) {
    this.name = name;
    this.fn = fn;
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
    return this._data || [];
  }

  addTransformer(transformer) {
    this.insertTransformer(this.transformers.length, transformer);
  }

  insertTransformer(index, transformer) {
    if (this.transformers.indexOf(transformer) === -1) {
      this.transformers.splice(index, 0, transformer);
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

    return {
      get() {
        return this.transformables[propertyName].transformed;
      },
      set(data) {
        this.transformables[propertyName].data = data;
      }
    };
  };
}
