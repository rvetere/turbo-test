import { writeFileSync } from "fs";
import path from "path";
import { getGitDiff } from "../gitChanges";

// .git-changes in git root:
const fileName = path.resolve(__dirname, "../../../../.git-changes");
const diff = getGitDiff();

writeFileSync(fileName, JSON.stringify(diff, null, 2));

const { currentCommit, referenceCommit, changes, nodeModules, message } = diff;
console.log(
  `🕵️  git comparison\n
  commit "${message}"
  head (${currentCommit}) vs origin/main (${referenceCommit})

  found ${changes.length} changed file${changes.length === 1 ? "" : "s"}${
    changes.length === 0 ? "." : ":\n  - " + changes.join("\n  - ")
  }`
);

const moduleNames = Object.entries(nodeModules);
if (moduleNames.length > 0) {
  console.log(
    `\n  found ${moduleNames.length} new node_module${
      moduleNames.length === 1 ? "" : "s"
    }:\n  - ${moduleNames
      .map(([name, version]) => `${name}: ${version}`)
      .join("\n  - ")}
    `
  );
}
