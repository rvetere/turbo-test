import { execSync } from "child_process";
import path from "path";
import { getGitDiff } from "../gitChanges";

const diff = getGitDiff();
const { currentCommit } = diff;

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

console.log({ referenceCommitHash, currentCommit });

try {
  console.log(
    `Run turbo dry run with --filter='[${referenceCommitHash}...${currentCommit}]'`
  );

  const turboCommand = `turbo run build --filter='[${referenceCommitHash}...${currentCommit}]' --filter=!@tools/git-affected-changes --dry=json`;
  const dryJsonStr = execSync(turboCommand, {
    cwd: gitRoot,
  });
  const dryJson = JSON.parse(dryJsonStr.toString());
  console.log({ dryJson });
} catch (err: unknown) {
  if (err instanceof Error) {
    console.log("sdterr", String((err as Error & { stderr: string }).stderr));
  }
}
