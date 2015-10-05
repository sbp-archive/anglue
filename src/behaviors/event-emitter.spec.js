import {
  EventEmitter,
  EventEmitterBehavior
} from 'anglue/anglue';

describe('EventEmitter', () => {
  describe('@EventEmitter()', () => {
    it('should define the EventEmitter API methods on the class', () => {
      @EventEmitter() class EmitterClass {}

      let emitter = new EmitterClass();
      let eventEmitterApi = [
        'eventEmitter',
        'on',
        'off',
        'addListener',
        'removeListener',
        'emit'
      ];

      eventEmitterApi.forEach(api => expect(emitter[api]).toBeDefined());
    });
  });

  describe('EventEmitterBehavior', () => {
    let emitterBehavior;
    beforeEach(() => {
      emitterBehavior = new EventEmitterBehavior();
    });

    describe('#events', () => {
      it('should be a Map', () => {
        expect(emitterBehavior.events).toEqual(jasmine.any(Map));
      });
    });

    describe('addListener()', () => {
      it('should create a Set with handlers for the added event', () => {
        emitterBehavior.addListener('foo', () => {});
        expect(emitterBehavior.events.get('foo')).toEqual(jasmine.any(Set));
      });

      it('should add the handler to the event Set', () => {
        let handler = () => {};

        emitterBehavior.addListener('foo', handler);
        expect(emitterBehavior.events.get('foo').has(handler)).toBe(true);
      });

      it('should return a method that can be used to remove the listener again', () => {
        let handler = () => {};

        spyOn(emitterBehavior, 'removeListener');
        emitterBehavior.addListener('foo', handler)();
        expect(emitterBehavior.removeListener).toHaveBeenCalledWith('foo', handler);
      });
    });

    describe('removeListener()', () => {
      it('should remove the handler from the event Set', () => {
        let fooHandler = () => {};
        let barHandler = () => {};

        emitterBehavior.addListener('event', fooHandler);
        emitterBehavior.addListener('event', barHandler);
        emitterBehavior.removeListener('event', fooHandler);

        expect(emitterBehavior.events.get('event').has(fooHandler)).toBe(false);
      });

      it('should remove event Set from events when the last handler is removed', () => {
        let fooHandler = () => {};

        emitterBehavior.addListener('event', fooHandler);
        emitterBehavior.removeListener('event', fooHandler);

        expect(emitterBehavior.events.get('event')).toBeUndefined();
      });

      it('should not break when trying to remove a listener that is not there in the set', () => {
        let method = () => emitterBehavior.removeListener('event', null);
        expect(method).not.toThrow();
      });
    });

    describe('emit()', () => {
      it('should call the handler with the correct arguments', () => {
        let handlerSpy = jasmine.createSpy('handler');

        emitterBehavior.addListener('event', handlerSpy);
        emitterBehavior.emit('event', 'foo', 'bar');

        expect(handlerSpy).toHaveBeenCalledWith('foo', 'bar');
      });

      it('should not break when trying to emit an event that has no listeners', () => {
        let method = () => emitterBehavior.emit('event');
        expect(method).not.toThrow();
      });
    });
  });
});
