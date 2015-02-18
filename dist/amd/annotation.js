define(["exports"], function (exports) {
    "use strict";

    var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var Annotation = exports.Annotation = (function () {
        function Annotation(name, targetCls) {
            _classCallCheck(this, Annotation);

            this.name = name;
            this.targetCls = targetCls;
        }

        _prototypeProperties(Annotation, null, {
            injections: {
                get: function () {
                    return this.targetCls.injections || {};
                },
                configurable: true
            },
            decorators: {
                get: function () {
                    return this.targetCls.decorators || [];
                },
                configurable: true
            },
            dependencies: {
                get: function () {
                    return this.targetCls.dependencies || [];
                },
                configurable: true
            }
        });

        return Annotation;
    })();
    exports["default"] = Annotation;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
});
//# sourceMappingURL=annotation.js.map