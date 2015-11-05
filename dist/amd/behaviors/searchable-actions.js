define(['exports', '../actions'], function (exports, _actions) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SearchableActions = SearchableActions;

  function SearchableActions() {
    return function (cls) {
      (0, _actions.Action)()(cls.prototype, 'changeSearch');
      (0, _actions.Action)()(cls.prototype, 'clearSearch');
    };
  }
});
//# sourceMappingURL=searchable-actions.js.map
