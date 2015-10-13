define(['exports', 'angular', 'angular-mocks', './utils'], function (exports, _angular, _angularMocks, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.buildComponent = buildComponent;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _angular2 = _interopRequireDefault(_angular);

  var counter = 0;

  function buildComponent(ComponentClass) {
    var attributesString = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    if (!ComponentClass.annotation || !ComponentClass.annotation.module || !ComponentClass.annotation.module.name) {
      throw new Error('ComponentClass is not annotated: ' + ComponentClass.name);
    }

    var tagName = (0, _utils.camelCaseToDashes)(ComponentClass.annotation.name).toLowerCase();
    var space = attributesString.length > 0 && !attributesString.startsWith(' ') ? ' ' : '';

    var template = '<' + tagName + space + attributesString + '></' + tagName + '>';
    var elProperty = (0, _utils.dashesToCamelCase)(tagName);

    counter += 1;
    var componentName = 'TestedComponents' + counter;

    _angular2['default'].module(componentName, [ComponentClass.annotation.module.name]);

    var controller = null;

    _angular2['default'].mock.module(componentName);
    _angular2['default'].mock.inject(function (_$compile_, _$rootScope_) {
      var compiledTemplate = compileTemplate(template, _$compile_, _$rootScope_);
      controller = compiledTemplate.controller(elProperty);
      controller._element = compiledTemplate;
      controller.rootDigest = function () {
        return _$rootScope_.$digest();
      };
    });

    return controller;
  }

  function compileTemplate(template, $compile, $rootScope) {
    var el = _angular2['default'].element(template.trim());
    $compile(el)($rootScope.$new());
    $rootScope.$digest();
    return el;
  }
});
//# sourceMappingURL=test-helpers.js.map
