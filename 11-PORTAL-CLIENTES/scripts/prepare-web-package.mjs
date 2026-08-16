import { cp, mkdir, readdir, rm, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const output = resolve(root, "release", "web", "ClientPortal-Web");

async function removeSensitiveFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await removeSensitiveFiles(path);
    else if (/^\.env(?:\..+)?$/i.test(entry.name) || /\.(?:pem|key|p12|pfx)$/i.test(entry.name)) {
      await rm(path, { force: true });
    }
  }
}
await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, "db"), { recursive: true });
await cp(resolve(root, ".next", "standalone"), resolve(output, "app"), { recursive: true });
await removeSensitiveFiles(resolve(output, "app"));
await copyFile(resolve(root, "db", "custom.db"), resolve(output, "db", "custom.db"));
await copyFile(process.execPath, resolve(output, "node.exe"));

const esbuild = resolve(root, "node_modules", "esbuild", "bin", "esbuild");
const bundle = spawnSync(process.execPath, [esbuild, "mini-services/chat-service/index.ts", "--bundle", "--platform=node", "--format=cjs", "--outfile=release/web/ClientPortal-Web/chat-server.cjs"], {
  cwd: root,
  stdio: "inherit",
});
if (bundle.status !== 0) process.exit(bundle.status || 1);

await writeFile(resolve(output, "start-portal.cmd"), `@echo off\r\nsetlocal\r\ncd /d "%~dp0"\r\nset "DATABASE_URL=file:%~dp0db/custom.db"\r\nset "NODE_ENV=production"\r\nset "HOSTNAME=127.0.0.1"\r\nset "PORT=3000"\r\nset "CHAT_ORIGINS=http://127.0.0.1:3000,http://localhost:3000"\r\nstart "ClientPortal Chat" /min "%~dp0node.exe" "%~dp0chat-server.cjs"\r\nstart "ClientPortal Web" /min "%~dp0node.exe" "%~dp0app\\server.js"\r\ntimeout /t 3 /nobreak >nul\r\nstart "" "http://127.0.0.1:3000"\r\nendlocal\r\n`);
await writeFile(resolve(output, "LEEME.txt"), `CLIENTPORTAL PRO - WEB FULL STACK\r\n\r\nEjecuta start-portal.cmd. Incluye Node, Next.js standalone, SQLite y chat en tiempo real.\r\nAdmin: admin@portal.com / Admin123!\r\nCliente: maria@techcorp.com / Cliente123!\r\n`);
console.log(output);
