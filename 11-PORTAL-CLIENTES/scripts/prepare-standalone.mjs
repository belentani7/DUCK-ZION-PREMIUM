import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const standalone = resolve(root, ".next", "standalone");

async function removeSensitiveFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await removeSensitiveFiles(path);
    else if (/^\.env(?:\..+)?$/i.test(entry.name) || /\.(?:pem|key|p12|pfx)$/i.test(entry.name)) {
      await rm(path, { force: true });
    }
  }
}

await mkdir(resolve(standalone, ".next"), { recursive: true });
await rm(resolve(standalone, ".next", "static"), { recursive: true, force: true });
await rm(resolve(standalone, "public"), { recursive: true, force: true });
await cp(resolve(root, ".next", "static"), resolve(standalone, ".next", "static"), { recursive: true });
await cp(resolve(root, "public"), resolve(standalone, "public"), { recursive: true });
await removeSensitiveFiles(standalone);
console.log("Standalone assets prepared.");
