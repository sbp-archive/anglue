define(['exports', '../actions'], function (exports, _actions) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.FilterableActions = FilterableActions;

  function FilterableActions() {
    return function (cls) {
      (0, _actions.Action)()(cls.prototype, 'changeSearch');
      (0, _actions.Action)()(cls.prototype, 'clearSearch');
      (0, _actions.Action)()(cls.prototype, 'changeFilter');
      (0, _actions.Action)()(cls.prototype, 'clearFilter');
    };
  }
});
//# sourceMappingURL=filterable-actions.js.map
