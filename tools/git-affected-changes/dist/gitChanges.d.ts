/**
 * Get the absolute paths for all files which have changed since master
 */
export declare const getGitDiff: () => {
    currentCommit: string;
    referenceCommit: string;
    referenceCommitHistory: string[];
    changes: string[];
    author: string;
    authorMail: string;
    message: string;
};
/**
 * Reads the `getGitDiff` result from disk for environments without git.
 * e.g. inside docker
 */
export declare const readGitDiff: (fileName: string) => {
    currentCommit?: string;
    referenceCommit?: string;
    referenceCommitHistory: string[];
    changes: string[];
    workSpaces: Record<string, string>;
    nodeModules: Record<string, string>;
    message: string;
    author: string;
    authorMail: string;
};
