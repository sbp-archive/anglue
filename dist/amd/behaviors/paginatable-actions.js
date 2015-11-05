define(['exports', '../actions'], function (exports, _actions) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.PaginatableActions = PaginatableActions;

  function PaginatableActions() {
    return function (cls) {
      (0, _actions.Action)()(cls.prototype, 'changeLimit');
      (0, _actions.Action)()(cls.prototype, 'changePage');
    };
  }
});
//# sourceMappingURL=paginatable-actions.js.map
