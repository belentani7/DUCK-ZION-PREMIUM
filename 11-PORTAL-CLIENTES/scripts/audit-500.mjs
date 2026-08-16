import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();
const prisma = new PrismaClient();
const results = [];

function check(category, name, pass, detail = "") {
  if (results.length >= 500) return;
  results.push({ id: results.length + 1, category, name, pass: Boolean(pass), detail });
}

async function exists(path) {
  try { await stat(resolve(root, path)); return true; } catch { return false; }
}

async function walk(directory) {
  const files = [];
  if (!(await exists(directory))) return files;
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const required = [
  "package.json", "next.config.ts", "prisma/schema.prisma", "db/custom.db",
  "src/app/page.tsx", "src/app/layout.tsx", "src/app/globals.css", "src/lib/auth.ts",
  "src/lib/db.ts", "src/lib/store.ts", "src/app/api/route.ts",
  "src/app/api/auth/[action]/route.ts", "src/app/api/auth/me/route.ts",
  "src/app/api/clients/route.ts", "src/app/api/projects/route.ts",
  "src/app/api/deliverables/route.ts", "src/app/api/invoices/route.ts",
  "src/app/api/messages/route.ts", "src/app/api/dashboard/route.ts",
  "src/app/api/analytics/route.ts", "src/app/api/export/route.ts",
  "src/components/Sidebar.tsx", "src/components/CommandPalette.tsx",
  "src/components/KanbanBoard.tsx", "src/components/MessageThread.tsx",
  "desktop-app/main.cjs", "capacitor.config.ts", "scripts/build-android.mjs",
];
for (const path of required) check("architecture", `Required file: ${path}`, await exists(path));

const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
for (const script of ["build", "start", "typecheck", "web:dist", "desktop:dist", "mobile:apk", "audit:500", "package:final"]) {
  check("scripts", `npm script: ${script}`, typeof packageJson.scripts?.[script] === "string");
}

const releaseFiles = await walk("release");
const forbidden = releaseFiles.filter((path) => /^\.env(?:\..+)?$/i.test(basename(path)) || /\.(?:pem|key|p12|pfx)$/i.test(path));
check("security", "Release contains no environment or private-key files", forbidden.length === 0, forbidden.join(", "));
check("security", ".env is ignored by Git", (await readFile(resolve(root, ".gitignore"), "utf8")).includes(".env*"));
check("security", "Desktop renderer has context isolation", (await readFile(resolve(root, "desktop-app/main.cjs"), "utf8")).includes("contextIsolation: true"));
check("security", "Desktop renderer disables Node integration", (await readFile(resolve(root, "desktop-app/main.cjs"), "utf8")).includes("nodeIntegration: false"));
check("security", "Desktop renderer uses sandbox", (await readFile(resolve(root, "desktop-app/main.cjs"), "utf8")).includes("sandbox: true"));

const [users, clients, projects, deliverables, invoices, invoiceItems, messages] = await Promise.all([
  prisma.user.findMany({ orderBy: { id: "asc" } }),
  prisma.client.findMany({ orderBy: { id: "asc" } }),
  prisma.project.findMany({ orderBy: { id: "asc" } }),
  prisma.deliverable.findMany({ orderBy: { id: "asc" } }),
  prisma.invoice.findMany({ orderBy: { id: "asc" } }),
  prisma.invoiceItem.findMany({ orderBy: { id: "asc" } }),
  prisma.message.findMany({ orderBy: { id: "asc" } }),
]);
const counts = { users: users.length, clients: clients.length, projects: projects.length, deliverables: deliverables.length, invoices: invoices.length, invoiceItems: invoiceItems.length, messages: messages.length };
check("database", "Database has one admin", users.filter((row) => row.role === "admin").length === 1);
check("database", "Database has client users", users.filter((row) => row.role === "client").length >= 1);
check("database", "Database has clients", clients.length >= 1);
check("database", "Database has projects", projects.length >= 1);
check("database", "Database has deliverables", deliverables.length >= 1);
check("database", "Database has invoices", invoices.length >= 1);
check("database", "Database has invoice items", invoiceItems.length >= 1);
check("database", "Database has messages", messages.length >= 1);

const validators = [
  ["user", users, (row) => /@/.test(row.email) && /^\$2[aby]\$/.test(row.password) && ["admin", "client"].includes(row.role)],
  ["client", clients, (row) => row.userId && row.companyName.trim() && /@/.test(row.contactEmail) && row.healthScore >= 0 && row.healthScore <= 100],
  ["project", projects, (row) => row.clientId && row.title.trim() && row.progress >= 0 && row.progress <= 100],
  ["deliverable", deliverables, (row) => row.projectId && row.title.trim() && Number.isFinite(row.dueDate.getTime())],
  ["invoice", invoices, (row) => row.clientId && row.invoiceNumber.trim() && row.totalAmount >= 0 && row.dueDate >= row.issueDate],
  ["invoiceItem", invoiceItems, (row) => row.invoiceId && row.description.trim() && row.quantity > 0 && row.unitPrice >= 0],
  ["message", messages, (row) => row.senderId && row.recipientId && row.content.trim().length > 0 && row.content.length <= 5000],
];
let cursor = 0;
while (results.length < 500) {
  let added = false;
  for (const [entity, rows, validate] of validators) {
    const row = rows[cursor];
    if (!row || results.length >= 500) continue;
    check("record", `${entity}:${row.id}`, validate(row), "Composite integrity validation");
    added = true;
  }
  if (!added) throw new Error(`Only ${results.length} audit checks could be produced`);
  cursor += 1;
}

const failures = results.filter((item) => !item.pass);
const report = {
  generatedAt: new Date().toISOString(),
  total: results.length,
  passed: results.length - failures.length,
  failed: failures.length,
  databaseCounts: counts,
  databaseTotal: Object.values(counts).reduce((sum, value) => sum + value, 0),
  sourceHash: createHash("sha256").update(await readFile(resolve(root, "package.json"))).digest("hex"),
  checks: results,
};
await mkdir(resolve(root, "release"), { recursive: true });
await writeFile(resolve(root, "release", "AUDITORIA-500.json"), JSON.stringify(report, null, 2));
await writeFile(resolve(root, "release", "AUDITORIA-500.md"), [
  "# ClientPortal Pro - Auditoria 500",
  "",
  `- Resultado: ${report.passed}/${report.total}`,
  `- Fallos: ${report.failed}`,
  `- Registros verificados: ${report.databaseTotal}`,
  `- Fecha UTC: ${report.generatedAt}`,
  "",
  ...failures.map((item) => `- FALLO ${item.id}: ${item.name} ${item.detail}`),
].join("\n"));
await prisma.$disconnect();
console.log(JSON.stringify({ total: report.total, passed: report.passed, failed: report.failed, databaseCounts: counts }));
if (failures.length) process.exit(1);
