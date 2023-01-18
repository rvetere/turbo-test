"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const gitRoot = path_1.default.resolve(__dirname, "../../../../");
const args = process.argv.slice(2);
const ignoredModule = "iso-root";
// if changes occur inside these, all workspaces will run
const forceRunAllModules = [
    "@tools/git-affected-changes",
    "@tools/eslint-plugin",
];
const referenceCommitHash = (0, child_process_1.execSync)("git rev-parse origin/main")
    .toString()
    .trim();
console.log("Run affected workspaces for origin/main (", referenceCommitHash, ")");
let runAllModules = false;
try {
    const workspaces = (0, child_process_1.execSync)(`yarn workspaces list --since=${referenceCommitHash} -R --json`, {
        cwd: gitRoot,
    })
        .toString()
        .trim()
        .split("\n")
        .map((workspace) => JSON.parse(workspace).name)
        .filter((name) => name !== ignoredModule)
        .sort();
    if (workspaces.length === 0) {
        console.log("No workspaces affected");
        process.exit(0);
    }
    if (workspaces.find((workspaceName) => forceRunAllModules.includes(workspaceName))) {
        runAllModules = true;
        console.log([
            "All workspaces affected, due to changes inside at least one of:",
            ...forceRunAllModules,
        ].join("\n - "));
    }
    else {
        console.log(`For ${workspaces.length} workspaces:\n - ${workspaces.join("\n - ")}`);
        console.log(`yarn workspaces foreach --since=${referenceCommitHash} -R`, args.join(" "));
    }
}
catch (err) {
    if (err instanceof Error) {
        console.log("sdterr", String(err.stderr));
    }
}
const command = [
    "workspaces",
    "foreach",
    "--exclude",
    ignoredModule,
    runAllModules ? "" : "-R",
    runAllModules ? "" : `--since=${referenceCommitHash}`,
    ...args,
].filter(Boolean);
console.log(">", command.join(" "));
const childProcess = (0, child_process_1.spawn)("yarn", command, {
    stdio: "inherit",
    cwd: gitRoot,
});
childProcess.on("exit", (code) => {
    if (code) {
        console.log("🚨 Error running yarn workspaces foreach - error code", code);
    }
    process.exit(code || 0);
});
//# sourceMappingURL=runYarnForEach.js.map