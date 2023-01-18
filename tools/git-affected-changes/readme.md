# @tools/git-affected-changes

`@tools/git-affected` is used in Azure pipelines to compare
file changes between `origin/master` and the latest commit.

There is one exception in case that the latest commit is the same
as `origin/master`. In that case it compares against the commit
against the previous `origin/master` commit.

## next.js webpack-plugin

The [custom next.js webpack plugin](./src/webpack-plugin/changedDependencies.ts) uses webpacks
dependency graph to identify code which is affected by the git file changes.

As the next.js build is executed inside a docker file it is
not possible to acces git information directly from within
the plugin.

To workaround the missing git limitation a cli generates a
static json file containing the current git diff.

## cli

The [cli](./src/cli/generateGitDiff.ts) generates a `.git-changes` file containing all
changed files, all new created workspaces and all new installed node modules.

On Azure `yarn install` takes 90s (June 2022) although the cli has only
one dependency to `js-yaml`.
To get arround the 90s installation time `js-yaml` is copied
to the dist folder.
