define(['exports', '../utils'], function (exports, _utils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  exports.Transformable = Transformable;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Transformer = (function () {
    function Transformer(name, fn) {
      var weight = arguments.length <= 2 || arguments[2] === undefined ? 100 : arguments[2];

      _classCallCheck(this, Transformer);

      this.name = name;
      this.fn = fn;
      this.weight = weight;
    }

    _createClass(Transformer, [{
      key: 'exec',
      value: function exec(value) {
        return this.fn(value);
      }
    }]);

    return Transformer;
  })();

  exports.Transformer = Transformer;

  var TransformableCollection = (function () {
    function TransformableCollection() {
      _classCallCheck(this, TransformableCollection);

      this.transformed = [];
      this.transformers = [];
    }

    _createClass(TransformableCollection, [{
      key: 'addTransformer',
      value: function addTransformer(transformer) {
        this.insertTransformer(transformer);
      }
    }, {
      key: 'insertTransformer',
      value: function insertTransformer(transformer) {
        if (this.transformers.indexOf(transformer) === -1) {
          this.transformers.push(transformer);

          this.transformers.sort(function (transA, transB) {
            if (transA.weight > transB.weight) {
              return 1;
            } else if (transA.weight < transB.weight) {
              return -1;
            }
            return 0;
          });

          this.refresh();
        }
      }
    }, {
      key: 'removeTransformer',
      value: function removeTransformer(transformer) {
        var index = this.transformers.indexOf(transformer);
        if (index >= 0) {
          this.transformers.splice(index, 1);
          this.refresh();
        }
      }
    }, {
      key: 'clearTransformers',
      value: function clearTransformers() {
        this.transformers.splice(0, this.transformers.length);
        this.refresh();
      }
    }, {
      key: 'refresh',
      value: function refresh() {
        var transformed = this.data.slice();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.transformers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var transformer = _step.value;

            transformed = transformer.exec(transformed);
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

        this.transformed = transformed;
      }
    }, {
      key: 'data',
      set: function set(data) {
        this._data = data;
        this.refresh();
      },
      get: function get() {
        if (!this._data) {
          this._data = [];
        }
        return this._data;
      }
    }]);

    return TransformableCollection;
  })();

  exports.TransformableCollection = TransformableCollection;

  function Transformable() {
    return function (cls, propertyName) {
      var transformableDescriptor = {
        get: function get() {
          return this.transformables[propertyName].transformed;
        },
        set: function set(data) {
          this.transformables[propertyName].data = data;
        }
      };

      (0, _utils.addStaticGetterArrayMember)(cls.constructor, 'transformers', propertyName);

      if (!Reflect.getOwnPropertyDescriptor(cls, 'transformables')) {
        Reflect.defineProperty(cls, 'transformables', {
          get: function get() {
            if (!this._transformables) {
              this._transformables = {};
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = cls.constructor.transformers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var transformer = _step2.value;

                  this._transformables[transformer] = new TransformableCollection();
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                    _iterator2['return']();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }
            }
            return this._transformables;
          }
        });
      }

      if (!Reflect.getOwnPropertyDescriptor(cls, propertyName)) {
        Reflect.defineProperty(cls, propertyName, transformableDescriptor);
      }

      return transformableDescriptor;
    };
  }
});
//# sourceMappingURL=transformable.js.map
