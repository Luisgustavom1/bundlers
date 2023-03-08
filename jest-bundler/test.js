const modules = new Map();
const define = (name, moduleFactory) => {
    modules.set(name, moduleFactory);
}

const moduleCache = new Map();
const requireModule = (name) => {
    if (moduleCache.has(name)) {
        return modules.get(name).exports;
    }

    if (!modules.has(name)) {
        throw new Error(`Module ${name} does not exists`);
    }

    const moduleFactory = modules.get(name);

    const module = {
        exports: {},
    };

    moduleCache.set(name, module);

    moduleFactory(module, module.exports, requireModule);
    
    return module.exports;
}
define(5, function(module, exports, require) {
"use strict";

module.exports = "Shared file";})
define(4, function(module, exports, require) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _index = _interopRequireDefault(require(5));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = `Lib 2 depends on ${_index.default}`;
exports.default = _default;})
define(3, function(module, exports, require) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _lib = _interopRequireDefault(require(4));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = "lib 3 -> " + _lib.default;
exports.default = _default;})
define(2, function(module, exports, require) {
"use strict";

module.exports = "config string";})
define(1, function(module, exports, require) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _lib = _interopRequireDefault(require(3));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const app = config => {
  console.log('app config -> ', config);
  console.log(_lib.default);
};
var _default = app;
exports.default = _default;})
define(0, function(module, exports, require) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _index = _interopRequireDefault(require(1));
var _configs = _interopRequireDefault(require(2));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const port = 3000;
var _default = {
  app: (0, _index.default)({
    options: _configs.default,
    port
  })
};
exports.default = _default;})
requireModule(0);