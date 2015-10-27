import angular from 'angular';
import 'angular-mocks';
import {camelCaseToDashes, dashesToCamelCase} from './utils';

let counter = 0;

export function buildModuleForComponent(ComponentClass, dependencies = []) {
  if (!ComponentClass.annotation || !ComponentClass.annotation.module || !ComponentClass.annotation.module.name) {
    throw new Error(`ComponentClass is not annotated: ${ComponentClass.name}`);
  }

  counter += 1;
  const componentName = `TestedComponents${counter}`;
  return angular.module(componentName, [ComponentClass.annotation.module.name, 'ngMockE2E', ...dependencies]);
}

export function registerModule(moduleName) {
  angular.mock.module(moduleName);
}

export function injectComponentUsingModule(moduleName, ComponentClass, attributesString = '') {
  if (!ComponentClass.annotation || !ComponentClass.annotation.module || !ComponentClass.annotation.module.name) {
    throw new Error(`ComponentClass is not annotated: ${ComponentClass.name}`);
  }

  const tagName = camelCaseToDashes(ComponentClass.annotation.name).toLowerCase();
  const space = attributesString.length > 0 && !attributesString.startsWith(' ') ? ' ' : '';

  const template = `<${tagName}${space}${attributesString}></${tagName}>`;
  const elProperty = dashesToCamelCase(tagName);


  let controller = null;

  angular.mock.inject((_$compile_, _$rootScope_, $httpBackend) => {
    $httpBackend.whenGET(/\.html$/).passThrough();
    const compiledTemplate = compileTemplate(template, _$compile_, _$rootScope_);
    controller = compiledTemplate.controller(elProperty);
    controller._element = compiledTemplate;
    controller.rootDigest = () => _$rootScope_.$digest();
  });

  return controller;
}

export function buildComponent(ComponentClass, attributesString = '', dependencies = []) {
  const module = buildModuleForComponent(ComponentClass, dependencies);
  registerModule(module.name);
  return injectComponentUsingModule(module.name, ComponentClass, attributesString);
}

function compileTemplate(template, $compile, $rootScope) {
  const el = angular.element(template.trim());
  $compile(el)($rootScope.$new());
  $rootScope.$digest();
  return el;
}
