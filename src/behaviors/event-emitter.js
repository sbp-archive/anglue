import {Behavior} from './behavior';
import {addBehavior} from '../utils';

export class EventEmitterBehavior extends Behavior {
  get events() {
    if (!this._events) {
      this._events = new Map();
    }
    return this._events;
  }

  addListener(event, handler) {
    let events = this.events;
    if (!events.has(event)) {
      events.set(event, new Set());
    }
    events.get(event).add(handler);
    return () => {
      this.removeListener(event, handler);
    };
  }

  removeListener(event, handler) {
    let events = this.events;
    let eventSet = events.get(event);
    if (!eventSet || !eventSet.has(handler)) {
      return;
    }
    eventSet.delete(handler);
    if (!eventSet.size) {
      events.delete(event);
    }
  }

  emit(event) {
    let events = this.events;
    if (!events.has(event)) {
      return;
    }

    let args = Array.from(arguments).slice(1);
    for (let handler of events.get(event)) {
      handler(...args);
    }
  }
}

export function EventEmitter() {
  return (cls) => {
    addBehavior(cls, 'eventEmitter', EventEmitterBehavior, [
      'on:addListener',
      'off:removeListener',
      'addListener',
      'removeListener',
      'emit'
    ]);
  };
}
