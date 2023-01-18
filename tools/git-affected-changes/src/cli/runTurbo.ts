import { execSync } from "child_process";
import path from "path";
import { getGitDiff } from "../gitChanges";

const diff = getGitDiff();
const { currentCommit, referenceCommit } = diff;

const gitRoot = path.resolve(__dirname, "../../../../");
// const args = process.argv.slice(2);

const referenceCommitHash = execSync("git rev-parse origin/main")
  .toString()
  .trim();

console.log(
  "Run affected workspaces for origin/main (",
  referenceCommitHash,
  ")"
);

try {
  const turboCommand = `turbo run build --filter='[${referenceCommit}...${currentCommit}]' --filter=!@tools/git-affected-changes --dry=json`;
  const dryJson = execSync(turboCommand, {
    cwd: gitRoot,
  });
  console.log({ dryJson: dryJson.toString() });
} catch (err: unknown) {
  if (err instanceof Error) {
    console.log("sdterr", String((err as Error & { stderr: string }).stderr));
  }
}
