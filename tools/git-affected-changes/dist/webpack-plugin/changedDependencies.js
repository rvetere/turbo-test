"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changedDependencies = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Unfortuantely nextjs does not ship webpack types
// @see node_modules/next/dist/compiled/webpack/webpack.d.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NextJs Webpack Plugin to find all modules
 * which have either changed or use dependencies that changed since master
 */
const changedDependencies = ({ outputFilename, changedFiles, moduleFilter, dependencyFilter = () => true, gitRoot, }) => (compiler) => {
    compiler.hooks.compilation.tap("changed-dependencies", (compilation) => {
        compilation.hooks.optimizeModules.tap("changed-dependencies", (modules) => {
            const isChangedResource = (filename) => changedFiles.includes(path_1.default.relative(gitRoot, filename));
            /**
             * keeps track wether a given module has been changed
             */
            const affectedModules = new Map();
            /**
             * Get all file paths of all dependencies for the given webpack module
             *
             * Depth First Recursive search through all dependencies to find the first
             * modified resource.
             */
            const isChangeAffectedModule = (initialModule, knownModules = new WeakSet()) => {
                // Return change flag from cache if possible:
                const affectedModulesFromCache = affectedModules.get(initialModule);
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
                    const dependencyModule = compilation.moduleGraph.getModule(dependency);
                    if (dependencyModule &&
                        isChangeAffectedModule(dependencyModule, knownModules)) {
                        affectedModules.set(initialModule, true);
                        return true;
                    }
                }
                return false;
            };
            const affectedMatchingModules = {};
            const hasGitChanges = changedFiles.length > 0;
            modules.forEach((webpackModule) => {
                const resource = webpackModule.resource;
                if (!resource || !moduleFilter(resource)) {
                    return;
                }
                const relativeModulePath = path_1.default.relative(gitRoot, resource);
                affectedMatchingModules[relativeModulePath] =
                    hasGitChanges && isChangeAffectedModule(webpackModule);
            });
            (0, fs_1.mkdirSync)(path_1.default.dirname(outputFilename), { recursive: true });
            (0, fs_1.writeFileSync)(outputFilename, JSON.stringify(sortObjectByKey(affectedMatchingModules), null, 2));
        });
    });
};
exports.changedDependencies = changedDependencies;
function sortObjectByKey(obj) {
    return Object.keys(obj)
        .sort()
        .reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}
//# sourceMappingURL=changedDependencies.js.map