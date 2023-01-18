import { mkdirSync, writeFileSync } from "fs";
import path from "path";

// Unfortuantely nextjs does not ship webpack types
// @see node_modules/next/dist/compiled/webpack/webpack.d.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * NextJs Webpack Plugin to find all modules
 * which have either changed or use dependencies that changed since master
 */
export const changedDependencies =
  ({
    outputFilename,
    changedFiles,
    moduleFilter,
    dependencyFilter = () => true,
    gitRoot,
  }: {
    outputFilename: string;
    moduleFilter: (filePath: string) => boolean;
    changedFiles: string[];
    dependencyFilter?: (filePath: string) => boolean;
    gitRoot: string;
  }) =>
  (compiler: any) => {
    compiler.hooks.compilation.tap(
      "changed-dependencies",
      (compilation: any) => {
        compilation.hooks.optimizeModules.tap(
          "changed-dependencies",
          (modules: any) => {
            const isChangedResource = (filename: string) =>
              changedFiles.includes(path.relative(gitRoot, filename));

            /**
             * keeps track wether a given module has been changed
             */
            const affectedModules = new Map<(typeof modules)[0], boolean>();

            /**
             * Get all file paths of all dependencies for the given webpack module
             *
             * Depth First Recursive search through all dependencies to find the first
             * modified resource.
             */
            const isChangeAffectedModule = (
              initialModule: any,
              knownModules = new WeakSet()
            ) => {
              // Return change flag from cache if possible:
              const affectedModulesFromCache =
                affectedModules.get(initialModule);
              if (affectedModulesFromCache !== undefined) {
                return affectedModulesFromCache;
              }

              // Ignore already known modules to prevent infinity recursions
              // caused by circular dependencies
              if (knownModules.has(initialModule)) {
                return false;
              }
              knownModules.add(initialModule);

              const resource = initialModule.resource;
              // Exclude dependencies by filter option
              if (!resource || !dependencyFilter(resource)) {
                affectedModules.set(initialModule, false);
                return false;
              }

              // Skip dependency checking if the module was changed itself
              if (isChangedResource(resource)) {
                affectedModules.set(initialModule, true);
                return true;
              }
              // Check recursively if any dependency is affected
              const dependencies = initialModule.dependencies || [];
              for (const dependency of dependencies) {
                const dependencyModule =
                  compilation.moduleGraph.getModule(dependency);
                if (
                  dependencyModule &&
                  isChangeAffectedModule(dependencyModule, knownModules)
                ) {
                  affectedModules.set(initialModule, true);
                  return true;
                }
              }
              return false;
            };

            const affectedMatchingModules: Record<string, boolean> = {};
            const hasGitChanges = changedFiles.length > 0;
            modules.forEach((webpackModule: any) => {
              const resource = webpackModule.resource;
              if (!resource || !moduleFilter(resource)) {
                return;
              }
              const relativeModulePath = path.relative(gitRoot, resource);
              affectedMatchingModules[relativeModulePath] =
                hasGitChanges && isChangeAffectedModule(webpackModule);
            });

            mkdirSync(path.dirname(outputFilename), { recursive: true });
            writeFileSync(
              outputFilename,
              JSON.stringify(sortObjectByKey(affectedMatchingModules), null, 2)
            );
          }
        );
      }
    );
  };

function sortObjectByKey<T extends Record<string, unknown>>(obj: T): T {
  return Object.keys(obj)
    .sort()
    .reduce(function (result, key: keyof T) {
      result[key] = obj[key];
      return result;
    }, {} as T);
}
