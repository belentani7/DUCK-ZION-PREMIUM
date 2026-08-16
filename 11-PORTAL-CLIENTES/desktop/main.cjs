const { app, BrowserWindow, dialog, shell } = require("electron");
const { spawn } = require("node:child_process");
const { copyFileSync, existsSync, mkdirSync, createWriteStream } = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { Server } = require("socket.io");

let webProcess;
let chatServer;

function waitForServer(url, attempts = 80) {
  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) resolve();
        else retry();
      });
      request.on("error", retry);
      request.setTimeout(1000, () => request.destroy());
    };
    const retry = () => {
      if (--attempts <= 0) reject(new Error(`Servidor no disponible: ${url}`));
      else setTimeout(check, 250);
    };
    check();
  });
}

function startChatServer() {
  const httpServer = http.createServer();
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });
  const userSockets = new Map();

  io.on("connection", (socket) => {
    socket.on("register", (userId) => userSockets.set(userId, socket.id));
    socket.on("send-message", ({ message, recipientId }) => {
      const recipient = userSockets.get(recipientId);
      if (recipient) io.to(recipient).emit("new-message", message);
    });
    socket.on("typing", ({ userId, recipientId, isTyping }) => {
      const recipient = userSockets.get(recipientId);
      if (recipient) io.to(recipient).emit("user-typing", { userId, isTyping });
    });
    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSockets) {
        if (socketId === socket.id) userSockets.delete(userId);
      }
    });
  });

  httpServer.on("error", (error) => {
    if (error.code !== "EADDRINUSE") console.error(error);
  });
  httpServer.listen(3004, "127.0.0.1");
  return httpServer;
}

function startWebServer() {
  const resources = process.resourcesPath;
  const webRoot = path.join(resources, "web");
  const dataRoot = path.join(app.getPath("userData"), "data");
  const database = path.join(dataRoot, "clientportal.db");
  const seed = path.join(resources, "seed", "custom.db");
  mkdirSync(dataRoot, { recursive: true });
  if (!existsSync(database)) copyFileSync(seed, database);

  const log = createWriteStream(path.join(app.getPath("userData"), "server.log"), { flags: "a" });
  webProcess = spawn(process.execPath, [path.join(webRoot, "server.js")], {
    cwd: webRoot,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      HOSTNAME: "127.0.0.1",
      PORT: "3210",
      DATABASE_URL: `file:${database.replaceAll("\\", "/")}`,
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  webProcess.stdout.pipe(log);
  webProcess.stderr.pipe(log);
}

async function createWindow() {
  startWebServer();
  chatServer = startChatServer();
  try {
    await waitForServer("http://127.0.0.1:3210/api");
  } catch (error) {
    dialog.showErrorBox("ClientPortal Pro", `${error.message}\nRevisa server.log en los datos de la aplicacion.`);
    app.quit();
    return;
  }

  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#07120d",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  window.once("ready-to-show", () => window.show());
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("http://127.0.0.1:3210")) event.preventDefault();
  });
  await window.loadURL("http://127.0.0.1:3210");
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.whenReady().then(createWindow);
  app.on("window-all-closed", () => app.quit());
  app.on("before-quit", () => {
    if (webProcess && !webProcess.killed) webProcess.kill();
    if (chatServer) chatServer.close();
  });
}
