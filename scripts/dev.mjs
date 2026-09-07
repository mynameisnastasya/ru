import { spawn } from "node:child_process";
// Keep normal Next.js development compatible with the supervised preview flags.
const args = process.argv
  .slice(2)
  .filter((arg) => arg !== "--strictPort")
  .map((arg) => (arg === "--host" ? "--hostname" : arg));
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--webpack", ...args],
  { stdio: "inherit", env: process.env },
);
child.on("exit", (code) => process.exit(code ?? 1));
process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGINT"));
