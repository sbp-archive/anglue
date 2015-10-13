/*eslint-env node, jasmine*/
import {buildComponent, injectComponentUsingModule} from 'anglue/test-helpers';

describe('Test helpers', () => {
  describe('buildComponent', () => {

    class Generic {}

    it('should throw an error when called with a class without annotation', () => {
      expect(() => {
        buildComponent(Generic);
      }).toThrow(new Error('ComponentClass is not annotated: Generic'));
    });
  });

  describe('injectComponentUsingModule', () => {

    class Generic {}

    it('should throw an error when called with a class without annotation', () => {
      expect(() => {
        injectComponentUsingModule('myModule', Generic);
      }).toThrow(new Error('ComponentClass is not annotated: Generic'));
    });

  });
});
