// Regenerates the still posters the collecting table uses as specimen faces.
// Usage (needs Playwright with Chromium available, it is not a project dependency):
//   npm run build && npm run preview   # in one terminal
//   node scripts/capture-posters.mjs   # in another
// Each poster is the sample's own gallery preview, captured as-is and cropped
// slightly inside its rotated frame. Nothing is retouched.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321/lumpesammlig';
const OUT = new URL('../public/samples/posters/', import.meta.url);
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/`);
const ids = await page.$$eval('a.sample', (as) => as.map((a) => a.dataset.sample));

for (const id of ids) {
  const el = await page.$(`a.sample[data-sample="${id}"] .preview`);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  await page.evaluate(() => document.querySelectorAll('.enter').forEach((e) => (e.style.visibility = 'hidden')));
  const box = await el.boundingBox();
  const inset = Math.min(box.width, box.height) * 0.035;
  await page.screenshot({
    path: new URL(`${id}.webp`, OUT).pathname.replace(/\.webp$/, '.png'),
    clip: { x: box.x + inset, y: box.y + inset, width: box.width - inset * 2, height: box.height - inset * 2 }
  });
  console.log('captured', id);
}
await browser.close();
console.log('PNG posters written. Convert to WebP (max 1024 px, quality ~82) before committing, e.g. with cwebp or sharp.');
