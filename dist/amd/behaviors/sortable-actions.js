define(['exports', '../actions'], function (exports, _actions) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SortableActions = SortableActions;

  function SortableActions() {
    return function (cls) {
      (0, _actions.Action)()(cls.prototype, 'changeSort');
      (0, _actions.Action)()(cls.prototype, 'clearSort');
    };
  }
});
//# sourceMappingURL=sortable-actions.js.map
