import { execSync } from "child_process";
import { readFileSync } from "fs";
// @ts-expect-error
import Yaml from "../dist/js-yaml";

const execSyncTrimmed = (cmd: string) =>
  String(execSync(cmd, { maxBuffer: 1024 * 1024 * 10 })).trim();

const getCommitsToCompare = () => {
  const headCommitId = execSyncTrimmed(`git rev-parse HEAD`);
  const originCommitId = execSyncTrimmed(`git rev-parse origin/main`);

  // If origin/main is on the very same commit as HEAD
  // pick the previous master commit
  const compareCommit =
    headCommitId !== originCommitId
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
export const getGitDiff = (): {
  currentCommit: string;
  referenceCommit: string;
  referenceCommitHistory: string[];
  changes: string[];
  author: string;
  authorMail: string;
  message: string;
  workSpaces: Record<string, string>;
  nodeModules: Record<string, string>;
} => {
  const { currentCommit, referenceCommit } = getCommitsToCompare();

  const diff = execSyncTrimmed(
    `git --no-pager diff --diff-filter=d --name-only ${referenceCommit} ${currentCommit}`
  );
  const changes = diff.split("\n").filter(Boolean);
  changes.sort();

  const { nodeModules, workSpaces } = changes.includes("yarn.lock")
    ? getYamlDiff(currentCommit, referenceCommit)
    : { nodeModules: {}, workSpaces: {} };

  const message = execSyncTrimmed(`git  show -s --format=%s`);
  const author = execSyncTrimmed(`git  show -s --format=%an`);
  const authorMail = execSyncTrimmed(`git  show -s --format=%ae`);
  const referenceCommitHistory = execSyncTrimmed(
    `git --no-pager log --format=%H --first-parent --max-count=30 ${referenceCommit}^`
  )
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

/**
 * Reads the `getGitDiff` result from disk for environments without git.
 * e.g. inside docker
 */
export const readGitDiff = (
  fileName: string
): {
  currentCommit?: string;
  referenceCommit?: string;
  referenceCommitHistory: string[];
  changes: string[];
  workSpaces: Record<string, string>;
  nodeModules: Record<string, string>;
  message: string;
  author: string;
  authorMail: string;
} => {
  try {
    return JSON.parse(readFileSync(fileName, "utf-8"));
  } catch (e) {
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

const getYamlDiff = (currentCommit: string, referenceCommit: string) => {
  const fileName = "yarn.lock";
  const currentLockFile = execSyncTrimmed(
    `git show ${currentCommit}:${fileName}`
  );
  const previousLockFile = execSyncTrimmed(
    `git show ${referenceCommit}:${fileName}`
  );

  const currentLock = Yaml.load(currentLockFile) as Record<
    string,
    { version: string }
  >;
  const previousLock = Yaml.load(previousLockFile) as Record<
    string,
    { version: string }
  >;
  const currentVersion = Object.keys(currentLock);
  const previousVersion = Object.keys(previousLock);
  /** New Workspace Module Version  */
  const workSpaces: Record<string, string> = {};
  /** New NPM Node Module Version  */
  const nodeModules: Record<string, string> = {};
  currentVersion.forEach((dependency) => {
    if (previousVersion.includes(dependency)) {
      return;
    }
    const [prefix, name, registry] =
      dependency.match(/^(.[^@]+)@([^:]+)/) || [];

    const version = currentLock[dependency].version;
    const hadSameVersion = previousVersion.some(
      (previousDependency) =>
        previousDependency.startsWith(prefix) &&
        version === previousLock[previousDependency].version
    );
    if (hadSameVersion) {
      return;
    }
    if (registry === "workspace") {
      workSpaces[name] = version;
    } else {
      nodeModules[name] = version;
    }
  });

  return { nodeModules, workSpaces };
};
