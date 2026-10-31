import {build} from 'esbuild';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
// Install jsdom into a temporary prefix, then pass its lib/api.js path.
// Keeping the harness isolated avoids adding runtime dependencies to the studies.
if (!process.argv[2]) throw new Error('Pass the installed jsdom lib/api.js path (see docs/012-013-second-development-verification.md).');
const { JSDOM, VirtualConsole } = await import(pathToFileURL(process.argv[2]).href);
const repo=fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
async function page(sample, modules){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError', e=>errors.push(e.message));
 const dom=new JSDOM(readFileSync(`${repo}/dist/samples/${sample}/index.html`,'utf8'),{runScripts:'outside-only',url:`https://preview.example/lumpesammlig/samples/${sample}/`,virtualConsole:vc});
 for(const module of modules){const b=await build({entryPoints:[`${repo}/src/samples/${sample}/${module}.ts`],bundle:true,write:false,format:'iife',platform:'browser'});dom.window.eval(b.outputFiles[0].text)}
 eq(errors,[]);return dom;
}
const index=await page('012-impossible-index',['held-place-ui','index']);
const d=index.window.document;const click=s=>d.querySelector(s).click();
const originals=[...d.querySelectorAll('[data-record]')].map(el=>el.querySelector('h3').textContent);
eq(d.querySelector('#held-number').textContent,'IDX-006');
click('#hold-place');eq(d.querySelector('#hold-place').getAttribute('aria-pressed'),'true');
const before=d.querySelector('#neighbour-after .neighbour-id').textContent;
click('[data-filing="vocabulary"]');eq(d.querySelector('#held-number').textContent,'IDX-006');
assert.notEqual(d.querySelector('#neighbour-after .neighbour-id').textContent,before);checks++;
eq(d.querySelectorAll('#filing-rail button').length,8);
click('#hold-place');const pos=d.querySelector('#place-position').textContent;
click('[data-filing="title"]');eq(d.querySelector('#place-position').textContent,pos);
d.querySelector('#filing-rail button').focus();
d.querySelector('#filing-rail').dispatchEvent(new index.window.KeyboardEvent('keydown',{key:'End',bubbles:true}));
eq(d.activeElement.dataset.pick,d.querySelector('#held-number').textContent);eq(d.querySelector('#place-position').textContent,'08 / 08');
d.querySelector('#query').value='refresh expired oauth token';d.querySelector('#index-query').dispatchEvent(new index.window.Event('submit',{bubbles:true,cancelable:true}));
assert.match(d.querySelector('#index-status').textContent,/matching/);checks++;
eq([...d.querySelectorAll('[data-record]')].map(el=>el.querySelector('h3').textContent).sort(),originals.sort());
const board=await page('013-switchboard',['live-desk','switchboard']);
const b=board.window.document;const hit=s=>b.querySelector(s).click();
const voices=[...b.querySelectorAll('.ledger blockquote')].map(el=>el.textContent);
eq(b.querySelector('#capacity-status').textContent,'00 / 02 spaces occupied');
hit('[data-patch="AB"]');eq(b.querySelector('[data-slot="0"]').dataset.phase,'patched');eq(b.activeElement.dataset.open,'0');
hit('[data-open="0"]');eq(b.querySelector('[data-slot="0"]').dataset.phase,'open');eq(b.querySelectorAll('[data-slot="0"] .slot-voices blockquote').length,2);
eq([...b.querySelectorAll('[data-slot="0"] .slot-voices blockquote')].map(el=>el.textContent),[voices[0],voices[1]]);
hit('[data-patch="CD"]');eq(b.querySelector('#capacity-status').textContent,'02 / 02 spaces occupied');
hit('[data-patch="AF"]');eq([...b.querySelectorAll('.slot-title')].map(el=>el.textContent),['A ↔ B','C ↔ D']);assert.match(b.querySelector('#desk-status').textContent,/nothing was replaced/);checks++;
hit('[data-release="0"]');eq(b.querySelector('#capacity-status').textContent,'01 / 02 spaces occupied');eq(b.activeElement.dataset.patch,'AB');
hit('[data-patch="AF"]');eq(b.querySelector('[data-slot="0"] .slot-title').textContent,'A ↔ F');
hit('#clear-desk');eq(b.querySelector('#capacity-status').textContent,'00 / 02 spaces occupied');eq([...b.querySelectorAll('.ledger blockquote')].map(el=>el.textContent),voices);
hit('#unplug-all');eq(b.querySelectorAll('#cables path').length,0);eq([...b.querySelectorAll('.ledger blockquote')].map(el=>el.textContent),voices);
for(const doc of [d,b]){const ids=[...doc.querySelectorAll('[id]')].map(el=>el.id);eq(ids.length,new Set(ids).size)}
console.log(`${checks} DOM integration assertions passed (jsdom; no layout/browser claims).`);
index.window.close();board.window.close();
