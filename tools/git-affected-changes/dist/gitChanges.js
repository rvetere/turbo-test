"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readGitDiff = exports.getGitDiff = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
// @ts-expect-error
const js_yaml_1 = __importDefault(require("../dist/js-yaml"));
const execSyncTrimmed = (cmd) => String((0, child_process_1.execSync)(cmd, { maxBuffer: 1024 * 1024 * 10 })).trim();
const getCommitsToCompare = () => {
    const headCommitId = execSyncTrimmed(`git rev-parse HEAD`);
    const originCommitId = execSyncTrimmed(`git rev-parse origin/main`);
    // If origin/main is on the very same commit as HEAD
    // pick the previous master commit
    const compareCommit = headCommitId !== originCommitId
        ? originCommitId
        : execSyncTrimmed(`git rev-parse 'origin/main^'`);
    return {
        currentCommit: headCommitId,
        referenceCommit: compareCommit,
    };
};
/**
 * Get the absolute paths for all files which have changed since master
 */
const getGitDiff = () => {
    const { currentCommit, referenceCommit } = getCommitsToCompare();
    const diff = execSyncTrimmed(`git --no-pager diff --diff-filter=d --name-only ${referenceCommit} ${currentCommit}`);
    const changes = diff.split("\n").filter(Boolean);
    changes.sort();
    const { nodeModules, workSpaces } = changes.includes("yarn.lock")
        ? getYamlDiff(currentCommit, referenceCommit)
        : { nodeModules: {}, workSpaces: {} };
    const message = execSyncTrimmed(`git  show -s --format=%s`);
    const author = execSyncTrimmed(`git  show -s --format=%an`);
    const authorMail = execSyncTrimmed(`git  show -s --format=%ae`);
    const referenceCommitHistory = execSyncTrimmed(`git --no-pager log --format=%H --first-parent --max-count=30 ${referenceCommit}^`)
        .split("\n")
        .filter(Boolean);
    return {
        currentCommit,
        referenceCommit,
        referenceCommitHistory,
        message,
        author,
        authorMail,
        changes,
        nodeModules,
        workSpaces,
    };
};
exports.getGitDiff = getGitDiff;
/**
 * Reads the `getGitDiff` result from disk for environments without git.
 * e.g. inside docker
 */
const readGitDiff = (fileName) => {
    try {
        return JSON.parse((0, fs_1.readFileSync)(fileName, "utf-8"));
    }
    catch (e) {
        console.log("Could not read ", fileName);
        console.warn(e);
        return {
            currentCommit: undefined,
            referenceCommit: undefined,
            referenceCommitHistory: [],
            changes: [],
            nodeModules: {},
            workSpaces: {},
            message: "",
            author: "",
            authorMail: "",
        };
    }
};
exports.readGitDiff = readGitDiff;
const getYamlDiff = (currentCommit, referenceCommit) => {
    const fileName = "yarn.lock";
    const currentLockFile = execSyncTrimmed(`git show ${currentCommit}:${fileName}`);
    const previousLockFile = execSyncTrimmed(`git show ${referenceCommit}:${fileName}`);
    const currentLock = js_yaml_1.default.load(currentLockFile);
    const previousLock = js_yaml_1.default.load(previousLockFile);
    const currentVersion = Object.keys(currentLock);
    const previousVersion = Object.keys(previousLock);
    /** New Workspace Module Version  */
    const workSpaces = {};
    /** New NPM Node Module Version  */
    const nodeModules = {};
    currentVersion.forEach((dependency) => {
        if (previousVersion.includes(dependency)) {
            return;
        }
        const [prefix, name, registry] = dependency.match(/^(.[^@]+)@([^:]+)/) || [];
        const version = currentLock[dependency].version;
        const hadSameVersion = previousVersion.some((previousDependency) => previousDependency.startsWith(prefix) &&
            version === previousLock[previousDependency].version);
        if (hadSameVersion) {
            return;
        }
        if (registry === "workspace") {
            workSpaces[name] = version;
        }
        else {
            nodeModules[name] = version;
        }
    });
    return { nodeModules, workSpaces };
};
//# sourceMappingURL=gitChanges.js.map