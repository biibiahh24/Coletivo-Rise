import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteCli = path.join(root, "node_modules", "vite", "bin", "vite.js");
const result = spawnSync(process.execPath, [viteCli, "build", "--config", "vite.config.vercel.ts"], {
  cwd: root,
  env: { ...process.env, NITRO_PRESET: "vercel" },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
