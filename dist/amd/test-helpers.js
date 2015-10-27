define(['exports', 'angular', 'angular-mocks', './utils'], function (exports, _angular, _angularMocks, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.buildModuleForComponent = buildModuleForComponent;
  exports.registerModule = registerModule;
  exports.injectComponentUsingModule = injectComponentUsingModule;
  exports.buildComponent = buildComponent;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  var _angular2 = _interopRequireDefault(_angular);

  var counter = 0;

  function buildModuleForComponent(ComponentClass) {
    var dependencies = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    if (!ComponentClass.annotation || !ComponentClass.annotation.module || !ComponentClass.annotation.module.name) {
      throw new Error('ComponentClass is not annotated: ' + ComponentClass.name);
    }

    counter += 1;
    var componentName = 'TestedComponents' + counter;
    return _angular2['default'].module(componentName, [ComponentClass.annotation.module.name, 'ngMockE2E'].concat(_toConsumableArray(dependencies)));
  }

  function registerModule(moduleName) {
    _angular2['default'].mock.module(moduleName);
  }

  function injectComponentUsingModule(moduleName, ComponentClass) {
    var attributesString = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

    if (!ComponentClass.annotation || !ComponentClass.annotation.module || !ComponentClass.annotation.module.name) {
      throw new Error('ComponentClass is not annotated: ' + ComponentClass.name);
    }

    var tagName = (0, _utils.camelCaseToDashes)(ComponentClass.annotation.name).toLowerCase();
    var space = attributesString.length > 0 && !attributesString.startsWith(' ') ? ' ' : '';

    var template = '<' + tagName + space + attributesString + '></' + tagName + '>';
    var elProperty = (0, _utils.dashesToCamelCase)(tagName);

    var controller = null;

    _angular2['default'].mock.inject(function (_$compile_, _$rootScope_, $httpBackend) {
      $httpBackend.whenGET(/\.html$/).passThrough();
      var compiledTemplate = compileTemplate(template, _$compile_, _$rootScope_);
      controller = compiledTemplate.controller(elProperty);
      controller._element = compiledTemplate;
      controller.rootDigest = function () {
        return _$rootScope_.$digest();
      };
    });

    return controller;
  }

  function buildComponent(ComponentClass) {
    var attributesString = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    var dependencies = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    var module = buildModuleForComponent(ComponentClass, dependencies);
    registerModule(module.name);
    return injectComponentUsingModule(module.name, ComponentClass, attributesString);
  }

  function compileTemplate(template, $compile, $rootScope) {
    var el = _angular2['default'].element(template.trim());
    $compile(el)($rootScope.$new());
    $rootScope.$digest();
    return el;
  }
});
//# sourceMappingURL=test-helpers.js.map
