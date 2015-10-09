define(['exports', './annotation', './annotations', './utils', './application', './actions', './component', './store', './behaviors'], function (exports, _annotation, _annotations, _utils, _application, _actions, _component, _store, _behaviors) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopExportWildcard(obj, defaults) { var newObj = defaults({}, obj); delete newObj['default']; return newObj; }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  _defaults(exports, _interopExportWildcard(_annotation, _defaults));

  _defaults(exports, _interopExportWildcard(_annotations, _defaults));

  _defaults(exports, _interopExportWildcard(_utils, _defaults));

  _defaults(exports, _interopExportWildcard(_application, _defaults));

  _defaults(exports, _interopExportWildcard(_actions, _defaults));

  _defaults(exports, _interopExportWildcard(_component, _defaults));

  _defaults(exports, _interopExportWildcard(_store, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviors, _defaults));
});
//# sourceMappingURL=anglue.js.map
