import angular from 'angular';
import 'angular-mocks';
import {camelCaseToDashes, dashesToCamelCase} from './utils';

let counter = 0;

export function buildModuleForComponent(ComponentClass) {
  if (!ComponentClass.annotation || !ComponentClass.annotation.module || !ComponentClass.annotation.module.name) {
    throw new Error(`ComponentClass is not annotated: ${ComponentClass.name}`);
  }

  counter += 1;
  const componentName = `TestedComponents${counter}`;
  return angular.module(componentName, [ComponentClass.annotation.module.name]);
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

  angular.mock.module(moduleName);
  angular.mock.inject((_$compile_, _$rootScope_) => {
    const compiledTemplate = compileTemplate(template, _$compile_, _$rootScope_);
    controller = compiledTemplate.controller(elProperty);
    controller._element = compiledTemplate;
    controller.rootDigest = () => _$rootScope_.$digest();
  });

  return controller;
}

export function buildComponent(ComponentClass, attributesString = '') {
  const module = buildModuleForComponent(ComponentClass);
  return injectComponentUsingModule(module.name, ComponentClass, attributesString);
}

function compileTemplate(template, $compile, $rootScope) {
  const el = angular.element(template.trim());
  $compile(el)($rootScope.$new());
  $rootScope.$digest();
  return el;
}
