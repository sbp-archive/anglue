 /*eslint-env node, jasmine*//*global module, inject*/
 import angular from 'angular';
 import 'angular-mocks';

 import {Component, ComponentAnnotation, Flag} from '../../src/component';

 describe('Components', () => {
 	@Component()
 	class SimpleComponent {}

 	@Component('renamed')
 	class NamedComponent {}

 	@Component({
 		name: 'dependency',
 		dependencies: ['dependency']
 	})

	class WithDependenciesComponent {
	}

 	let activateSpy = jasmine.createSpy();
 	@Component()
 	class ComplexComponent {
		@Flag() something;

 		activate() {
 			activateSpy();
			console.log(this.something);
 		}
 	}

 	describe('@Component() decorator', () => {
 		it('should create a component annotation', () => {
 			expect(SimpleComponent.annotation)
 				.toEqual(jasmine.any(ComponentAnnotation));
 		});

 		it('should leverage the class name by default as the component name', () => {
 			expect(SimpleComponent.annotation.name)
 				.toEqual('simple');
 		});

 		it('should be possible to pass the component name to the decorator', () => {
 			expect(NamedComponent.annotation.name)
 				.toEqual('renamed');
 		});

 		it('should be possible to pass a config with the component name to the decorator', () => {
 			expect(WithDependenciesComponent.annotation.name)
 				.toEqual('dependency');
 		})

 		it('should be possible to pass a config with dependencies to the decorator', () => {
 			expect(WithDependenciesComponent.annotation.dependencies)
 				.toEqual(['dependency']);
 		})
 	});

 	describe('ComponentAnnotation', () => {
 		it('should have a component annotation', () => {
 			expect(SimpleComponent.annotation)
 				.toEqual(jasmine.any(ComponentAnnotation));
 		});

 		it('should set the angular module name correctly', () => {
 			expect(SimpleComponent.annotation.module.name)
 				.toEqual('components.simple');
 		});

 		it('should set the angular module dependencies correctly', () => {
 			expect(WithDependenciesComponent.annotation.module.requires)
 				.toEqual(['dependency'])
 		});
 	});

 	describe('directive', () => {
		let angular = window.angular;

 		angular.module('componentApp', [
 			ComplexComponent.annotation.module.name
 		]);

 		let $compile, $rootScope;
		console.log('module', window.module);
 		beforeEach(window.module('componentApp'));
 		beforeEach(inject((_$compile_, _$rootScope_) => {
 			$compile = _$compile_;
 			$rootScope = _$rootScope_;
 		}));

 		it('should call the activate method', function() {
 			$compile('<complex something="true"></complex><complex something="false"></complex><complex></complex>')($rootScope);
 			$rootScope.$digest();

 			expect(activateSpy).toHaveBeenCalled();
 		});
 	});
 });
