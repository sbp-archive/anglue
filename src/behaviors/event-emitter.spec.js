import {
  EventEmitter,
  EventEmitterBehavior
} from 'anglue/anglue';

describe('EventEmitter', () => {
  describe('@EventEmitter()', () => {
    it('should define the EventEmitter API methods on the class', () => {
      @EventEmitter() class EmitterClass {}

      const emitter = new EmitterClass();
      const eventEmitterApi = [
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
        const handler = () => {};

        emitterBehavior.addListener('foo', handler);
        expect(emitterBehavior.events.get('foo').has(handler)).toBe(true);
      });

      it('should return a method that can be used to remove the listener again', () => {
        const handler = () => {};

        spyOn(emitterBehavior, 'removeListener');
        emitterBehavior.addListener('foo', handler)();
        expect(emitterBehavior.removeListener).toHaveBeenCalledWith('foo', handler);
      });
    });

    describe('removeListener()', () => {
      it('should remove the handler from the event Set', () => {
        const fooHandler = () => {};
        const barHandler = () => {};

        emitterBehavior.addListener('event', fooHandler);
        emitterBehavior.addListener('event', barHandler);
        emitterBehavior.removeListener('event', fooHandler);

        expect(emitterBehavior.events.get('event').has(fooHandler)).toBe(false);
      });

      it('should remove event Set from events when the last handler is removed', () => {
        const fooHandler = () => {};

        emitterBehavior.addListener('event', fooHandler);
        emitterBehavior.removeListener('event', fooHandler);

        expect(emitterBehavior.events.get('event')).toBeUndefined();
      });

      it('should not break when trying to remove a listener that is not there in the set', () => {
        const method = () => emitterBehavior.removeListener('event', null);
        expect(method).not.toThrow();
      });
    });

    describe('emit()', () => {
      it('should call the handler with the correct arguments', () => {
        const handlerSpy = jasmine.createSpy('handler');

        emitterBehavior.addListener('event', handlerSpy);
        emitterBehavior.emit('event', 'foo', 'bar');

        expect(handlerSpy).toHaveBeenCalledWith('foo', 'bar');
      });

      it('should not break when trying to emit an event that has no listeners', () => {
        const method = () => emitterBehavior.emit('event');
        expect(method).not.toThrow();
      });
    });
  });
});
