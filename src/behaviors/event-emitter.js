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
		var events = this.events;
		if (!events[event]) {
			events[event] = new Set();
		}
		events[event].add(handler);

		return () => {
			this.removeListener(event, handler);
		};
	}

	removeListener(event, handler) {
		var events = this.events;
		if (!events[event]) {
			return;
		}
		events[event].delete(handler);
	}

	emit(event) {
		var events = this.events;
		if (!events[event]) {
			return;
		}

		var args = Array.from(arguments).slice(1);
		for (let handler of events[event]) {
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
