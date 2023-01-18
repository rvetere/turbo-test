"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readGitDiff = exports.getGitDiff = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
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
//# sourceMappingURL=gitChanges.js.map