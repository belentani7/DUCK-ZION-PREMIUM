import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = process.cwd();
const android = resolve(root, "android");
const sdk = process.env.ANDROID_HOME || "C:\\Users\\USER\\AppData\\Local\\Android\\Sdk";
const javaHome = process.env.JAVA_HOME || "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.20.8-hotspot";
const gradle = resolve(android, "gradlew.bat");

for (const [label, path] of [["Android SDK", sdk], ["JDK", javaHome], ["Gradle wrapper", gradle]]) {
  if (!existsSync(path)) throw new Error(`${label} no encontrado: ${path}`);
}

await writeFile(resolve(android, "local.properties"), `sdk.dir=${sdk.replaceAll("\\", "\\\\")}\n`);
const result = spawnSync(gradle, ["assembleDebug", "--no-daemon", "--stacktrace"], {
  cwd: android,
  env: { ...process.env, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk, JAVA_HOME: javaHome },
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status || 1);

const source = resolve(android, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const output = resolve(root, "release", "android", "ClientPortal-Pro.apk");
if (!existsSync(source)) throw new Error(`APK no generado: ${source}`);
await mkdir(resolve(root, "release", "android"), { recursive: true });
await copyFile(source, output);
console.log(output);
