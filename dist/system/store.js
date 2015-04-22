var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

System.register(['angular', './annotation'], function (_export) {
    var angular, Annotation, _bind, _toConsumableArray, _classCallCheck, _createClass, _get, _inherits, Store;

    return {
        setters: [function (_angular) {
            angular = _angular['default'];
        }, function (_annotation) {
            Annotation = _annotation['default'];
        }],
        execute: function () {
            'use strict';

            _bind = Function.prototype.bind;

            _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

            _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

            _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

            _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _defaults(subClass, superClass); };

            Store = (function (_Annotation) {
                function Store() {
                    _classCallCheck(this, Store);

                    if (_Annotation != null) {
                        _Annotation.apply(this, arguments);
                    }
                }

                _inherits(Store, _Annotation);

                _createClass(Store, [{
                    key: 'serviceName',
                    get: function () {
                        var name = this.name;
                        return name[0].toUpperCase() + name.slice(1) + 'Store';
                    }
                }, {
                    key: 'getInjectionTokens',
                    value: function getInjectionTokens() {
                        return ['LuxyFlux', 'LuxyFluxStore', 'ApplicationDispatcher'].concat(_get(Object.getPrototypeOf(Store.prototype), 'getInjectionTokens', this).call(this));
                    }
                }, {
                    key: 'factoryFn',
                    get: function () {
                        var TargetCls = this.targetCls;
                        var annotation = this;

                        return function (LuxyFlux, LuxyFluxStore, ApplicationDispatcher) {
                            var injected = Array.from(arguments).slice(3);
                            var instance = new (_bind.apply(TargetCls, [null].concat(_toConsumableArray(injected))))();

                            annotation.applyInjectionBindings(instance, injected);
                            annotation.applyDecorators(instance);

                            return LuxyFlux.createStore({
                                name: 'store.' + annotation.name,
                                dispatcher: ApplicationDispatcher,
                                handlers: TargetCls.handlers,
                                decorate: instance
                            }, LuxyFluxStore);
                        };
                    }
                }, {
                    key: 'module',
                    get: function () {
                        if (!this._module) {
                            this._module = angular.module('stores.' + this.name, this.dependencies);

                            this._module.factory(this.serviceName, this.getInjectionTokens().concat([this.factoryFn]));

                            this.configure(this._module);
                        }
                        return this._module;
                    }
                }]);

                return Store;
            })(Annotation);

            _export('Store', Store);

            _export('default', Store);
        }
    };
});
//# sourceMappingURL=store.js.map