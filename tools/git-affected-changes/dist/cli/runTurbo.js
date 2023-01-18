"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const gitChanges_1 = require("../gitChanges");
const diff = (0, gitChanges_1.getGitDiff)();
const { currentCommit, referenceCommit } = diff;
const gitRoot = path_1.default.resolve(__dirname, "../../../../");
// const args = process.argv.slice(2);
const referenceCommitHash = (0, child_process_1.execSync)("git rev-parse origin/main")
    .toString()
    .trim();
console.log("Run affected workspaces for origin/main (", referenceCommitHash, ")");
try {
    const turboCommand = `turbo run build --filter='[${referenceCommit}...${currentCommit}]' --filter=!@tools/git-affected-changes --dry=json`;
    const dryJson = (0, child_process_1.execSync)(turboCommand, {
        cwd: gitRoot,
    });
    console.log({ dryJson: dryJson.toString() });
}
catch (err) {
    if (err instanceof Error) {
        console.log("sdterr", String(err.stderr));
    }
}
//# sourceMappingURL=runTurbo.js.map