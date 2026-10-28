import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkBuiltCss } from './check-built-css.mjs';

async function fixture(t, html, css = 'body{color:red}') {
  const directory = await mkdtemp(join(tmpdir(), 'lumpesammlig-css-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, '_astro'));
  await writeFile(join(directory, 'index.html'), html);
  if (css !== null) await writeFile(join(directory, '_astro', 'index.hash.css'), css);
  return { directory, base: '/lumpesammlig', site: 'https://blackmath88.github.io' };
}
const link = href => `<link rel="stylesheet" href="${href}">`;
test('accepts existing generated assets beneath the project base, including nested pages', async t => {
  const options = await fixture(t, link('/lumpesammlig/_astro/index.hash.css'));
  await mkdir(join(options.directory, 'samples', 'study'), { recursive: true });
  await writeFile(join(options.directory, 'samples', 'study', 'index.html'), "<link href='../../_astro/index.hash.css' rel='stylesheet'>");
  assert.deepEqual(await checkBuiltCss(options), { pages: 2, references: 2, assets: 1, base: '/lumpesammlig/' });
});
for (const [name, html, css, message] of [
  ['missing emitted asset', link('/lumpesammlig/_astro/index.hash.css'), null, /missing CSS asset/],
  ['root path missing project prefix', link('/_astro/index.hash.css'), 'body{}', /outside GitHub Pages base/],
  ['duplicated project prefix', link('/lumpesammlig/lumpesammlig/_astro/index.hash.css'), 'body{}', /missing CSS asset/],
  ['HTML fallback masquerading as CSS', link('/lumpesammlig/_astro/index.hash.css'), '<!doctype html>', /HTML CSS asset/],
  ['empty stylesheet', link('/lumpesammlig/_astro/index.hash.css'), '', /empty or HTML/],
  ['homepage losing its stylesheet link', '<h1>Unstyled</h1>', 'body{}', /no generated stylesheet/],
]) test(`rejects ${name}`, async t => {
  await assert.rejects(checkBuiltCss(await fixture(t, html, css)), message);
});
