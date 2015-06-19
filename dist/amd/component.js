var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

define(['exports', 'angular', './annotation'], function (exports, _angular, _annotation) {
    'use strict';

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _defaults(subClass, superClass); };

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _angular2 = _interopRequire(_angular);

    var _Annotation2 = _interopRequire(_annotation);

    var Component = (function (_Annotation) {
        function Component() {
            _classCallCheck(this, Component);

            if (_Annotation != null) {
                _Annotation.apply(this, arguments);
            }
        }

        _inherits(Component, _Annotation);

        _createClass(Component, [{
            key: 'controllerCls',
            get: function () {
                var annotation = this;
                var TargetCls = this.targetCls;

                var ControllerCls = (function (_TargetCls) {
                    function ControllerCls($scope, LuxyFlux, LuxyFluxStore, ApplicationDispatcher) {
                        var _this = this;

                        _classCallCheck(this, ControllerCls);

                        var injected = Array.from(arguments).slice(4);
                        var componentStores = annotation.componentStores;

                        _get(Object.getPrototypeOf(ControllerCls.prototype), 'constructor', this).apply(this, injected);

                        Object.keys(componentStores).forEach(function (injectionName) {
                            _this[injectionName] = new componentStores[injectionName]();
                        });

                        annotation.applyInjectionBindings(this, injected);
                        annotation.applyDecorators(this);

                        $scope.$on('$destroy', function () {
                            if (_this.onDestroy instanceof Function) {
                                _this.onDestroy.call(_this);
                            }

                            Object.keys(componentStores).forEach(function (injectionName) {
                                _this[injectionName].dispatcher = null;
                                _this[injectionName] = null;
                            });
                        });

                        if (this.activate instanceof Function) {
                            this.activate();
                        }
                    }

                    _inherits(ControllerCls, _TargetCls);

                    _createClass(ControllerCls, [{
                        key: 'fireComponentEvent',
                        value: function fireComponentEvent(event, locals) {
                            if (this._event_handlers && this._event_handlers[event]) {
                                this._event_handlers[event].call(this, locals);
                            }
                        }
                    }]);

                    return ControllerCls;
                })(TargetCls);

                return ControllerCls;
            }
        }, {
            key: 'getInjectionTokens',
            value: function getInjectionTokens() {
                return ['$scope', 'LuxyFlux', 'LuxyFluxStore', 'ApplicationDispatcher'].concat(_get(Object.getPrototypeOf(Component.prototype), 'getInjectionTokens', this).call(this));
            }
        }, {
            key: 'getComponentStoreClasses',
            value: function getComponentStoreClasses() {
                var componentStores = this.componentStores;
                var classes = [];

                Object.keys(componentStores).forEach(function (injectionName) {
                    var storeClass = componentStores[injectionName];
                    if (classes.indexOf(storeClass) === -1) {
                        classes.push(storeClass);
                    }
                });
                return classes;
            }
        }, {
            key: 'dependencies',
            get: function () {
                var targetCls = this.targetCls;
                return [].concat(targetCls.dependencies || [], _Annotation2.getModuleNames(targetCls.components), _Annotation2.getModuleNames(this.getComponentStoreClasses()));
            }
        }, {
            key: 'template',
            get: function () {
                return this.targetCls.template || null;
            }
        }, {
            key: 'bindings',
            get: function () {
                return this.targetCls.bindings || null;
            }
        }, {
            key: 'events',
            get: function () {
                return this.targetCls.events || null;
            }
        }, {
            key: 'componentStores',
            get: function () {
                return this.targetCls.componentStores || {};
            }
        }, {
            key: 'module',
            get: function () {
                if (!this._module) {
                    var name = this.name;
                    var template = this.template;
                    var bindings = this.bindings;
                    var events = this.events;

                    this._module = _angular2.module('components.' + name, this.dependencies);

                    var directiveConfig = {
                        restrict: 'EA',
                        controllerAs: name,
                        bindToController: true,
                        scope: true,
                        controller: this.getInjectionTokens().concat([this.controllerCls])
                    };

                    if (template) {
                        if (template.url) {
                            directiveConfig.templateUrl = template.url;
                        } else if (template.inline) {
                            directiveConfig.template = template.inline;
                        }
                        if (template.replace) {
                            directiveConfig.replace = true;
                        }
                    }

                    if (bindings) {
                        var scope = directiveConfig.scope = {};
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = Object.keys(bindings)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var binding = _step.value;

                                var attr = bindings[binding];
                                scope[binding] = '=' + attr;
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator['return']) {
                                    _iterator['return']();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    }

                    if (events) {
                        directiveConfig.link = function (scope, el, attr, ctrl) {
                            var eventHandlers = ctrl._event_handlers = {};
                            Object.keys(events).forEach(function (event) {
                                if (attr[event]) {
                                    eventHandlers[events[event]] = function (locals) {
                                        scope.$parent.$eval(attr[event], locals);
                                    };
                                }
                            });
                        };
                    }

                    this._module.directive(name, function () {
                        return directiveConfig;
                    });

                    this.configure(this._module);
                }

                return this._module;
            }
        }]);

        return Component;
    })(_Annotation2);

    exports.Component = Component;
    exports['default'] = Component;
});
//# sourceMappingURL=component.js.map