import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

const engine = read('engine.js');
const renderer = read('renderer.js');
const game = read('game.js');
const index = read('index.html');
const llm = read('llm.js');
const readme = read('README.md');
const publicSource = [
  'index.html',
  'engine.js',
  'renderer.js',
  'game.js',
  'llm.js',
  'README.md',
  exists('mystore.js') ? 'mystore.js' : null
].filter(Boolean).map(read).join('\n');

assert.match(engine, /mylist:\s*\[\]/, 'Engine.state should persist the player reading list');
assert.match(renderer, /res-mylist/, 'recommendation result should expose a mylist action');
assert.match(renderer, /我也想读这本书/, 'result action copy should be player-facing');
assert.match(index, /id="mystore-screen"/, 'index should contain the My Store screen');
assert.match(index, /id="btn-mystore"/, 'game top bar should expose My Store as a progress page');
assert.match(index, /src="mystore\.js(?:\?[^"]*)?"/, 'index should load mystore.js');
assert.doesNotMatch(index, /demo-key\.local\.js/, 'the browser should not load a local API key file');
assert.match(index, /id="demo-toolbar"/, 'index should contain a demo toolbar for live judging');
assert.match(index, /id="demo-toggle"/, 'demo toolbar should be collapsible');
assert.match(index, /demo-toolbar hidden collapsed/, 'demo toolbar should default to collapsed so it does not block the UI');
assert.match(index, /demo-show-ending/, 'demo toolbar should jump to ending');
assert.match(index, /demo-open-mystore/, 'demo toolbar should jump to My Store');
assert.ok(exists('mystore.js'), 'mystore.js should exist');

const mystore = read('mystore.js');
assert.match(mystore, /var MyStore\s*=/, 'mystore.js should expose global MyStore');
assert.match(mystore, /open:\s*function/, 'MyStore should have an open entry point');
assert.match(mystore, /copyReadingList:\s*function/, 'MyStore should copy the real reading list');
assert.match(mystore, /showReply:\s*function/, 'MyStore should show one-month-later replies');
assert.match(mystore, /我想读的书/, 'My Store page should include the reading-list section');
assert.match(mystore, /游戏不是终点/, 'My Store page should carry the real-reading bridge narrative');

assert.match(llm, /generateReply/, 'LLM should expose a reply-generation API with fallback');
assert.match(game, /MyStore\.open/, 'ending flow should offer or open the My Store experience');
assert.match(game, /btn-mystore/, 'Game should bind the always-available My Store button');
assert.match(game, /_seedDemoJourney/, 'Game should seed a short demo journey');
assert.match(llm, /['"]\/api\/chat['"]/, 'LLM should use the server-side AI proxy');
assert.doesNotMatch(game, /tlb_llm_api_key|TLB_LLM_API_KEY/, 'Game should not store AI keys in the browser');
assert.doesNotMatch(index, /demo-set-key|demo-clear-key/, 'Demo controls should not ask judges for an API key');
assert.match(readme, /我的书店|待读清单|真实阅读/, 'README should describe the new contest-facing feature');
assert.doesNotMatch(publicSource, /sk-(?:api-)?[A-Za-z0-9_-]{16,}/, 'public source should not contain hard-coded API keys');
assert.ok(read('.gitignore').includes('demo-key.local.js'), 'local demo key file should be gitignored');

console.log('mystore contract ok');
