import { execSync } from "child_process";
import path from "path";
import { getGitDiff } from "../gitChanges";

const diff = getGitDiff();
const { currentCommit, referenceCommit } = diff;

const gitRoot = path.resolve(__dirname, "../../../../");
// const args = process.argv.slice(2);

const referenceCommitHash = execSync("git rev-parse origin/master")
  .toString()
  .trim();

console.log(
  "Run affected workspaces for origin/master (",
  referenceCommitHash,
  ")"
);

try {
  const turboCommand = `turbo run build --filter='[${referenceCommit}...${currentCommit}]' --dry=json > ./.turbo-dry.json`;
  console.log({ turboCommand });

  const dryJson = execSync(turboCommand, {
    cwd: gitRoot,
  });
  console.log({ dryJson });
} catch (err: unknown) {
  if (err instanceof Error) {
    console.log("sdterr", String((err as Error & { stderr: string }).stderr));
  }
}