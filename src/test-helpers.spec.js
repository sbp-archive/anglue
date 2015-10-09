/*eslint-env node, jasmine*/
import {buildComponent} from 'anglue/anglue';

describe('Test helpers', () => {
  describe('buildComponent', () => {

    class Generic {}

    it('should throw an error when called with a class without annotation', () => {
      expect(() => {
        buildComponent(Generic);
      }).toThrow(new Error('ComponentClass is not annotated: Generic'));
    });

  });
});
