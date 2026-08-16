import { writeFile } from 'node:fs/promises';

const baseUrl = 'http://127.0.0.1:3000';
const debugUrl = 'http://127.0.0.1:9222/json';

async function login(email, password) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Login failed for ${email}: ${response.status}`);
  return response.json();
}

async function connectCdp() {
  const targets = await fetch(debugUrl).then((response) => response.json());
  const target = targets.find((item) => item.type === 'page');
  if (!target) throw new Error('Chrome page target not found');

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let commandId = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

  return { socket, send };
}

async function evaluate(send, expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function captureRole(send, credentials, outputPath, expectedText) {
  const session = await login(credentials.email, credentials.password);
  await evaluate(send, `localStorage.setItem('portal_token', ${JSON.stringify(session.token)}); location.reload()`);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const state = await evaluate(send, `JSON.stringify({
    text: document.body.innerText,
    overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay')),
    title: document.title
  })`);
  const parsed = JSON.parse(state);
  if (parsed.overlay) throw new Error(`${credentials.email}: framework error overlay detected`);
  if (!parsed.text.includes(expectedText)) {
    throw new Error(`${credentials.email}: expected text not found: ${expectedText}`);
  }

  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  await writeFile(outputPath, Buffer.from(screenshot.data, 'base64'));
  return { email: credentials.email, title: parsed.title, expectedText };
}

const { socket, send } = await connectCdp();
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', { url: baseUrl });
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const admin = await captureRole(
    send,
    { email: 'admin@portal.com', password: 'Admin123!' },
    'portal-admin.png',
    'Dashboard'
  );
  const client = await captureRole(
    send,
    { email: 'maria@techcorp.com', password: 'Cliente123!' },
    'portal-client.png',
    'María'
  );
  console.log(JSON.stringify({ admin, client }));
} finally {
  socket.close();
}
