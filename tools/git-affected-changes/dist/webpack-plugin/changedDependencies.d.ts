/**
 * NextJs Webpack Plugin to find all modules
 * which have either changed or use dependencies that changed since master
 */
export declare const changedDependencies: ({ outputFilename, changedFiles, moduleFilter, dependencyFilter, gitRoot, }: {
    outputFilename: string;
    moduleFilter: (filePath: string) => boolean;
    changedFiles: string[];
    dependencyFilter?: ((filePath: string) => boolean) | undefined;
    gitRoot: string;
}) => (compiler: any) => void;
