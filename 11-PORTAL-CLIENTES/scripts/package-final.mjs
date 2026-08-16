import { createHash } from "node:crypto";
import { copyFile, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { basename, relative, resolve } from "node:path";

const root = process.cwd();
const version = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")).version;
const release = resolve(root, "release");
const output = resolve(release, "final", `ClientPortal-Pro-${version}`);
const zip = resolve(release, "final", `ClientPortal-Pro-${version}.zip`);

async function exists(path) { try { await stat(path); return true; } catch { return false; } }
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path)); else files.push(path);
  }
  return files;
}

const artifacts = [
  [resolve(release, "web", "ClientPortal-Web"), resolve(output, "Web-Portable")],
  [resolve(release, "windows"), resolve(output, "Windows")],
  [resolve(release, "android", "ClientPortal-Pro.apk"), resolve(output, "Android", "ClientPortal-Pro.apk")],
  [resolve(release, "AUDITORIA-500.json"), resolve(output, "Verificacion", "AUDITORIA-500.json")],
  [resolve(release, "AUDITORIA-500.md"), resolve(output, "Verificacion", "AUDITORIA-500.md")],
];
for (const [source] of artifacts) if (!(await exists(source))) throw new Error(`Artefacto requerido ausente: ${source}`);

await rm(output, { recursive: true, force: true });
await rm(zip, { force: true });
for (const [source, destination] of artifacts) {
  const info = await stat(source);
  await mkdir(resolve(destination, ".."), { recursive: true });
  if (info.isDirectory()) await cp(source, destination, { recursive: true }); else await copyFile(source, destination);
}

const files = await walk(output);
const forbidden = files.filter((path) => /^\.env(?:\..+)?$/i.test(basename(path)) || /\.(?:pem|key|p12|pfx)$/i.test(path));
if (forbidden.length) throw new Error(`Archivos sensibles bloqueados: ${forbidden.join(", ")}`);

const manifest = [];
for (const path of files) {
  const content = await readFile(path);
  manifest.push({ path: relative(output, path).replaceAll("\\", "/"), bytes: content.length, sha256: createHash("sha256").update(content).digest("hex") });
}
await writeFile(resolve(output, "MANIFEST.json"), JSON.stringify({ version, generatedAt: new Date().toISOString(), files: manifest }, null, 2));
await writeFile(resolve(output, "LEEME.txt"), [
  "CLIENTPORTAL PRO - PAQUETE FINAL",
  "",
  "Web portable: Web-Portable\\start-portal.cmd",
  "Windows: Windows\\ (instalador NSIS y portable)",
  "Android: Android\\ClientPortal-Pro.apk (debug local, no firmado para tienda)",
  "Verificacion: Verificacion\\AUDITORIA-500.md",
  "",
  "Los datos incluidos son de demostracion. Cambia las credenciales antes de usarlo en produccion.",
].join("\r\n"));

const escapedOutput = output.replaceAll("'", "''");
const escapedZip = zip.replaceAll("'", "''");
const compressed = spawnSync("powershell", ["-NoProfile", "-Command", `Compress-Archive -LiteralPath '${escapedOutput}' -DestinationPath '${escapedZip}' -CompressionLevel Optimal -Force`], { stdio: "inherit" });
if (compressed.status !== 0 || !(await exists(zip))) process.exit(compressed.status || 1);
const zipContent = await readFile(zip);
console.log(JSON.stringify({ zip, bytes: zipContent.length, sha256: createHash("sha256").update(zipContent).digest("hex"), files: manifest.length + 2 }));
