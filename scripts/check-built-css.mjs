import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import config from '../astro.config.mjs';

// Inspect the generated artifact, not source imports. The expected Pages mount
// is independent of config.base so a config regression cannot validate itself.
export async function checkBuiltCss({ directory = 'dist', base = '/lumpesammlig/', site = config.site } = {}) {
  const root = resolve(directory);
  const origin = new URL(site).origin;
  const prefix = `/${base.split('/').filter(Boolean).join('/')}/`;
  const htmlFiles = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.html')) htmlFiles.push(path);
    }
  }
  await walk(root);
  if (!htmlFiles.includes(resolve(root, 'index.html'))) throw new Error(`No generated homepage in ${root}`);
  let references = 0;
  const assets = new Set();
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const page = relative(root, file).split(sep).join('/');
    const pageUrl = new URL(prefix + page.replace(/index\.html$/, ''), origin);
    let pageReferences = 0;
    // Astro emits quoted attributes; accept unquoted attributes and reordered rel/href too.
    for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
      const attrs = Object.fromEntries([...tag[0].matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
        .map(([, name, double, single, bare]) => [name.toLowerCase(), double ?? single ?? bare]));
      if (!attrs.rel?.toLowerCase().split(/\s+/).includes('stylesheet')) continue;
      if (!attrs.href) throw new Error(`${page}: stylesheet without href`);
      const url = new URL(attrs.href.replaceAll('&amp;', '&'), pageUrl);
      if (url.origin !== origin || !url.pathname.startsWith(prefix)) {
        throw new Error(`${page}: stylesheet outside GitHub Pages base ${prefix}: ${attrs.href}`);
      }
      const asset = resolve(root, decodeURIComponent(url.pathname.slice(prefix.length)));
      if (!asset.startsWith(root + sep) || !asset.endsWith('.css')) {
        throw new Error(`${page}: invalid CSS asset path: ${attrs.href}`);
      }
      let data;
      try {
        if (!(await stat(asset)).isFile()) throw new Error('not a file');
        data = await readFile(asset, 'utf8');
      } catch (error) {
        throw new Error(`${page}: missing CSS asset ${attrs.href}`, { cause: error });
      }
      if (!data.trim() || /^\s*</.test(data)) throw new Error(`${page}: empty or HTML CSS asset ${attrs.href}`);
      references++; pageReferences++; assets.add(asset);
    }
    if (page === 'index.html' && !pageReferences) throw new Error('Homepage has no generated stylesheet links');
  }
  if (!references) throw new Error('No generated stylesheet references found');
  return { pages: htmlFiles.length, references, assets: assets.size, base: prefix };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await checkBuiltCss();
    console.log(`CSS assets verified: ${result.pages} HTML pages, ${result.references} references, ${result.assets} files under ${result.base}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
