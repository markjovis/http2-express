'use strict';

const createHttp2Express = require('./core');

module.exports = createHttp2Express;
// Fix: attach .default to module.exports (not to the detached `exports` binding).
// After `module.exports = X`, the `exports` variable no longer refers to module.exports,
// so `exports.default = X` would write to an orphaned object with no effect.
module.exports.default = createHttp2Express;
