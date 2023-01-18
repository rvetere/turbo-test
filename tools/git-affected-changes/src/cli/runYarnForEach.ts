import { execSync, spawn } from "child_process";
import path from "path";

const gitRoot = path.resolve(__dirname, "../../../../");
const args = process.argv.slice(2);
const ignoredModule = "iso-root";

// if changes occur inside these, all workspaces will run
const forceRunAllModules = [
  "@tools/git-affected-changes",
  "@tools/eslint-plugin",
];

const referenceCommitHash = execSync("git rev-parse origin/master")
  .toString()
  .trim();

console.log(
  "Run affected workspaces for origin/master (",
  referenceCommitHash,
  ")"
);

let runAllModules = false;
try {
  const workspaces = execSync(
    `yarn workspaces list --since=${referenceCommitHash} -R --json`,
    {
      cwd: gitRoot,
    }
  )
    .toString()
    .trim()
    .split("\n")
    .map((workspace) => JSON.parse(workspace).name)
    .filter((name) => name !== ignoredModule)
    .sort();

  if (workspaces.length === 0) {
    console.log("No workspaces affected");
    process.exit(0);
  }

  if (
    workspaces.find((workspaceName) =>
      forceRunAllModules.includes(workspaceName)
    )
  ) {
    runAllModules = true;
    console.log(
      [
        "All workspaces affected, due to changes inside at least one of:",
        ...forceRunAllModules,
      ].join("\n - ")
    );
  } else {
    console.log(
      `For ${workspaces.length} workspaces:\n - ${workspaces.join("\n - ")}`
    );
    console.log(
      `yarn workspaces foreach --since=${referenceCommitHash} -R`,
      args.join(" ")
    );
  }
} catch (err: unknown) {
  if (err instanceof Error) {
    console.log("sdterr", String((err as Error & { stderr: string }).stderr));
  }
}

const command = [
  "workspaces",
  "foreach",
  "--exclude",
  ignoredModule,
  runAllModules ? "" : "-R",
  runAllModules ? "" : `--since=${referenceCommitHash}`,
  ...args,
].filter(Boolean);
console.log(">", command.join(" "));

const childProcess = spawn("yarn", command, {
  stdio: "inherit",
  cwd: gitRoot,
});

childProcess.on("exit", (code) => {
  if (code) {
    console.log("🚨 Error running yarn workspaces foreach - error code", code);
  }
  process.exit(code || 0);
});
