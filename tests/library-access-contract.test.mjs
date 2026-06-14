import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

const index = read('index.html');
const game = read('game.js');
const renderer = read('renderer.js');
const readme = read('README.md');

assert.match(index, /id="btn-library"/, 'top bar should expose a free library button');
assert.match(index, /title="打开书库"/, 'free library button should be understandable');
assert.match(game, /openLibrary:\s*function/, 'Game should expose a free library entry point');
assert.match(game, /btn-library/, 'Game should bind the free library button');
assert.match(game, /freeBrowse:\s*true/, 'free library should open bookshelf in browse mode');
assert.match(renderer, /freeBrowse/, 'Renderer should understand browse-only bookshelf mode');
assert.match(renderer, /自由书库/, 'free browse mode should label the library differently from recommendation flow');
assert.match(renderer, /沉浸式剧场推荐/, 'free library should feature theater-enabled books at the top');
assert.match(renderer, /bk-featured-card[\s\S]*BookTheater\.open/, 'featured theater cards should open the immersive theater directly');
assert.match(renderer, /bk-theater-mark/, 'theater-enabled books should be visibly marked in the grid');
assert.match(renderer, /bookWorld/, 'free library should prioritize books with book worlds');
assert.match(renderer, /confirmHtml/, 'book detail should hide recommendation action when there is no confirm callback');
assert.match(readme, /自由书库|书中剧场/, 'README should explain the always-available library entry');

console.log('library access contract ok');
