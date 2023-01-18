"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readGitDiff = exports.getGitDiff = exports.changedDependencies = void 0;
var changedDependencies_1 = require("./webpack-plugin/changedDependencies");
Object.defineProperty(exports, "changedDependencies", { enumerable: true, get: function () { return changedDependencies_1.changedDependencies; } });
var gitChanges_1 = require("./gitChanges");
Object.defineProperty(exports, "getGitDiff", { enumerable: true, get: function () { return gitChanges_1.getGitDiff; } });
Object.defineProperty(exports, "readGitDiff", { enumerable: true, get: function () { return gitChanges_1.readGitDiff; } });
//# sourceMappingURL=index.js.map