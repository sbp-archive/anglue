import {
  Transformer,
  Transformable,
  TransformableCollection
} from 'anglue/anglue';

describe('Transformables', () => {
  describe('TransformableCollection', () => {
    const testData = ['foo', 'bar', 'zzz'];
    const sortTransformer = new Transformer('sort', items => items.sort());
    const filterTransformer = new Transformer('filter',
      items => items.filter(item => item !== 'zzz'));

    let collection;
    beforeEach(() => {
      collection = new TransformableCollection();
      collection.data = testData;
    });

    it('should just return an empty array when no data has been set yet', () => {
      collection = new TransformableCollection();
      expect(collection.transformed).toEqual([]);
    });

    describe('refresh()', () => {
      it('should not break on refresh when no data is set yet', () => {
        collection = new TransformableCollection();
        collection.refresh();
        expect(collection.transformed).toEqual([]);
      });

      it('should allow multiple transformers to transform the data', () => {
        collection.transformers = [filterTransformer, sortTransformer];
        collection.refresh();
        expect(collection.transformed).toEqual(['bar', 'foo']);
      });
    });

    describe('addTransformer()', () => {
      it('should insert the transformer into the transformers list', () => {
        collection.transformers = [filterTransformer];
        collection.addTransformer(sortTransformer);
        expect(collection.transformers).toEqual([filterTransformer, sortTransformer]);
      });

      it('should refresh the current data with the new transformer', () => {
        collection.transformers = [filterTransformer];
        collection.addTransformer(sortTransformer);
        expect(collection.transformed).toEqual(['bar', 'foo']);
      });

      it('should order transformers by weight', () => {

        collection.transformers = [filterTransformer];
        collection.addTransformer(sortTransformer);

        const wheelieTransformer = new Transformer('wheelie', items => items, 50);
        const bumblebeeTransformer = new Transformer('bumblebee', items => items, 125);
        const megatronTransformer = new Transformer('megatron', items => items, 150);
        const optimusTransformer = new Transformer('optimus', items => items, 155);

        collection.addTransformer(megatronTransformer);
        collection.addTransformer(bumblebeeTransformer);
        collection.addTransformer(wheelieTransformer);
        collection.addTransformer(optimusTransformer);

        expect(collection.transformers[0]).toEqual(wheelieTransformer);
        expect(collection.transformers[1]).toEqual(filterTransformer);
        expect(collection.transformers[2]).toEqual(sortTransformer);
        expect(collection.transformers[3]).toEqual(bumblebeeTransformer);
        expect(collection.transformers[4]).toEqual(megatronTransformer);
        expect(collection.transformers[5]).toEqual(optimusTransformer);
      });
    });

    describe('removeTransformer()', () => {
      it('should insert the transformer into the transformers list', () => {
        collection.transformers = [filterTransformer, sortTransformer];
        collection.removeTransformer(sortTransformer);
        expect(collection.transformers).toEqual([filterTransformer]);
      });

      it('should refresh the current data using the original data', () => {
        collection.addTransformer(filterTransformer);
        collection.addTransformer(sortTransformer);
        collection.removeTransformer(sortTransformer);
        expect(collection.transformed).toEqual(['foo', 'bar']);
      });
    });

    describe('clearTransformers()', () => {
      it('should clear all the current transformers', () => {
        collection.transformers = [filterTransformer, sortTransformer];
        collection.clearTransformers();
        expect(collection.transformers).toEqual([]);
      });

      it('should refresh the current data using the original data', () => {
        collection.addTransformer(filterTransformer);
        collection.addTransformer(sortTransformer);
        collection.clearTransformers();
        expect(collection.transformed).toEqual(['foo', 'bar', 'zzz']);
      });
    });
  });

  describe('@Transformable()', () => {
    class MyStore {
      @Transformable() items;
    }

    let store;
    beforeEach(() => {
      store = new MyStore();
    });

    it('should create a transformables object with a collection for our property', () => {
      expect(store.transformables.items).toEqual(jasmine.any(TransformableCollection));
    });

    it('should create separate collections for each instance', () => {
      const anotherStore = new MyStore();
      expect(store.transformables.items)
        .not.toBe(anotherStore.transformables.items);
    });

    it('should make a getter that returns the transformed data', () => {
      expect(store.items).toBe(store.transformables.items.transformed);
    });

    it('should update the data on transformable collection when updating the property', () => {
      const newData = ['foo', 'bar'];
      store.items = newData;
      expect(store.transformables.items.data).toBe(newData);
    });
  });
});
