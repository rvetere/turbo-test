"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const gitChanges_1 = require("../gitChanges");
// .git-changes in git root:
const fileName = path_1.default.resolve(__dirname, "../../../../.git-changes");
const diff = (0, gitChanges_1.getGitDiff)();
(0, fs_1.writeFileSync)(fileName, JSON.stringify(diff, null, 2));
const { currentCommit, referenceCommit, changes, nodeModules, message } = diff;
console.log(`🕵️  git comparison\n
  commit "${message}"
  head (${currentCommit}) vs origin/main (${referenceCommit})

  found ${changes.length} changed file${changes.length === 1 ? "" : "s"}${changes.length === 0 ? "." : ":\n  - " + changes.join("\n  - ")}`);
const moduleNames = Object.entries(nodeModules);
if (moduleNames.length > 0) {
    console.log(`\n  found ${moduleNames.length} new node_module${moduleNames.length === 1 ? "" : "s"}:\n  - ${moduleNames
        .map(([name, version]) => `${name}: ${version}`)
        .join("\n  - ")}
    `);
}
//# sourceMappingURL=generateGitDiff.js.map