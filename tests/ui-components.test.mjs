import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

async function readCssTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return readCssTree(entryPath);
      }
      return entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
    }),
  );
  return contents.join("\n");
}

test("emits the Rise admin and accessibility styles", async () => {
  const css = await readCssTree(path.join(root, "dist"));

  assert.match(css, /\.admin-page/);
  assert.match(css, /\.admin-record/);
  assert.match(css, /\.status-confirmed/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("forwards progress semantics to the primitive", async () => {
  const source = await readFile(path.join(root, "components/ui/progress.tsx"), "utf8");

  assert.match(source, /<ProgressPrimitive\.Root[\s\S]*value=\{value\}/);
  assert.match(source, /<ProgressPrimitive\.Root[\s\S]*\{\.\.\.props\}/);
  assert.match(source, /data-slot="progress-indicator"/);
  assert.match(source, /translateX\(-\$\{100 - \(value \?\? 0\)\}%\)/);
});

test("emits chart themes for the starter's media dark mode", async () => {
  const source = await readFile(path.join(root, "components/ui/chart.tsx"), "utf8");

  assert.match(source, /dark:\s*"\(prefers-color-scheme: dark\)"/);
  assert.match(source, /\[data-chart=\$\{id\}\]/);
  assert.match(source, /@media \$\{media\}/);
  assert.doesNotMatch(source, /THEMES[\s\S]*\.dark\s*\{/);
});

test("renders sidebar skeletons deterministically", async () => {
  const source = await readFile(path.join(root, "components/ui/sidebar.tsx"), "utf8");

  assert.match(source, /function SidebarMenuSkeleton\([\s\S]*const width = "70%"/);
  assert.match(source, /data-sidebar="menu-skeleton-text"/);
  assert.match(source, /"--skeleton-width": width/);
});
