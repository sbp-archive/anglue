/*eslint-env node, jasmine*//*global module, inject*/
import angular from 'angular';
import 'angular-mocks';
import 'luxyflux/ng-luxyflux';

import {Store, StoreAnnotation, Inject} from 'anglue/anglue';

describe('Stores', () => {
	@Store()
	class SimpleStore {}

	@Store('renamed')
	class NamedStore {}

	@Store({
		name: 'config'
	})
	class AnotherStore {}

	let initializeSpy = jasmine.createSpy();

	@Store()
	class ComplexStore {
		@Inject() $timeout;

		initialize() {
			initializeSpy();
		}
	}

	describe('@Store() decorator', () => {
		it('should create a store annotation', () => {
			expect(SimpleStore.annotation)
				.toEqual(jasmine.any(StoreAnnotation));
		});

		it('should leverage the class name by default as the store name', () => {
			expect(SimpleStore.annotation.name)
				.toEqual('simple');
		});

		it('should be possible to pass the store name to the decorator', () => {
			expect(NamedStore.annotation.name)
				.toEqual('renamed');
		});

		it('should be possible to pass a config with the store name to the decorator', () => {
			expect(AnotherStore.annotation.name)
				.toEqual('config');
		})
	});

	describe('StoreAnnotation', () => {
		it('should have a store annotation', () => {
			expect(SimpleStore.annotation)
				.toEqual(jasmine.any(StoreAnnotation));
		});

		it('should set the angular module name correctly', () => {
			expect(SimpleStore.annotation.module.name)
				.toEqual('stores.simple');
		});
	});

	describe('instance', () => {
		angular
			.module('storeApp', [
				'luxyflux',
				ComplexStore.annotation.module.name
			])
			.service('ApplicationDispatcher', [
				function() {
					return {
						register: jasmine.createSpy(),
						dispatch: jasmine.createSpy()
					}
				}
			]);

		let store, $timeout, appDispatcher;
		beforeEach(module('storeApp'));
		beforeEach(inject((_ComplexStore_, _$timeout_, _ApplicationDispatcher_) => {
			store = _ComplexStore_;
			appDispatcher = _ApplicationDispatcher_;
			$timeout = _$timeout_;
		}));

		it('should call the intialize method', () => {
			expect(initializeSpy).toHaveBeenCalled();
		});

		it('should inject into the store', () => {
			expect(store.$timeout).toBe($timeout);
		})

		it('should register itself with the ApplicationDispatcher', () => {
			expect(appDispatcher.register).toHaveBeenCalled();
		})
	});
});
