define(['exports', './behaviors/behavior', './behaviors/event-emitter', './behaviors/entity-store', './behaviors/filterable-store', './behaviors/searchable-actions', './behaviors/searchable-component', './behaviors/sortable-actions', './behaviors/sortable-component', './behaviors/sortable-store', './behaviors/paginatable-actions', './behaviors/paginatable-component', './behaviors/paginatable-store', './behaviors/transformable'], function (exports, _behaviorsBehavior, _behaviorsEventEmitter, _behaviorsEntityStore, _behaviorsFilterableStore, _behaviorsSearchableActions, _behaviorsSearchableComponent, _behaviorsSortableActions, _behaviorsSortableComponent, _behaviorsSortableStore, _behaviorsPaginatableActions, _behaviorsPaginatableComponent, _behaviorsPaginatableStore, _behaviorsTransformable) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopExportWildcard(obj, defaults) { var newObj = defaults({}, obj); delete newObj['default']; return newObj; }

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  _defaults(exports, _interopExportWildcard(_behaviorsBehavior, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsEventEmitter, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsEntityStore, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsFilterableStore, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsSearchableActions, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsSearchableComponent, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsSortableActions, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsSortableComponent, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsSortableStore, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsPaginatableActions, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsPaginatableComponent, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsPaginatableStore, _defaults));

  _defaults(exports, _interopExportWildcard(_behaviorsTransformable, _defaults));
});
//# sourceMappingURL=behaviors.js.map
