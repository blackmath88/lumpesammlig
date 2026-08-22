import { writeFile } from 'node:fs/promises';

const [port, width, height, output] = process.argv.slice(2);
await new Promise((resolve) => setTimeout(resolve, 1400));
const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const target = targets.find((candidate) => candidate.type === 'page' && candidate.url.includes('127.0.0.1'));
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
let id = 0;
const waiting = new Map();
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  const pending = waiting.get(message.id);
  if (!pending) return;
  waiting.delete(message.id);
  message.error ? pending.reject(message.error) : pending.resolve(message.result);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const messageId = ++id;
  waiting.set(messageId, { resolve, reject });
  socket.send(JSON.stringify({ id: messageId, method, params }));
});
await send('Emulation.setDeviceMetricsOverride', { width: Number(width), height: Number(height), deviceScaleFactor: 1, mobile: Number(width) < 700 });
await send('Runtime.evaluate', { expression: 'scrollTo(0, 0)' });
await new Promise((resolve) => setTimeout(resolve, 900));
const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
await writeFile(output, Buffer.from(screenshot.data, 'base64'));
socket.close();
setTimeout(() => process.exit(0), 100);
